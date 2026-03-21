package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"exponat/projects/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type ProjectRepository struct {
	pool *pgxpool.Pool
}

func NewProjectRepository(pool *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{pool: pool}
}

func (r *ProjectRepository) List(ctx context.Context, orgID string, f models.ProjectFilters) ([]models.Project, int, error) {
	if orgID == "" {
		return nil, 0, fmt.Errorf("organization id required")
	}
	page := f.Page
	if page <= 0 {
		page = 1
	}
	limit := f.Limit
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	where := []string{"p.organization_id = $1"}
	args := []any{orgID}
	arg := 2

	if f.Search != "" {
		where = append(where, fmt.Sprintf("(p.name ILIKE $%d OR p.description ILIKE $%d)", arg, arg))
		args = append(args, "%"+f.Search+"%")
		arg++
	}
	if len(f.Status) > 0 {
		where = append(where, fmt.Sprintf("p.status = ANY($%d::text[])", arg))
		args = append(args, f.Status)
		arg++
	}
	if len(f.Type) > 0 {
		where = append(where, fmt.Sprintf("p.type = ANY($%d::text[])", arg))
		args = append(args, f.Type)
		arg++
	}
	if f.DateFrom != "" {
		where = append(where, fmt.Sprintf("p.end_date >= $%d::date", arg))
		args = append(args, f.DateFrom)
		arg++
	}
	if f.DateTo != "" {
		where = append(where, fmt.Sprintf("p.start_date <= $%d::date", arg))
		args = append(args, f.DateTo)
		arg++
	}
	if f.BudgetMin != nil {
		where = append(where, fmt.Sprintf("p.total_budget >= $%d", arg))
		args = append(args, *f.BudgetMin)
		arg++
	}
	if f.BudgetMax != nil {
		where = append(where, fmt.Sprintf("p.total_budget <= $%d", arg))
		args = append(args, *f.BudgetMax)
		arg++
	}
	if f.ManagerID != "" {
		where = append(where, fmt.Sprintf("p.manager_id = $%d::uuid", arg))
		args = append(args, f.ManagerID)
		arg++
	}

	whereSQL := strings.Join(where, " AND ")

	countQ := `SELECT COUNT(*) FROM projects p WHERE ` + whereSQL
	var total int
	if err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count projects: %w", err)
	}

	sortCol := "p.created_at"
	switch f.SortBy {
	case "name":
		sortCol = "p.name"
	case "startDate":
		sortCol = "p.start_date"
	case "endDate":
		sortCol = "p.end_date"
	case "totalBudget":
		sortCol = "p.total_budget"
	case "progress":
		sortCol = "p.progress"
	case "updatedAt":
		sortCol = "p.updated_at"
	}
	order := "DESC"
	if strings.EqualFold(f.SortOrder, "asc") {
		order = "ASC"
	}

	listQ := fmt.Sprintf(`
SELECT
  p.id, p.organization_id, p.name, p.description, p.type::text, p.status::text,
  p.start_date, p.end_date, p.created_at, p.updated_at,
  p.total_budget, p.spent_budget, p.currency, p.location,
  p.manager_id, COALESCE(u.name, ''), p.progress, p.exhibits_count, p.participants_count,
  COALESCE(p.tags, '{}'), COALESCE(p.custom_fields, '{}'::jsonb)
FROM projects p
LEFT JOIN users u ON u.id = p.manager_id
WHERE %s
ORDER BY %s %s
LIMIT $%d OFFSET $%d`, whereSQL, sortCol, order, arg, arg+1)

	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, listQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list projects: %w", err)
	}
	defer rows.Close()

	var out []models.Project
	for rows.Next() {
		p, err := scanProjectRow(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, p)
	}
	return out, total, rows.Err()
}

