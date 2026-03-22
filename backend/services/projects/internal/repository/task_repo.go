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

type TaskRepository struct {
	pool *pgxpool.Pool
}

func NewTaskRepository(pool *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{pool: pool}
}

func (r *TaskRepository) List(ctx context.Context, projectID string, f models.TaskFilters) ([]models.Task, int, error) {
	page := f.Page
	if page <= 0 {
		page = 1
	}
	limit := f.Limit
	if limit <= 0 {
		limit = 100
	}
	if limit > 500 {
		limit = 500
	}
	offset := (page - 1) * limit

	where := []string{"t.project_id = $1::uuid"}
	args := []any{projectID}
	n := 2

	if f.Search != "" {
		where = append(where, fmt.Sprintf("(t.title ILIKE $%d OR t.description ILIKE $%d)", n, n))
		args = append(args, "%"+f.Search+"%")
		n++
	}
	if len(f.Status) > 0 {
		where = append(where, fmt.Sprintf("t.status = ANY($%d::text[])", n))
		args = append(args, f.Status)
		n++
	}
	if len(f.Priority) > 0 {
		where = append(where, fmt.Sprintf("t.priority = ANY($%d::text[])", n))
		args = append(args, f.Priority)
		n++
	}
	if len(f.Assignee) > 0 {
		where = append(where, fmt.Sprintf("t.assignee_id = ANY($%d::uuid[])", n))
		args = append(args, f.Assignee)
		n++
	}
	if f.GroupName != "" {
		where = append(where, fmt.Sprintf("t.group_name = $%d", n))
		args = append(args, f.GroupName)
		n++
	}
	if f.DateFrom != "" {
		where = append(where, fmt.Sprintf("t.due_date >= $%d::date", n))
		args = append(args, f.DateFrom)
		n++
	}
	if f.DateTo != "" {
		where = append(where, fmt.Sprintf("t.due_date <= $%d::date", n))
		args = append(args, f.DateTo)
		n++
	}

	whereSQL := strings.Join(where, " AND ")

	var total int
	countQ := `SELECT COUNT(*) FROM project_tasks t WHERE ` + whereSQL
	if err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count tasks: %w", err)
	}

	sortCol := "t.order_num"
	switch f.SortBy {
	case "title":
		sortCol = "t.title"
	case "status":
		sortCol = "t.status"
	case "priority":
		sortCol = "t.priority"
	case "dueDate":
		sortCol = "t.due_date"
	case "progress":
		sortCol = "t.progress"
	case "createdAt":
		sortCol = "t.created_at"
	case "updatedAt":
		sortCol = "t.updated_at"
	case "groupName":
		sortCol = "t.group_name"
	}
	order := "ASC"
	if strings.EqualFold(f.SortOrder, "desc") {
		order = "DESC"
	}

	listQ := fmt.Sprintf(`
SELECT
  t.id, t.project_id, t.task_key, t.title, COALESCE(t.description, ''),
  t.status::text, t.priority::text,
  t.assignee_id, COALESCE(u.name, ''),
  COALESCE(t.group_name, ''),
  t.start_date, t.due_date, t.completed_at,
  t.progress, COALESCE(t.tags, '[]'::jsonb),
  COALESCE(t.dependencies, '{}'), t.order_num, t.is_at_risk,
  t.created_at, t.updated_at,
  (SELECT COUNT(*)::int FROM project_subtasks s WHERE s.task_id = t.id) AS subtask_total,
  (SELECT COUNT(*)::int FROM project_subtasks s WHERE s.task_id = t.id AND s.is_completed) AS subtask_done,
  (SELECT COUNT(*)::int FROM project_task_comments c WHERE c.task_id = t.id) AS comments_count
FROM project_tasks t
LEFT JOIN users u ON u.id = t.assignee_id
WHERE %s
ORDER BY %s %s
LIMIT $%d OFFSET $%d`, whereSQL, sortCol, order, n, n+1)

	args = append(args, limit, offset)
	rows, err := r.pool.Query(ctx, listQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list tasks: %w", err)
	}
	defer rows.Close()

	var out []models.Task
	for rows.Next() {
		task, err := scanTaskRow(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, task)
	}
	if out == nil {
		out = []models.Task{}
	}
	return out, total, rows.Err()
}

