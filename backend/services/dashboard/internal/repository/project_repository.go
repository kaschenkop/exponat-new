package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"exponat/dashboard/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProjectRepository struct {
	pool *pgxpool.Pool
}

func NewProjectRepository(pool *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{pool: pool}
}

func (r *ProjectRepository) List(ctx context.Context, orgID string, f models.ProjectFilters) (*models.ProjectListResult, error) {
	if orgID == "" {
		return nil, fmt.Errorf("invalid organization id")
	}
	limit := f.Limit
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	offset := f.Offset
	if offset < 0 {
		offset = 0
	}

	where := []string{"p.organization_id = $1::uuid"}
	args := []any{orgID}
	argPos := 2

	if strings.TrimSpace(f.Search) != "" {
		where = append(where, fmt.Sprintf("(p.name ILIKE $%d OR p.description ILIKE $%d)", argPos, argPos))
		args = append(args, "%"+strings.TrimSpace(f.Search)+"%")
		argPos++
	}
	if len(f.Statuses) > 0 {
		where = append(where, fmt.Sprintf("p.status = ANY($%d::text[])", argPos))
		args = append(args, f.Statuses)
		argPos++
	}
	if len(f.Types) > 0 {
		where = append(where, fmt.Sprintf("p.project_type = ANY($%d::text[])", argPos))
		args = append(args, f.Types)
		argPos++
	}
	if f.DateFrom != "" {
		where = append(where, fmt.Sprintf("p.end_date >= $%d::date", argPos))
		args = append(args, f.DateFrom)
		argPos++
	}
	if f.DateTo != "" {
		where = append(where, fmt.Sprintf("p.start_date <= $%d::date", argPos))
		args = append(args, f.DateTo)
		argPos++
	}
	if f.BudgetMin != nil {
		where = append(where, fmt.Sprintf("p.total_budget >= $%d", argPos))
		args = append(args, *f.BudgetMin)
		argPos++
	}
	if f.BudgetMax != nil {
		where = append(where, fmt.Sprintf("p.total_budget <= $%d", argPos))
		args = append(args, *f.BudgetMax)
		argPos++
	}
	if f.ManagerID != "" {
		where = append(where, fmt.Sprintf("p.manager_id = $%d::uuid", argPos))
		args = append(args, f.ManagerID)
		argPos++
	}

	whereSQL := strings.Join(where, " AND ")
	sortCol := "p.created_at"
	switch f.SortBy {
	case "name":
		sortCol = "p.name"
	case "totalBudget":
		sortCol = "p.total_budget"
	case "endDate":
		sortCol = "p.end_date"
	case "startDate":
		sortCol = "p.start_date"
	case "updatedAt":
		sortCol = "p.updated_at"
	}
	sortDir := "DESC"
	if strings.EqualFold(f.SortDir, "asc") {
		sortDir = "ASC"
	}

	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM projects p WHERE %s`, whereSQL)
	var total int
	if err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, fmt.Errorf("projects count: %w", err)
	}

	listQ := fmt.Sprintf(`
SELECT
  p.id::text, p.organization_id::text, p.name, p.description, p.project_type::text, p.status::text,
  p.start_date, p.end_date, p.created_at, p.updated_at,
  p.total_budget::float8, p.spent_budget::float8, p.currency::text,
  COALESCE(p.location, '{}'::jsonb),
  COALESCE(p.manager_id::text, ''),
  p.progress,
  COALESCE(p.tags, '{}'),
  COALESCE(p.custom_fields, '{}'::jsonb),
  (SELECT COUNT(*)::int FROM exhibits e WHERE e.project_id = p.id),
  (SELECT COUNT(*)::int FROM participants pt WHERE pt.project_id = p.id)
FROM projects p
WHERE %s
ORDER BY %s %s
LIMIT $%d OFFSET $%d`, whereSQL, sortCol, sortDir, argPos, argPos+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, listQ, args...)
	if err != nil {
		return nil, fmt.Errorf("projects list: %w", err)
	}
	defer rows.Close()

	var items []models.Project
	for rows.Next() {
		var p models.Project
		var start, end time.Time
		var created, updated time.Time
		var locJSON []byte
		var tags []string
		var cf []byte
		if err := rows.Scan(
			&p.ID, &p.OrganizationID, &p.Name, &p.Description, &p.Type, &p.Status,
			&start, &end, &created, &updated,
			&p.TotalBudget, &p.SpentBudget, &p.Currency,
			&locJSON, &p.ManagerID, &p.Progress,
			&tags, &cf,
			&p.ExhibitsCount, &p.ParticipantsCount,
		); err != nil {
			return nil, err
		}
		p.StartDate = start.Format("2006-01-02")
		p.EndDate = end.Format("2006-01-02")
		p.CreatedAt = created.UTC().Format(time.RFC3339)
		p.UpdatedAt = updated.UTC().Format(time.RFC3339)
		if len(cf) > 0 {
			p.CustomFields = cf
		} else {
			p.CustomFields = json.RawMessage(`{}`)
		}
		p.Tags = tags
		if err := json.Unmarshal(locJSON, &p.Location); err != nil {
			p.Location = models.ProjectLocation{}
		}
		p.Team = []models.ProjectTeamMember{}
		p.Currency = strings.TrimSpace(p.Currency)
		if p.Currency == "" {
			p.Currency = "RUB"
		}
		items = append(items, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return &models.ProjectListResult{Items: items, Total: total}, nil
}

func (r *ProjectRepository) GetByID(ctx context.Context, orgID, id string) (*models.Project, error) {
	if orgID == "" || id == "" {
		return nil, fmt.Errorf("invalid ids")
	}
	q := `
SELECT
  p.id::text, p.organization_id::text, p.name, p.description, p.project_type::text, p.status::text,
  p.start_date, p.end_date, p.created_at, p.updated_at,
  p.total_budget::float8, p.spent_budget::float8, p.currency::text,
  COALESCE(p.location, '{}'::jsonb),
  COALESCE(p.manager_id::text, ''),
  p.progress,
  COALESCE(p.tags, '{}'),
  COALESCE(p.custom_fields, '{}'::jsonb),
  (SELECT COUNT(*)::int FROM exhibits e WHERE e.project_id = p.id),
  (SELECT COUNT(*)::int FROM participants pt WHERE pt.project_id = p.id)
FROM projects p
WHERE p.id = $1::uuid AND p.organization_id = $2::uuid
`
	var p models.Project
	var start, end time.Time
	var created, updated time.Time
	var locJSON []byte
	var tags []string
	var cf []byte
	err := r.pool.QueryRow(ctx, q, id, orgID).Scan(
		&p.ID, &p.OrganizationID, &p.Name, &p.Description, &p.Type, &p.Status,
		&start, &end, &created, &updated,
		&p.TotalBudget, &p.SpentBudget, &p.Currency,
		&locJSON, &p.ManagerID, &p.Progress,
		&tags, &cf,
		&p.ExhibitsCount, &p.ParticipantsCount,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("project get: %w", err)
	}
	p.StartDate = start.Format("2006-01-02")
	p.EndDate = end.Format("2006-01-02")
	p.CreatedAt = created.UTC().Format(time.RFC3339)
	p.UpdatedAt = updated.UTC().Format(time.RFC3339)
	p.Tags = tags
	if len(cf) > 0 {
		p.CustomFields = cf
	} else {
		p.CustomFields = json.RawMessage(`{}`)
	}
	if err := json.Unmarshal(locJSON, &p.Location); err != nil {
		p.Location = models.ProjectLocation{}
	}
	if strings.TrimSpace(p.Currency) == "" {
		p.Currency = "RUB"
	}

	team, err := r.loadTeam(ctx, id)
	if err != nil {
		return nil, err
	}
	p.Team = team

	phases, err := r.loadPhases(ctx, id)
	if err != nil {
		return nil, err
	}
	p.Phases = phases

	files, err := r.loadFiles(ctx, id)
	if err != nil {
		return nil, err
	}
	p.Files = files

	activity, err := r.loadActivity(ctx, orgID, id, 30)
	if err != nil {
		return nil, err
	}
	p.Activity = activity

	return &p, nil
}

func (r *ProjectRepository) loadTeam(ctx context.Context, projectID string) ([]models.ProjectTeamMember, error) {
	q := `
SELECT
  u.id::text,
  u.name,
  COALESCE(u.avatar, ''),
  m.role::text,
  m.permissions,
  m.joined_at
FROM project_team_members m
JOIN users u ON u.id = m.user_id
WHERE m.project_id = $1::uuid
ORDER BY m.joined_at ASC
`
	rows, err := r.pool.Query(ctx, q, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ProjectTeamMember
	for rows.Next() {
		var m models.ProjectTeamMember
		var joined time.Time
		if err := rows.Scan(&m.UserID, &m.UserName, &m.UserAvatar, &m.Role, &m.Permissions, &joined); err != nil {
			return nil, err
		}
		m.JoinedAt = joined.UTC().Format(time.RFC3339)
		out = append(out, m)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) loadPhases(ctx context.Context, projectID string) ([]models.ProjectPhase, error) {
	q := `
SELECT
  ph.id::text, ph.project_id::text, ph.name, ph.description, ph.start_date, ph.end_date, ph.status::text, ph.progress,
  COALESCE((SELECT array_agg(x::text) FROM unnest(COALESCE(ph.dependencies, '{}')) AS x), ARRAY[]::text[]),
  ph.sort_order
FROM project_phases ph
WHERE ph.project_id = $1::uuid
ORDER BY ph.sort_order ASC, ph.start_date ASC
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
		var deps []string
		if err := rows.Scan(&ph.ID, &ph.ProjectID, &ph.Name, &ph.Description, &start, &end, &ph.Status, &ph.Progress, &deps, &ph.SortOrder); err != nil {
			return nil, err
		}
		ph.StartDate = start.Format("2006-01-02")
		ph.EndDate = end.Format("2006-01-02")
		ph.Dependencies = deps
		out = append(out, ph)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) loadFiles(ctx context.Context, projectID string) ([]models.ProjectFile, error) {
	q := `
SELECT id::text, project_id::text, name, url, COALESCE(mime_type, ''), COALESCE(size_bytes, 0),
  COALESCE(uploaded_by::text, ''), created_at
FROM project_files
WHERE project_id = $1::uuid
ORDER BY created_at DESC
LIMIT 50
`
	rows, err := r.pool.Query(ctx, q, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ProjectFile
	for rows.Next() {
		var f models.ProjectFile
		var created time.Time
		var sz int64
		if err := rows.Scan(&f.ID, &f.ProjectID, &f.Name, &f.URL, &f.MimeType, &sz, &f.UploadedBy, &created); err != nil {
			return nil, err
		}
		f.SizeBytes = sz
		f.CreatedAt = created.UTC().Format(time.RFC3339)
		out = append(out, f)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) loadActivity(ctx context.Context, orgID, projectID string, limit int) ([]models.ProjectActivityItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 30
	}
	q := `
SELECT
  a.id::text,
  a.action,
  u.id::text,
  u.name,
  COALESCE(u.avatar, ''),
  a.created_at
FROM activity_log a
JOIN users u ON u.id = a.user_id
WHERE a.organization_id = $1::uuid AND a.entity_type = 'project' AND a.entity_id = $2::uuid
ORDER BY a.created_at DESC
LIMIT $3
`
	rows, err := r.pool.Query(ctx, q, orgID, projectID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ProjectActivityItem
	for rows.Next() {
		var a models.ProjectActivityItem
		var when time.Time
		if err := rows.Scan(&a.ID, &a.Action, &a.UserID, &a.UserName, &a.UserAvatar, &when); err != nil {
			return nil, err
		}
		a.Timestamp = when.UTC().Format(time.RFC3339)
		out = append(out, a)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) Create(ctx context.Context, orgID string, in models.ProjectCreateInput) (*models.Project, error) {
	if orgID == "" {
		return nil, fmt.Errorf("invalid organization id")
	}
	if strings.TrimSpace(in.Name) == "" {
		return nil, fmt.Errorf("name required")
	}
	locJSON, err := json.Marshal(in.Location)
	if err != nil {
		return nil, err
	}
	start, err := time.Parse("2006-01-02", in.StartDate)
	if err != nil {
		return nil, fmt.Errorf("startDate: %w", err)
	}
	end, err := time.Parse("2006-01-02", in.EndDate)
	if err != nil {
		return nil, fmt.Errorf("endDate: %w", err)
	}
	ptype := in.Type
	if ptype == "" {
		ptype = "other"
	}
	manager := strings.TrimSpace(in.ManagerID)
	if manager == "" {
		return nil, fmt.Errorf("managerId required")
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var id string
	q := `
INSERT INTO projects (
  organization_id, name, description, project_type, status,
  start_date, end_date, total_budget, spent_budget, currency,
  location, manager_id, progress, tags, custom_fields, team_size, kanban_position
) VALUES (
  $1::uuid, $2, $3, $4, 'draft',
  $5::date, $6::date, $7, 0, 'RUB',
  $8::jsonb, $9::uuid, 0, '{}', '{}'::jsonb,
  $10, 0
)
RETURNING id::text
`
	teamSize := len(in.TeamMemberIDs)
	if teamSize == 0 {
		teamSize = 1
	}
	err = tx.QueryRow(ctx, q, orgID, in.Name, in.Description, ptype, start, end, in.TotalBudget, locJSON, manager, teamSize).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("insert project: %w", err)
	}

	seen := map[string]struct{}{manager: {}}
	_, err = tx.Exec(ctx, `
INSERT INTO project_team_members (project_id, user_id, role, permissions)
VALUES ($1::uuid, $2::uuid, 'manager', ARRAY['*']::text[])
ON CONFLICT (project_id, user_id) DO NOTHING
`, id, manager)
	if err != nil {
		return nil, fmt.Errorf("insert manager team: %w", err)
	}

	for _, uid := range in.TeamMemberIDs {
		uid = strings.TrimSpace(uid)
		if uid == "" || uid == manager {
			continue
		}
		if _, ok := seen[uid]; ok {
			continue
		}
		seen[uid] = struct{}{}
		_, err = tx.Exec(ctx, `
INSERT INTO project_team_members (project_id, user_id, role, permissions)
VALUES ($1::uuid, $2::uuid, 'other', ARRAY['read']::text[])
ON CONFLICT (project_id, user_id) DO NOTHING
`, id, uid)
		if err != nil {
			return nil, fmt.Errorf("insert team: %w", err)
		}
	}

	_, err = tx.Exec(ctx, `
UPDATE projects SET team_size = (SELECT COUNT(*) FROM project_team_members WHERE project_id = $1::uuid)
WHERE id = $1::uuid
`, id)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetByID(ctx, orgID, id)
}

func (r *ProjectRepository) Update(ctx context.Context, orgID, id string, in models.ProjectUpdateInput) (*models.Project, error) {
	cur, err := r.GetByID(ctx, orgID, id)
	if err != nil {
		return nil, err
	}
	if cur == nil {
		return nil, nil
	}

	sets := []string{}
	args := []any{}
	n := 1
	push := func(col string, v any) {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, n))
		args = append(args, v)
		n++
	}

	if in.Name != nil {
		push("name", *in.Name)
	}
	if in.Description != nil {
		push("description", *in.Description)
	}
	if in.Type != nil {
		push("project_type", *in.Type)
	}
	if in.Status != nil {
		push("status", *in.Status)
	}
	if in.StartDate != nil {
		t, err := time.Parse("2006-01-02", *in.StartDate)
		if err != nil {
			return nil, err
		}
		push("start_date", t)
	}
	if in.EndDate != nil {
		t, err := time.Parse("2006-01-02", *in.EndDate)
		if err != nil {
			return nil, err
		}
		push("end_date", t)
	}
	if in.TotalBudget != nil {
		push("total_budget", *in.TotalBudget)
	}
	if in.SpentBudget != nil {
		push("spent_budget", *in.SpentBudget)
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
		args = append(args, strings.TrimSpace(*in.ManagerID))
		n++
	}
	if in.Progress != nil {
		push("progress", *in.Progress)
	}
	if in.Tags != nil {
		push("tags", *in.Tags)
	}
	if len(in.CustomFields) > 0 && string(in.CustomFields) != "null" {
		sets = append(sets, fmt.Sprintf("custom_fields = $%d::jsonb", n))
		args = append(args, in.CustomFields)
		n++
	}

	if len(sets) == 0 && in.TeamMemberIDs == nil {
		return cur, nil
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	if len(sets) > 0 {
		args = append(args, id, orgID)
		q := fmt.Sprintf(`
UPDATE projects SET %s
WHERE id = $%d::uuid AND organization_id = $%d::uuid
`, strings.Join(sets, ", "), n, n+1)
		tag, err := tx.Exec(ctx, q, args...)
		if err != nil {
			return nil, fmt.Errorf("update project: %w", err)
		}
		if tag.RowsAffected() == 0 {
			return nil, nil
		}
	}

	if in.TeamMemberIDs != nil {
		_, err := tx.Exec(ctx, `DELETE FROM project_team_members WHERE project_id = $1::uuid`, id)
		if err != nil {
			return nil, err
		}
		manager := cur.ManagerID
		if in.ManagerID != nil {
			manager = strings.TrimSpace(*in.ManagerID)
		}
		if manager != "" {
			_, err = tx.Exec(ctx, `
INSERT INTO project_team_members (project_id, user_id, role, permissions)
VALUES ($1::uuid, $2::uuid, 'manager', ARRAY['*']::text[])
`, id, manager)
			if err != nil {
				return nil, err
			}
		}
		seen := map[string]struct{}{}
		if manager != "" {
			seen[manager] = struct{}{}
		}
		for _, uid := range *in.TeamMemberIDs {
			uid = strings.TrimSpace(uid)
			if uid == "" {
				continue
			}
			if _, ok := seen[uid]; ok {
				continue
			}
			seen[uid] = struct{}{}
			_, err = tx.Exec(ctx, `
INSERT INTO project_team_members (project_id, user_id, role, permissions)
VALUES ($1::uuid, $2::uuid, 'other', ARRAY['read']::text[])
`, id, uid)
			if err != nil {
				return nil, err
			}
		}
		_, err = tx.Exec(ctx, `UPDATE projects SET team_size = (SELECT COUNT(*) FROM project_team_members WHERE project_id = $1::uuid) WHERE id = $1::uuid`, id)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetByID(ctx, orgID, id)
}

func (r *ProjectRepository) UpdateStatus(ctx context.Context, orgID, id, status string, kanbanPos *int) (*models.Project, error) {
	if status == "" {
		return nil, fmt.Errorf("status required")
	}
	if kanbanPos != nil {
		q := `
UPDATE projects SET status = $3, kanban_position = $4
WHERE id = $1::uuid AND organization_id = $2::uuid
`
		_, err := r.pool.Exec(ctx, q, id, orgID, status, *kanbanPos)
		if err != nil {
			return nil, err
		}
	} else {
		q := `
UPDATE projects SET status = $3
WHERE id = $1::uuid AND organization_id = $2::uuid
`
		_, err := r.pool.Exec(ctx, q, id, orgID, status)
		if err != nil {
			return nil, err
		}
	}
	return r.GetByID(ctx, orgID, id)
}

func (r *ProjectRepository) UpdatePhase(ctx context.Context, orgID, projectID, phaseID string, status *string, progress *int) (*models.ProjectPhase, error) {
	var st any
	var pr any
	if status != nil {
		st = *status
	}
	if progress != nil {
		pr = *progress
	}
	ok, err := r.pool.Exec(ctx, `
UPDATE project_phases ph
SET
  status = COALESCE($4::varchar, ph.status),
  progress = COALESCE($5::int, ph.progress)
FROM projects p
WHERE ph.id = $3::uuid AND ph.project_id = $2::uuid AND p.id = ph.project_id AND p.organization_id = $1::uuid
`, orgID, projectID, phaseID, st, pr)
	if err != nil {
		return nil, err
	}
	if ok.RowsAffected() == 0 {
		return nil, nil
	}
	var out models.ProjectPhase
	q := `
SELECT id::text, project_id::text, name, description, start_date, end_date, status::text, progress,
  COALESCE(dependencies, '{}'), sort_order
FROM project_phases WHERE id = $1::uuid AND project_id = $2::uuid
`
	var start, end time.Time
	var deps []string
	err = r.pool.QueryRow(ctx, q, phaseID, projectID).Scan(
		&out.ID, &out.ProjectID, &out.Name, &out.Description, &start, &end, &out.Status, &out.Progress, &deps, &out.SortOrder,
	)
	if err != nil {
		return nil, err
	}
	out.StartDate = start.Format("2006-01-02")
	out.EndDate = end.Format("2006-01-02")
	out.Dependencies = deps
	return &out, nil
}

func (r *ProjectRepository) Delete(ctx context.Context, orgID, id string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1::uuid AND organization_id = $2::uuid`, id, orgID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}