func scanProjectRow(row pgx.Row) (models.Project, error) {
	var p models.Project
	var start, end, created, updated time.Time
	var loc []byte
	var custom []byte
	var tags []string

	err := row.Scan(
		&p.ID, &p.OrganizationID, &p.Name, &p.Description, &p.Type, &p.Status,
		&start, &end, &created, &updated,
		&p.TotalBudget, &p.SpentBudget, &p.Currency, &loc,
		&p.ManagerID, &p.ManagerName, &p.Progress, &p.ExhibitsCount, &p.ParticipantsCount,
		&tags, &custom,
	)
	if err != nil {
		return p, err
	}
	p.StartDate = start.Format("2006-01-02")
	p.EndDate = end.Format("2006-01-02")
	p.CreatedAt = created.UTC().Format(time.RFC3339)
	p.UpdatedAt = updated.UTC().Format(time.RFC3339)
	if len(loc) > 0 {
		_ = json.Unmarshal(loc, &p.Location)
	}
	p.Tags = tags
	if len(custom) > 0 {
		p.CustomFields = custom
	}
	return p, nil
}

func (r *ProjectRepository) GetByID(ctx context.Context, projectID, orgID string) (*models.Project, error) {
	q := `
SELECT
  p.id, p.organization_id, p.name, p.description, p.type::text, p.status::text,
  p.start_date, p.end_date, p.created_at, p.updated_at,
  p.total_budget, p.spent_budget, p.currency, p.location,
  p.manager_id, COALESCE(u.name, ''), p.progress, p.exhibits_count, p.participants_count,
  COALESCE(p.tags, '{}'), COALESCE(p.custom_fields, '{}'::jsonb)
FROM projects p
LEFT JOIN users u ON u.id = p.manager_id
WHERE p.id = $1::uuid AND p.organization_id = $2::uuid
`
	row := r.pool.QueryRow(ctx, q, projectID, orgID)
	p, err := scanProjectRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *ProjectRepository) GetTeam(ctx context.Context, projectID string) ([]models.TeamMember, error) {
	q := `
SELECT t.user_id, COALESCE(u.name, ''), COALESCE(u.avatar, ''), t.role::text,
       COALESCE(t.permissions::text, '[]'), t.joined_at
FROM project_team t
JOIN users u ON u.id = t.user_id
WHERE t.project_id = $1::uuid
ORDER BY t.joined_at ASC
`
	rows, err := r.pool.Query(ctx, q, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.TeamMember
	for rows.Next() {
		var m models.TeamMember
		var permText string
		var joined time.Time
		if err := rows.Scan(&m.UserID, &m.UserName, &m.UserAvatar, &m.Role, &permText, &joined); err != nil {
			return nil, err
		}
		_ = json.Unmarshal([]byte(permText), &m.Permissions)
		if m.Permissions == nil {
			m.Permissions = []string{}
		}
		m.JoinedAt = joined.UTC().Format(time.RFC3339)
		out = append(out, m)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) GetPhases(ctx context.Context, projectID string) ([]models.ProjectPhase, error) {
	q := `
SELECT id, project_id, name, COALESCE(description, ''), start_date, end_date, status::text, progress,
       COALESCE(dependencies, '{}'), order_num
FROM project_phases
WHERE project_id = $1::uuid
ORDER BY order_num ASC, start_date ASC
`
	rows, err := r.pool.Query(ctx, q, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.ProjectPhase
	for rows.Next() {
		var ph models.ProjectPhase
		var start, end time.Time
		var deps []uuid.UUID
		if err := rows.Scan(&ph.ID, &ph.ProjectID, &ph.Name, &ph.Description, &start, &end, &ph.Status, &ph.Progress, &deps, &ph.OrderNum); err != nil {
			return nil, err
		}
		ph.StartDate = start.Format("2006-01-02")
		ph.EndDate = end.Format("2006-01-02")
		for _, d := range deps {
			ph.Dependencies = append(ph.Dependencies, d.String())
		}
		out = append(out, ph)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) GetChanges(ctx context.Context, projectID string, limit int) ([]models.ProjectChange, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	q := `
SELECT c.id, c.project_id, c.user_id, COALESCE(u.name, ''), c.change_type, COALESCE(c.field_name, ''),
       COALESCE(c.old_value, ''), COALESCE(c.new_value, ''), c.created_at
FROM project_changes c
LEFT JOIN users u ON u.id = c.user_id
WHERE c.project_id = $1::uuid
ORDER BY c.created_at DESC
LIMIT $2
`
	rows, err := r.pool.Query(ctx, q, projectID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.ProjectChange
	for rows.Next() {
		var c models.ProjectChange
		var when time.Time
		if err := rows.Scan(&c.ID, &c.ProjectID, &c.UserID, &c.UserName, &c.ChangeType, &c.FieldName, &c.OldValue, &c.NewValue, &when); err != nil {
			return nil, err
		}
		c.CreatedAt = when.UTC().Format(time.RFC3339)
		out = append(out, c)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) Create(ctx context.Context, orgID, actorUserID string, in models.ProjectCreateInput) (*models.Project, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, `SELECT set_config('app.current_user_id', $1, true)`, actorUserID); err != nil {
		return nil, err
	}

	locJSON, err := json.Marshal(in.Location)
	if err != nil {
		return nil, err
	}

	pid := uuid.NewString()
	status := models.StatusDraft

	q := `
INSERT INTO projects (
  id, organization_id, name, description, type, status,
  start_date, end_date, total_budget, spent_budget, currency, location,
  manager_id, progress, exhibits_count, participants_count, tags, team_size
) VALUES (
  $1::uuid, $2::uuid, $3, $4, $5, $6,
  $7::date, $8::date, $9, 0, 'RUB', $10::jsonb,
  $11::uuid, 0,
  (SELECT COUNT(*)::int FROM exhibits e WHERE e.project_id = $1::uuid),
  (SELECT COUNT(*)::int FROM participants pt WHERE pt.project_id = $1::uuid),
  '{}', 0
)
`
	_, err = tx.Exec(ctx, q,
		pid, orgID, in.Name, in.Description, in.Type, status,
		in.StartDate, in.EndDate, in.TotalBudget, locJSON,
		in.ManagerID,
	)
	if err != nil {
		return nil, err
	}

	// manager в команде
	_, err = tx.Exec(ctx, `
INSERT INTO project_team (project_id, user_id, role, permissions)
VALUES ($1::uuid, $2::uuid, 'manager', '["edit","delete","manage_team"]'::jsonb)
ON CONFLICT (project_id, user_id) DO NOTHING
`, pid, in.ManagerID)
	if err != nil {
		return nil, err
	}

	seen := map[string]bool{in.ManagerID: true}
	for _, uid := range in.TeamMemberIDs {
		if uid == "" || seen[uid] {
			continue
		}
		seen[uid] = true
		_, err = tx.Exec(ctx, `
INSERT INTO project_team (project_id, user_id, role, permissions)
VALUES ($1::uuid, $2::uuid, 'coordinator', '["edit"]'::jsonb)
ON CONFLICT (project_id, user_id) DO NOTHING
`, pid, uid)
		if err != nil {
			return nil, err
		}
	}

	_, err = tx.Exec(ctx, `
UPDATE projects SET team_size = (SELECT COUNT(*)::int FROM project_team t WHERE t.project_id = $1::uuid)
WHERE id = $1::uuid
`, pid)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetByID(ctx, pid, orgID)
}

func (r *ProjectRepository) Update(ctx context.Context, orgID, actorUserID, projectID string, in models.ProjectUpdateInput) (*models.Project, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, `SELECT set_config('app.current_user_id', $1, true)`, actorUserID); err != nil {
		return nil, err
	}

	var exists string
	err = tx.QueryRow(ctx, `SELECT id::text FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, projectID, orgID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	sets := []string{}
	args := []any{}
	n := 1

	if in.Name != nil {
		sets = append(sets, fmt.Sprintf("name = $%d", n))
		args = append(args, *in.Name)
		n++
	}
	if in.Description != nil {
		sets = append(sets, fmt.Sprintf("description = $%d", n))
		args = append(args, *in.Description)
		n++
	}
	if in.Type != nil {
		sets = append(sets, fmt.Sprintf("type = $%d", n))
		args = append(args, *in.Type)
		n++
	}
	if in.Status != nil {
		sets = append(sets, fmt.Sprintf("status = $%d", n))
		args = append(args, *in.Status)
		n++
	}
	if in.StartDate != nil {
		sets = append(sets, fmt.Sprintf("start_date = $%d::date", n))
		args = append(args, *in.StartDate)
		n++
	}
	if in.EndDate != nil {
		sets = append(sets, fmt.Sprintf("end_date = $%d::date", n))
		args = append(args, *in.EndDate)
		n++
	}
	if in.TotalBudget != nil {
		sets = append(sets, fmt.Sprintf("total_budget = $%d", n))
		args = append(args, *in.TotalBudget)
		n++
	}
	if in.SpentBudget != nil {
		sets = append(sets, fmt.Sprintf("spent_budget = $%d", n))
		args = append(args, *in.SpentBudget)
		n++
	}
	if in.Location != nil {
		b, err := json.Marshal(*in.Location)
		if err != nil {
			return nil, err
		}
		sets = append(sets, fmt.Sprintf("location = $%d::jsonb", n))
		args = append(args, b)
		n++
	}
	if in.ManagerID != nil {
		sets = append(sets, fmt.Sprintf("manager_id = $%d::uuid", n))
		args = append(args, *in.ManagerID)
		n++
	}
	if in.Progress != nil {
		sets = append(sets, fmt.Sprintf("progress = $%d", n))
		args = append(args, *in.Progress)
		n++
	}
	if in.Tags != nil {
		sets = append(sets, fmt.Sprintf("tags = $%d::text[]", n))
		args = append(args, in.Tags)
		n++
	}
	if len(in.CustomFields) > 0 {
		sets = append(sets, fmt.Sprintf("custom_fields = $%d::jsonb", n))
		args = append(args, in.CustomFields)
		n++
	}

	if len(sets) == 0 {
		_ = tx.Rollback(ctx)
		return r.GetByID(ctx, projectID, orgID)
	}

	args = append(args, projectID, orgID)
	q := fmt.Sprintf(`UPDATE projects SET %s WHERE id = $%d::uuid AND organization_id = $%d::uuid`,
		strings.Join(sets, ", "), n, n+1)

	_, err = tx.Exec(ctx, q, args...)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetByID(ctx, projectID, orgID)
}

func (r *ProjectRepository) Delete(ctx context.Context, orgID, projectID string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, projectID, orgID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *ProjectRepository) AddTeamMember(ctx context.Context, projectID, orgID, userID, role string, permissions []string) error {
	var exists int
	err := r.pool.QueryRow(ctx, `SELECT 1 FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, projectID, orgID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	permJSON, _ := json.Marshal(permissions)
	_, err = r.pool.Exec(ctx, `
INSERT INTO project_team (project_id, user_id, role, permissions)
VALUES ($1::uuid, $2::uuid, $3, $4::jsonb)
ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role, permissions = EXCLUDED.permissions
`, projectID, userID, role, permJSON)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
UPDATE projects SET team_size = (SELECT COUNT(*)::int FROM project_team t WHERE t.project_id = $1::uuid)
WHERE id = $1::uuid
`, projectID)
	return err
}

func (r *ProjectRepository) RemoveTeamMember(ctx context.Context, projectID, orgID, memberUserID string) error {
	var exists int
	err := r.pool.QueryRow(ctx, `SELECT 1 FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, projectID, orgID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	tag, err := r.pool.Exec(ctx, `DELETE FROM project_team WHERE project_id = $1::uuid AND user_id = $2::uuid`, projectID, memberUserID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	_, err = r.pool.Exec(ctx, `
UPDATE projects SET team_size = (SELECT COUNT(*)::int FROM project_team t WHERE t.project_id = $1::uuid)
WHERE id = $1::uuid
`, projectID)
	return err
}

func (r *ProjectRepository) CreatePhase(ctx context.Context, projectID, orgID string, in models.PhaseInput) (*models.ProjectPhase, error) {
	var exists int
	err := r.pool.QueryRow(ctx, `SELECT 1 FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, projectID, orgID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	st := in.Status
	if st == "" {
		st = "pending"
	}
	deps := []uuid.UUID{}
	for _, s := range in.Dependencies {
		if u, err := uuid.Parse(s); err == nil {
			deps = append(deps, u)
		}
	}
	pid := uuid.NewString()
	q := `
INSERT INTO project_phases (id, project_id, name, description, start_date, end_date, status, progress, dependencies, order_num)
VALUES ($1::uuid, $2::uuid, $3, $4, $5::date, $6::date, $7, $8, $9, $10)
RETURNING id, project_id, name, COALESCE(description, ''), start_date, end_date, status::text, progress, COALESCE(dependencies, '{}'), order_num
`
	row := r.pool.QueryRow(ctx, q, pid, projectID, in.Name, in.Description, in.StartDate, in.EndDate, st, in.Progress, deps, in.OrderNum)
	var ph models.ProjectPhase
	var start, end time.Time
	var depUUIDs []uuid.UUID
	if err := row.Scan(&ph.ID, &ph.ProjectID, &ph.Name, &ph.Description, &start, &end, &ph.Status, &ph.Progress, &depUUIDs, &ph.OrderNum); err != nil {
		return nil, err
	}
	ph.StartDate = start.Format("2006-01-02")
	ph.EndDate = end.Format("2006-01-02")
	for _, d := range depUUIDs {
		ph.Dependencies = append(ph.Dependencies, d.String())
	}
	return &ph, nil
}

func (r *ProjectRepository) UpdatePhase(ctx context.Context, projectID, orgID, phaseID string, in models.PhasePatchInput) (*models.ProjectPhase, error) {
	var exists int
	err := r.pool.QueryRow(ctx, `SELECT 1 FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, projectID, orgID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	sets := []string{}
	args := []any{}
	n := 1

	if in.Name != nil {
		sets = append(sets, fmt.Sprintf("name = $%d", n))
		args = append(args, *in.Name)
		n++
	}
	if in.Description != nil {
		sets = append(sets, fmt.Sprintf("description = $%d", n))
		args = append(args, *in.Description)
		n++
	}
	if in.StartDate != nil {
		sets = append(sets, fmt.Sprintf("start_date = $%d::date", n))
		args = append(args, *in.StartDate)
		n++
	}
	if in.EndDate != nil {
		sets = append(sets, fmt.Sprintf("end_date = $%d::date", n))
		args = append(args, *in.EndDate)
		n++
	}
	if in.Status != nil {
		sets = append(sets, fmt.Sprintf("status = $%d", n))
		args = append(args, *in.Status)
		n++
	}
	if in.Progress != nil {
		sets = append(sets, fmt.Sprintf("progress = $%d", n))
		args = append(args, *in.Progress)
		n++
	}
	if in.Dependencies != nil {
		deps := []uuid.UUID{}
		for _, s := range in.Dependencies {
			if u, err := uuid.Parse(s); err == nil {
				deps = append(deps, u)
			}
		}
		sets = append(sets, fmt.Sprintf("dependencies = $%d", n))
		args = append(args, deps)
		n++
	}
	if in.OrderNum != nil {
		sets = append(sets, fmt.Sprintf("order_num = $%d", n))
		args = append(args, *in.OrderNum)
		n++
	}
	if len(sets) == 0 {
		return r.getPhase(ctx, projectID, phaseID)
	}
	args = append(args, phaseID, projectID)
	q := fmt.Sprintf(`UPDATE project_phases SET %s WHERE id = $%d::uuid AND project_id = $%d::uuid`, strings.Join(sets, ", "), n, n+1)
	_, err = r.pool.Exec(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	return r.getPhase(ctx, projectID, phaseID)
}

func (r *ProjectRepository) getPhase(ctx context.Context, projectID, phaseID string) (*models.ProjectPhase, error) {
	q := `
SELECT id, project_id, name, COALESCE(description, ''), start_date, end_date, status::text, progress,
       COALESCE(dependencies, '{}'), order_num
FROM project_phases WHERE id = $1::uuid AND project_id = $2::uuid
`
	row := r.pool.QueryRow(ctx, q, phaseID, projectID)
	var ph models.ProjectPhase
	var start, end time.Time
	var deps []uuid.UUID
	err := row.Scan(&ph.ID, &ph.ProjectID, &ph.Name, &ph.Description, &start, &end, &ph.Status, &ph.Progress, &deps, &ph.OrderNum)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	ph.StartDate = start.Format("2006-01-02")
	ph.EndDate = end.Format("2006-01-02")
	for _, d := range deps {
		ph.Dependencies = append(ph.Dependencies, d.String())
	}
	return &ph, nil
}

func (r *ProjectRepository) DeletePhase(ctx context.Context, projectID, orgID, phaseID string) error {
	var exists int
	err := r.pool.QueryRow(ctx, `SELECT 1 FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, projectID, orgID).Scan(&exists)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	tag, err := r.pool.Exec(ctx, `DELETE FROM project_phases WHERE id = $1::uuid AND project_id = $2::uuid`, phaseID, projectID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