func scanTaskRow(row pgx.Row) (models.Task, error) {
	var t models.Task
	var assigneeID *string
	var startDate, dueDate *time.Time
	var completedAt *time.Time
	var deps []uuid.UUID
	var tags []byte
	var created, updated time.Time
	var subTotal, subDone, commentsCount int

	err := row.Scan(
		&t.ID, &t.ProjectID, &t.TaskKey, &t.Title, &t.Description,
		&t.Status, &t.Priority,
		&assigneeID, &t.AssigneeName,
		&t.GroupName,
		&startDate, &dueDate, &completedAt,
		&t.Progress, &tags,
		&deps, &t.OrderNum, &t.IsAtRisk,
		&created, &updated,
		&subTotal, &subDone, &commentsCount,
	)
	if err != nil {
		return t, err
	}

	t.AssigneeID = assigneeID
	if startDate != nil {
		s := startDate.Format("2006-01-02")
		t.StartDate = &s
	}
	if dueDate != nil {
		s := dueDate.Format("2006-01-02")
		t.DueDate = &s
	}
	if completedAt != nil {
		s := completedAt.UTC().Format(time.RFC3339)
		t.CompletedAt = &s
	}
	t.Tags = tags
	t.Dependencies = make([]string, 0, len(deps))
	for _, d := range deps {
		t.Dependencies = append(t.Dependencies, d.String())
	}
	t.CreatedAt = created.UTC().Format(time.RFC3339)
	t.UpdatedAt = updated.UTC().Format(time.RFC3339)
	t.CommentsCount = commentsCount
	if subTotal > 0 {
		t.Subtasks = &models.SubtaskSummary{Completed: subDone, Total: subTotal}
	}

	return t, nil
}

func (r *TaskRepository) GetByID(ctx context.Context, projectID, taskID string) (*models.Task, error) {
	q := `
SELECT
  t.id, t.project_id, t.task_key, t.title, COALESCE(t.description, ''),
  t.status::text, t.priority::text,
  t.assignee_id, COALESCE(u.name, ''),
  COALESCE(t.group_name, ''),
  t.start_date, t.due_date, t.completed_at,
  t.progress, COALESCE(t.tags, '[]'::jsonb),
  COALESCE(t.dependencies, '{}'), t.order_num, t.is_at_risk,
  t.created_at, t.updated_at,
  (SELECT COUNT(*)::int FROM project_subtasks s WHERE s.task_id = t.id),
  (SELECT COUNT(*)::int FROM project_subtasks s WHERE s.task_id = t.id AND s.is_completed),
  (SELECT COUNT(*)::int FROM project_task_comments c WHERE c.task_id = t.id)
FROM project_tasks t
LEFT JOIN users u ON u.id = t.assignee_id
WHERE t.id = $1::uuid AND t.project_id = $2::uuid`

	row := r.pool.QueryRow(ctx, q, taskID, projectID)
	t, err := scanTaskRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (r *TaskRepository) Create(ctx context.Context, projectID string, in models.TaskCreateInput) (*models.Task, error) {
	tid := uuid.NewString()

	var seqVal int
	if err := r.pool.QueryRow(ctx, `SELECT nextval('task_key_seq')`).Scan(&seqVal); err != nil {
		return nil, err
	}
	taskKey := fmt.Sprintf("EXP-%d", seqVal)

	status := in.Status
	if status == "" {
		status = models.TaskStatusBacklog
	}
	priority := in.Priority
	if priority == "" {
		priority = models.TaskPriorityMedium
	}

	tagsJSON, _ := json.Marshal(in.Tags)
	if in.Tags == nil {
		tagsJSON = []byte("[]")
	}

	deps := make([]uuid.UUID, 0)
	for _, s := range in.Dependencies {
		if u, err := uuid.Parse(s); err == nil {
			deps = append(deps, u)
		}
	}

	var maxOrder int
	_ = r.pool.QueryRow(ctx,
		`SELECT COALESCE(MAX(order_num), 0) FROM project_tasks WHERE project_id = $1::uuid AND status = $2`,
		projectID, status).Scan(&maxOrder)

	q := `
INSERT INTO project_tasks (
  id, project_id, task_key, title, description,
  status, priority, assignee_id, group_name,
  start_date, due_date, progress, tags, dependencies, order_num
) VALUES (
  $1::uuid, $2::uuid, $3, $4, $5,
  $6, $7, $8, $9,
  $10, $11, 0, $12::jsonb, $13, $14
)`

	_, err := r.pool.Exec(ctx, q,
		tid, projectID, taskKey, in.Title, in.Description,
		status, priority, in.AssigneeID, in.GroupName,
		nilIfEmpty(in.StartDate), nilIfEmpty(in.DueDate),
		tagsJSON, deps, maxOrder+1,
	)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, projectID, tid)
}

