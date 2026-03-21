package repository

import (
	"context"
	"fmt"
	"time"

	"exponat/dashboard/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DashboardRepository struct {
	pool *pgxpool.Pool
}

func NewDashboardRepository(pool *pgxpool.Pool) *DashboardRepository {
	return &DashboardRepository{pool: pool}
}

func (r *DashboardRepository) GetStats(ctx context.Context, orgID string) (*models.DashboardStats, error) {
	if orgID == "" {
		return nil, fmt.Errorf("invalid organization id")
	}

	var activeCount int
	var totalBudget float64
	var exhibitsCount int
	var participantsCount int

	q := `
SELECT
  COALESCE(active_projects_count, 0),
  COALESCE(total_budget_sum, 0),
  COALESCE(exhibits_count, 0),
  COALESCE(participants_count, 0)
FROM dashboard_stats
WHERE organization_id = $1::uuid
`
	err := r.pool.QueryRow(ctx, q, orgID).Scan(&activeCount, &totalBudget, &exhibitsCount, &participantsCount)
	if err != nil {
		return nil, fmt.Errorf("query dashboard_stats: %w", err)
	}

	apCh, err := r.changeRatio(ctx, orgID, `
SELECT COUNT(*)::float FROM projects
WHERE organization_id = $1::uuid AND status = 'active'
  AND created_at >= NOW() - INTERVAL '30 days'`,
		`
SELECT COUNT(*)::float FROM projects
WHERE organization_id = $1::uuid AND status = 'active'
  AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'`)
	if err != nil {
		apCh = 0
	}

	budgetCh, err := r.sumChangeRatio(ctx, orgID)
	if err != nil {
		budgetCh = 0
	}

	exCh, err := r.changeRatio(ctx, orgID, `
SELECT COUNT(*)::float FROM exhibits e
JOIN projects p ON e.project_id = p.id
WHERE p.organization_id = $1::uuid
  AND e.created_at >= NOW() - INTERVAL '30 days'`,
		`
SELECT COUNT(*)::float FROM exhibits e
JOIN projects p ON e.project_id = p.id
WHERE p.organization_id = $1::uuid
  AND e.created_at >= NOW() - INTERVAL '60 days' AND e.created_at < NOW() - INTERVAL '30 days'`)
	if err != nil {
		exCh = 0
	}

	ptCh, err := r.changeRatio(ctx, orgID, `
SELECT COUNT(*)::float FROM participants pt
JOIN projects p ON pt.project_id = p.id
WHERE p.organization_id = $1::uuid
  AND pt.created_at >= NOW() - INTERVAL '30 days'`,
		`
SELECT COUNT(*)::float FROM participants pt
JOIN projects p ON pt.project_id = p.id
WHERE p.organization_id = $1::uuid
  AND pt.created_at >= NOW() - INTERVAL '60 days' AND pt.created_at < NOW() - INTERVAL '30 days'`)
	if err != nil {
		ptCh = 0
	}

	out := &models.DashboardStats{}
	out.ActiveProjects.Count = activeCount
	out.ActiveProjects.Change = apCh
	out.TotalBudget.Amount = totalBudget
	out.TotalBudget.Currency = "RUB"
	out.TotalBudget.Change = budgetCh
	out.Exhibits.Count = exhibitsCount
	out.Exhibits.Change = exCh
	out.Participants.Count = participantsCount
	out.Participants.Change = ptCh

	return out, nil
}

func (r *DashboardRepository) changeRatio(ctx context.Context, orgID, curSQL, prevSQL string) (float64, error) {
	var cur, prev float64
	if err := r.pool.QueryRow(ctx, curSQL, orgID).Scan(&cur); err != nil {
		return 0, err
	}
	if err := r.pool.QueryRow(ctx, prevSQL, orgID).Scan(&prev); err != nil {
		return 0, err
	}
	if prev == 0 {
		if cur == 0 {
			return 0, nil
		}
		return 100, nil
	}
	return ((cur - prev) / prev) * 100, nil
}

func (r *DashboardRepository) sumChangeRatio(ctx context.Context, orgID string) (float64, error) {
	var cur, prev float64
	err := r.pool.QueryRow(ctx, `
SELECT COALESCE(SUM(b.planned_amount), 0)::float FROM budget_monthly b
WHERE b.organization_id = $1::uuid AND b.month >= date_trunc('month', NOW()) - INTERVAL '2 months'
  AND b.month < date_trunc('month', NOW())`, orgID).Scan(&cur)
	if err != nil {
		return 0, err
	}
	err = r.pool.QueryRow(ctx, `
SELECT COALESCE(SUM(b.planned_amount), 0)::float FROM budget_monthly b
WHERE b.organization_id = $1::uuid AND b.month >= date_trunc('month', NOW()) - INTERVAL '4 months'
  AND b.month < date_trunc('month', NOW()) - INTERVAL '2 months'`, orgID).Scan(&prev)
	if err != nil {
		return 0, err
	}
	if prev == 0 {
		if cur == 0 {
			return 0, nil
		}
		return 12, nil
	}
	return ((cur - prev) / prev) * 100, nil
}

