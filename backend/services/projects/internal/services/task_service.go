package services

import (
	"context"

	"exponat/projects/internal/models"
	"exponat/projects/internal/repository"
	"exponat/projects/internal/websocket"
)

type TaskService struct {
	repo    *repository.TaskRepository
	projSvc *ProjectService
	hub     *websocket.Hub
}

func NewTaskService(repo *repository.TaskRepository, projSvc *ProjectService, hub *websocket.Hub) *TaskService {
	return &TaskService{repo: repo, projSvc: projSvc, hub: hub}
}

func (s *TaskService) ensureProject(ctx context.Context, projectID, orgID string) error {
	_, err := s.projSvc.GetDetail(ctx, projectID, orgID)
	return err
}

func (s *TaskService) ListTasks(ctx context.Context, projectID, orgID string, f models.TaskFilters) (*models.TaskListResponse, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	rows, total, err := s.repo.List(ctx, projectID, f)
	if err != nil {
		return nil, err
	}
	page := f.Page
	if page <= 0 {
		page = 1
	}
	limit := f.Limit
	if limit <= 0 {
		limit = 100
	}
	return &models.TaskListResponse{
		Data: rows,
		Meta: models.ListMeta{Total: total, Page: page, Limit: limit},
	}, nil
}

func (s *TaskService) GetTask(ctx context.Context, projectID, orgID, taskID string) (*models.Task, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.GetByID(ctx, projectID, taskID)
}

func (s *TaskService) CreateTask(ctx context.Context, projectID, orgID string, in models.TaskCreateInput) (*models.Task, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	t, err := s.repo.Create(ctx, projectID, in)
	if err != nil {
		return nil, err
	}
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "task.created", t)
	}
	return t, nil
}

func (s *TaskService) UpdateTask(ctx context.Context, projectID, orgID, taskID string, in models.TaskUpdateInput) (*models.Task, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	t, err := s.repo.Update(ctx, projectID, taskID, in)
	if err != nil {
		return nil, err
	}
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "task.updated", t)
	}
	return t, nil
}

func (s *TaskService) DeleteTask(ctx context.Context, projectID, orgID, taskID string) error {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return err
	}
	if err := s.repo.Delete(ctx, projectID, taskID); err != nil {
		return err
	}
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "task.deleted", map[string]string{"taskId": taskID})
	}
	return nil
}

func (s *TaskService) ReorderTasks(ctx context.Context, projectID, orgID string, items []models.TaskReorderInput) error {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return err
	}
	if err := s.repo.Reorder(ctx, projectID, items); err != nil {
		return err
	}
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "task.reordered", items)
	}
	return nil
}

// --- Subtasks ---

func (s *TaskService) ListSubtasks(ctx context.Context, projectID, orgID, taskID string) ([]models.Subtask, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.ListSubtasks(ctx, taskID)
}

func (s *TaskService) CreateSubtask(ctx context.Context, projectID, orgID, taskID string, in models.SubtaskInput) (*models.Subtask, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.CreateSubtask(ctx, taskID, in)
}

func (s *TaskService) UpdateSubtask(ctx context.Context, projectID, orgID, taskID, subID string, in models.SubtaskPatchInput) (*models.Subtask, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.UpdateSubtask(ctx, taskID, subID, in)
}

func (s *TaskService) DeleteSubtask(ctx context.Context, projectID, orgID, taskID, subID string) error {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return err
	}
	return s.repo.DeleteSubtask(ctx, taskID, subID)
}

// --- Comments ---

func (s *TaskService) ListComments(ctx context.Context, projectID, orgID, taskID string) ([]models.TaskComment, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.ListComments(ctx, taskID)
}

func (s *TaskService) CreateComment(ctx context.Context, projectID, orgID, taskID, userID string, in models.CommentInput) (*models.TaskComment, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.CreateComment(ctx, taskID, userID, in)
}

// --- Milestones ---

func (s *TaskService) ListMilestones(ctx context.Context, projectID, orgID string) ([]models.Milestone, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.ListMilestones(ctx, projectID)
}

func (s *TaskService) CreateMilestone(ctx context.Context, projectID, orgID string, in models.MilestoneInput) (*models.Milestone, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.CreateMilestone(ctx, projectID, in)
}

func (s *TaskService) UpdateMilestone(ctx context.Context, projectID, orgID, msID string, in models.MilestonePatchInput) (*models.Milestone, error) {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.UpdateMilestone(ctx, projectID, msID, in)
}

func (s *TaskService) DeleteMilestone(ctx context.Context, projectID, orgID, msID string) error {
	if err := s.ensureProject(ctx, projectID, orgID); err != nil {
		return err
	}
	return s.repo.DeleteMilestone(ctx, projectID, msID)
}