func nilIfEmpty(s *string) *string {
	if s != nil && *s == "" {
		return nil
	}
	return s
}

func (r *TaskRepository) Update(ctx context.Context, projectID, taskID string, in models.TaskUpdateInput) (*models.Task, error) {
	sets := []string{}
	args := []any{}
	n := 1

	if in.Title != nil {
		sets = append(sets, fmt.Sprintf("title = $%d", n))
		args = append(args, *in.Title)
		n++
	}
	if in.Description != nil {
		sets = append(sets, fmt.Sprintf("description = $%d", n))
		args = append(args, *in.Description)
		n++
	}
	if in.Status != nil {
		sets = append(sets, fmt.Sprintf("status = $%d", n))
		args = append(args, *in.Status)
		n++
		if *in.Status == models.TaskStatusDone {
			sets = append(sets, fmt.Sprintf("completed_at = $%d", n))
			args = append(args, time.Now().UTC())
			n++
			sets = append(sets, fmt.Sprintf("progress = $%d", n))
			args = append(args, 100)
			n++
		}
	}
	if in.Priority != nil {
		sets = append(sets, fmt.Sprintf("priority = $%d", n))
		args = append(args, *in.Priority)
		n++
	}
	if in.AssigneeID != nil {
		if *in.AssigneeID == "" {
			sets = append(sets, "assignee_id = NULL")
		} else {
			sets = append(sets, fmt.Sprintf("assignee_id = $%d::uuid", n))
			args = append(args, *in.AssigneeID)
			n++
		}
	}
	if in.GroupName != nil {
		sets = append(sets, fmt.Sprintf("group_name = $%d", n))
		args = append(args, *in.GroupName)
		n++
	}
	if in.StartDate != nil {
		if *in.StartDate == "" {
			sets = append(sets, "start_date = NULL")
		} else {
			sets = append(sets, fmt.Sprintf("start_date = $%d::date", n))
			args = append(args, *in.StartDate)
			n++
		}
	}
	if in.DueDate != nil {
		if *in.DueDate == "" {
			sets = append(sets, "due_date = NULL")
		} else {
			sets = append(sets, fmt.Sprintf("due_date = $%d::date", n))
			args = append(args, *in.DueDate)
			n++
		}
	}
	if in.Progress != nil {
		sets = append(sets, fmt.Sprintf("progress = $%d", n))
		args = append(args, *in.Progress)
		n++
	}
	if in.Tags != nil {
		b, _ := json.Marshal(*in.Tags)
		sets = append(sets, fmt.Sprintf("tags = $%d::jsonb", n))
		args = append(args, b)
		n++
	}
	if in.Dependencies != nil {
		deps := make([]uuid.UUID, 0)
		for _, s := range *in.Dependencies {
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
	if in.IsAtRisk != nil {
		sets = append(sets, fmt.Sprintf("is_at_risk = $%d", n))
		args = append(args, *in.IsAtRisk)
		n++
	}

	if len(sets) == 0 {
		return r.GetByID(ctx, projectID, taskID)
	}

	args = append(args, taskID, projectID)
	q := fmt.Sprintf(`UPDATE project_tasks SET %s WHERE id = $%d::uuid AND project_id = $%d::uuid`,
		strings.Join(sets, ", "), n, n+1)

	tag, err := r.pool.Exec(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, projectID, taskID)
}

func (r *TaskRepository) Delete(ctx context.Context, projectID, taskID string) error {
	tag, err := r.pool.Exec(ctx,
		`DELETE FROM project_tasks WHERE id = $1::uuid AND project_id = $2::uuid`,
		taskID, projectID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *TaskRepository) Reorder(ctx context.Context, projectID string, items []models.TaskReorderInput) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	for _, item := range items {
		_, err := tx.Exec(ctx,
			`UPDATE project_tasks SET status = $1, order_num = $2 WHERE id = $3::uuid AND project_id = $4::uuid`,
			item.Status, item.OrderNum, item.TaskID, projectID)
		if err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

// --- Subtasks ---

func (r *TaskRepository) ListSubtasks(ctx context.Context, taskID string) ([]models.Subtask, error) {
	q := `SELECT id, task_id, title, is_completed, order_num
	      FROM project_subtasks WHERE task_id = $1::uuid ORDER BY order_num ASC`
	rows, err := r.pool.Query(ctx, q, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Subtask
	for rows.Next() {
		var s models.Subtask
		if err := rows.Scan(&s.ID, &s.TaskID, &s.Title, &s.IsCompleted, &s.OrderNum); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	if out == nil {
		out = []models.Subtask{}
	}
	return out, rows.Err()
}

func (r *TaskRepository) CreateSubtask(ctx context.Context, taskID string, in models.SubtaskInput) (*models.Subtask, error) {
	sid := uuid.NewString()
	var maxOrder int
	_ = r.pool.QueryRow(ctx, `SELECT COALESCE(MAX(order_num), 0) FROM project_subtasks WHERE task_id = $1::uuid`, taskID).Scan(&maxOrder)

	q := `INSERT INTO project_subtasks (id, task_id, title, order_num) VALUES ($1::uuid, $2::uuid, $3, $4)
	      RETURNING id, task_id, title, is_completed, order_num`
	row := r.pool.QueryRow(ctx, q, sid, taskID, in.Title, maxOrder+1)
	var s models.Subtask
	if err := row.Scan(&s.ID, &s.TaskID, &s.Title, &s.IsCompleted, &s.OrderNum); err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *TaskRepository) UpdateSubtask(ctx context.Context, taskID, subID string, in models.SubtaskPatchInput) (*models.Subtask, error) {
	sets := []string{}
	args := []any{}
	n := 1

	if in.Title != nil {
		sets = append(sets, fmt.Sprintf("title = $%d", n))
		args = append(args, *in.Title)
		n++
	}
	if in.IsCompleted != nil {
		sets = append(sets, fmt.Sprintf("is_completed = $%d", n))
		args = append(args, *in.IsCompleted)
		n++
	}
	if len(sets) == 0 {
		return r.getSubtask(ctx, taskID, subID)
	}
	args = append(args, subID, taskID)
	q := fmt.Sprintf(`UPDATE project_subtasks SET %s WHERE id = $%d::uuid AND task_id = $%d::uuid`,
		strings.Join(sets, ", "), n, n+1)
	tag, err := r.pool.Exec(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	return r.getSubtask(ctx, taskID, subID)
}

func (r *TaskRepository) getSubtask(ctx context.Context, taskID, subID string) (*models.Subtask, error) {
	q := `SELECT id, task_id, title, is_completed, order_num FROM project_subtasks WHERE id = $1::uuid AND task_id = $2::uuid`
	row := r.pool.QueryRow(ctx, q, subID, taskID)
	var s models.Subtask
	if err := row.Scan(&s.ID, &s.TaskID, &s.Title, &s.IsCompleted, &s.OrderNum); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &s, nil
}

func (r *TaskRepository) DeleteSubtask(ctx context.Context, taskID, subID string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM project_subtasks WHERE id = $1::uuid AND task_id = $2::uuid`, subID, taskID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// --- Comments ---

func (r *TaskRepository) ListComments(ctx context.Context, taskID string) ([]models.TaskComment, error) {
	q := `SELECT c.id, c.task_id, c.user_id, COALESCE(u.name, ''), c.content, c.created_at, c.updated_at
	      FROM project_task_comments c
	      LEFT JOIN users u ON u.id = c.user_id
	      WHERE c.task_id = $1::uuid ORDER BY c.created_at ASC`
	rows, err := r.pool.Query(ctx, q, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.TaskComment
	for rows.Next() {
		var c models.TaskComment
		var created, updated time.Time
		if err := rows.Scan(&c.ID, &c.TaskID, &c.UserID, &c.UserName, &c.Content, &created, &updated); err != nil {
			return nil, err
		}
		c.CreatedAt = created.UTC().Format(time.RFC3339)
		c.UpdatedAt = updated.UTC().Format(time.RFC3339)
		out = append(out, c)
	}
	if out == nil {
		out = []models.TaskComment{}
	}
	return out, rows.Err()
}

func (r *TaskRepository) CreateComment(ctx context.Context, taskID, userID string, in models.CommentInput) (*models.TaskComment, error) {
	cid := uuid.NewString()
	q := `INSERT INTO project_task_comments (id, task_id, user_id, content)
	      VALUES ($1::uuid, $2::uuid, $3::uuid, $4)
	      RETURNING id, task_id, user_id, content, created_at, updated_at`
	row := r.pool.QueryRow(ctx, q, cid, taskID, userID, in.Content)
	var c models.TaskComment
	var created, updated time.Time
	if err := row.Scan(&c.ID, &c.TaskID, &c.UserID, &c.Content, &created, &updated); err != nil {
		return nil, err
	}
	c.CreatedAt = created.UTC().Format(time.RFC3339)
	c.UpdatedAt = updated.UTC().Format(time.RFC3339)

	urow := r.pool.QueryRow(ctx, `SELECT COALESCE(name, '') FROM users WHERE id = $1::uuid`, userID)
	_ = urow.Scan(&c.UserName)

	return &c, nil
}

// --- Milestones ---

func (r *TaskRepository) ListMilestones(ctx context.Context, projectID string) ([]models.Milestone, error) {
	q := `SELECT id, project_id, title, milestone_date, COALESCE(description, '')
	      FROM project_milestones WHERE project_id = $1::uuid ORDER BY milestone_date ASC`
	rows, err := r.pool.Query(ctx, q, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Milestone
	for rows.Next() {
		var m models.Milestone
		var d time.Time
		if err := rows.Scan(&m.ID, &m.ProjectID, &m.Title, &d, &m.Description); err != nil {
			return nil, err
		}
		m.Date = d.Format("2006-01-02")
		out = append(out, m)
	}
	if out == nil {
		out = []models.Milestone{}
	}
	return out, rows.Err()
}

func (r *TaskRepository) CreateMilestone(ctx context.Context, projectID string, in models.MilestoneInput) (*models.Milestone, error) {
	mid := uuid.NewString()
	q := `INSERT INTO project_milestones (id, project_id, title, milestone_date, description)
	      VALUES ($1::uuid, $2::uuid, $3, $4::date, $5)
	      RETURNING id, project_id, title, milestone_date, COALESCE(description, '')`
	row := r.pool.QueryRow(ctx, q, mid, projectID, in.Title, in.Date, in.Description)
	var m models.Milestone
	var d time.Time
	if err := row.Scan(&m.ID, &m.ProjectID, &m.Title, &d, &m.Description); err != nil {
		return nil, err
	}
	m.Date = d.Format("2006-01-02")
	return &m, nil
}

func (r *TaskRepository) UpdateMilestone(ctx context.Context, projectID, msID string, in models.MilestonePatchInput) (*models.Milestone, error) {
	sets := []string{}
	args := []any{}
	n := 1
	if in.Title != nil {
		sets = append(sets, fmt.Sprintf("title = $%d", n))
		args = append(args, *in.Title)
		n++
	}
	if in.Date != nil {
		sets = append(sets, fmt.Sprintf("milestone_date = $%d::date", n))
		args = append(args, *in.Date)
		n++
	}
	if in.Description != nil {
		sets = append(sets, fmt.Sprintf("description = $%d", n))
		args = append(args, *in.Description)
		n++
	}
	if len(sets) == 0 {
		return r.getMilestone(ctx, projectID, msID)
	}
	args = append(args, msID, projectID)
	q := fmt.Sprintf(`UPDATE project_milestones SET %s WHERE id = $%d::uuid AND project_id = $%d::uuid`,
		strings.Join(sets, ", "), n, n+1)
	tag, err := r.pool.Exec(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	return r.getMilestone(ctx, projectID, msID)
}

func (r *TaskRepository) getMilestone(ctx context.Context, projectID, msID string) (*models.Milestone, error) {
	q := `SELECT id, project_id, title, milestone_date, COALESCE(description, '')
	      FROM project_milestones WHERE id = $1::uuid AND project_id = $2::uuid`
	row := r.pool.QueryRow(ctx, q, msID, projectID)
	var m models.Milestone
	var d time.Time
	if err := row.Scan(&m.ID, &m.ProjectID, &m.Title, &d, &m.Description); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	m.Date = d.Format("2006-01-02")
	return &m, nil
}

func (r *TaskRepository) DeleteMilestone(ctx context.Context, projectID, msID string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM project_milestones WHERE id = $1::uuid AND project_id = $2::uuid`, msID, projectID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