func (r *DashboardRepository) GetRecentProjects(ctx context.Context, orgID string, limit int) ([]models.DashboardProject, error) {
	if orgID == "" {
		return nil, fmt.Errorf("invalid organization id")
	}
	if limit <= 0 || limit > 50 {
		limit = 5
	}

	q := `
SELECT id, name, status::text, start_date, end_date, total_budget, team_size, created_at
FROM projects
WHERE organization_id = $1::uuid
ORDER BY created_at DESC
LIMIT $2
`
	rows, err := r.pool.Query(ctx, q, orgID, limit)
	if err != nil {
		return nil, fmt.Errorf("recent projects: %w", err)
	}
	defer rows.Close()

	var list []models.DashboardProject
	for rows.Next() {
		var p models.DashboardProject
		var start, end time.Time
		var created time.Time
		if err := rows.Scan(&p.ID, &p.Name, &p.Status, &start, &end, &p.TotalBudget, &p.TeamSize, &created); err != nil {
			return nil, err
		}
		p.StartDate = start.UTC().Format(time.RFC3339)
		p.EndDate = end.UTC().Format(time.RFC3339)
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *DashboardRepository) GetBudgetTrend(ctx context.Context, orgID string, months int) ([]models.BudgetTrendRow, error) {
	if orgID == "" {
		return nil, fmt.Errorf("invalid organization id")
	}
	if months <= 0 || months > 24 {
		months = 6
	}

	q := `
SELECT
  CASE EXTRACT(MONTH FROM b.month)::int
    WHEN 1 THEN 'Янв' WHEN 2 THEN 'Фев' WHEN 3 THEN 'Мар' WHEN 4 THEN 'Апр'
    WHEN 5 THEN 'Май' WHEN 6 THEN 'Июн' WHEN 7 THEN 'Июл' WHEN 8 THEN 'Авг'
    WHEN 9 THEN 'Сен' WHEN 10 THEN 'Окт' WHEN 11 THEN 'Ноя' ELSE 'Дек'
  END AS month_label,
  COALESCE(SUM(b.planned_amount), 0),
  COALESCE(SUM(b.actual_amount), 0)
FROM budget_monthly b
WHERE b.organization_id = $1::uuid
  AND b.month >= date_trunc('month', NOW()) - ($2::int * INTERVAL '1 month')
  AND b.month <= date_trunc('month', NOW())
GROUP BY b.month
ORDER BY b.month ASC
`
	rows, err := r.pool.Query(ctx, q, orgID, months)
	if err != nil {
		return nil, fmt.Errorf("budget trend: %w", err)
	}
	defer rows.Close()

	var out []models.BudgetTrendRow
	for rows.Next() {
		var row models.BudgetTrendRow
		if err := rows.Scan(&row.Month, &row.Planned, &row.Actual); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (r *DashboardRepository) GetUpcomingEvents(ctx context.Context, orgID string) ([]models.Event, error) {
	if orgID == "" {
		return nil, fmt.Errorf("invalid organization id")
	}

	q := `
SELECT id::text, project_id::text, type::text, title, COALESCE(location, ''), event_date
FROM events
WHERE organization_id = $1::uuid AND event_date >= NOW()
ORDER BY event_date ASC
LIMIT 10
`
	rows, err := r.pool.Query(ctx, q, orgID)
	if err != nil {
		return nil, fmt.Errorf("upcoming events: %w", err)
	}
	defer rows.Close()

	var out []models.Event
	for rows.Next() {
		var e models.Event
		var when time.Time
		if err := rows.Scan(&e.ID, &e.ProjectID, &e.Type, &e.Title, &e.Location, &when); err != nil {
			return nil, err
		}
		e.Date = when.UTC().Format(time.RFC3339)
		out = append(out, e)
	}
	return out, rows.Err()
}

func (r *DashboardRepository) GetActivity(ctx context.Context, orgID string, limit int) ([]models.Activity, error) {
	if orgID == "" {
		return nil, fmt.Errorf("invalid organization id")
	}
	if limit <= 0 || limit > 100 {
		limit = 10
	}

	q := `
SELECT
  a.id::text,
  a.action,
  a.entity_type,
  a.entity_id::text,
  a.created_at,
  u.id::text,
  u.name,
  COALESCE(u.avatar, '')
FROM activity_log a
JOIN users u ON u.id = a.user_id
WHERE a.organization_id = $1::uuid
ORDER BY a.created_at DESC
LIMIT $2
`
	rows, err := r.pool.Query(ctx, q, orgID, limit)
	if err != nil {
		return nil, fmt.Errorf("activity: %w", err)
	}
	defer rows.Close()

	var out []models.Activity
	for rows.Next() {
		var a models.Activity
		var when time.Time
		if err := rows.Scan(&a.ID, &a.Action, &a.EntityType, &a.EntityID, &when, &a.UserID, &a.UserName, &a.UserAvatar); err != nil {
			return nil, err
		}
		if a.UserAvatar == "" {
			a.UserAvatar = ""
		}
		a.Timestamp = when.UTC().Format(time.RFC3339)
		out = append(out, a)
	}
	return out, rows.Err()
}
