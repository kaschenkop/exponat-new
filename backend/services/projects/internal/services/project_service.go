package services

import (
	"context"

	"exponat/projects/internal/models"
	"exponat/projects/internal/repository"
	"exponat/projects/internal/websocket"
	"exponat/projects/pkg/events"
)

type ProjectService struct {
	repo *repository.ProjectRepository
	hub  *websocket.Hub
}

func NewProjectService(repo *repository.ProjectRepository, hub *websocket.Hub) *ProjectService {
	return &ProjectService{repo: repo, hub: hub}
}

func (s *ProjectService) List(ctx context.Context, orgID string, f models.ProjectFilters) (*models.ListResponse, error) {
	rows, total, err := s.repo.List(ctx, orgID, f)
	if err != nil {
		return nil, err
	}
	page := f.Page
	if page <= 0 {
		page = 1
	}
	limit := f.Limit
	if limit <= 0 {
		limit = 20
	}
	return &models.ListResponse{
		Data: rows,
		Meta: models.ListMeta{Total: total, Page: page, Limit: limit},
	}, nil
}

func (s *ProjectService) GetDetail(ctx context.Context, projectID, orgID string) (*models.Project, error) {
	p, err := s.repo.GetByID(ctx, projectID, orgID)
	if err != nil {
		return nil, err
	}
	team, err := s.repo.GetTeam(ctx, projectID)
	if err != nil {
		return nil, err
	}
	p.Team = team
	return p, nil
}

func (s *ProjectService) GetPhases(ctx context.Context, projectID, orgID string) ([]models.ProjectPhase, error) {
	if _, err := s.repo.GetByID(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.GetPhases(ctx, projectID)
}

func (s *ProjectService) GetActivity(ctx context.Context, projectID, orgID string, limit int) ([]models.ProjectChange, error) {
	if _, err := s.repo.GetByID(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.GetChanges(ctx, projectID, limit)
}

func (s *ProjectService) Create(ctx context.Context, orgID, userID string, in models.ProjectCreateInput) (*models.Project, error) {
	p, err := s.repo.Create(ctx, orgID, userID, in)
	if err != nil {
		return nil, err
	}
	events.PublishEvent("project.created", p)
	if s.hub != nil {
		s.hub.BroadcastToProject(p.ID, "project.created", p)
	}
	return p, nil
}

func (s *ProjectService) Update(ctx context.Context, orgID, userID, projectID string, in models.ProjectUpdateInput) (*models.Project, error) {
	p, err := s.repo.Update(ctx, orgID, userID, projectID, in)
	if err != nil {
		return nil, err
	}
	detail, err := s.GetDetail(ctx, projectID, orgID)
	if err != nil {
		return p, nil
	}
	events.PublishEvent("project.updated", detail)
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "project.updated", detail)
	}
	return detail, nil
}

func (s *ProjectService) Delete(ctx context.Context, orgID, projectID string) error {
	if err := s.repo.Delete(ctx, orgID, projectID); err != nil {
		return err
	}
	events.PublishEvent("project.deleted", map[string]string{"id": projectID})
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "project.deleted", map[string]string{"id": projectID})
	}
	return nil
}

func (s *ProjectService) GetTeam(ctx context.Context, projectID, orgID string) ([]models.TeamMember, error) {
	if _, err := s.repo.GetByID(ctx, projectID, orgID); err != nil {
		return nil, err
	}
	return s.repo.GetTeam(ctx, projectID)
}

func (s *ProjectService) AddTeamMember(ctx context.Context, projectID, orgID, memberID, role string, permissions []string) error {
	if err := s.repo.AddTeamMember(ctx, projectID, orgID, memberID, role, permissions); err != nil {
		return err
	}
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "team.member_added", map[string]string{"userId": memberID, "role": role})
	}
	return nil
}

func (s *ProjectService) RemoveTeamMember(ctx context.Context, projectID, orgID, memberID string) error {
	if err := s.repo.RemoveTeamMember(ctx, projectID, orgID, memberID); err != nil {
		return err
	}
	if s.hub != nil {
		s.hub.BroadcastToProject(projectID, "team.member_removed", map[string]string{"userId": memberID})
	}
	return nil
}

func (s *ProjectService) CreatePhase(ctx context.Context, projectID, orgID string, in models.PhaseInput) (*models.ProjectPhase, error) {
	return s.repo.CreatePhase(ctx, projectID, orgID, in)
}

func (s *ProjectService) UpdatePhase(ctx context.Context, projectID, orgID, phaseID string, in models.PhasePatchInput) (*models.ProjectPhase, error) {
	return s.repo.UpdatePhase(ctx, projectID, orgID, phaseID, in)
}

func (s *ProjectService) DeletePhase(ctx context.Context, projectID, orgID, phaseID string) error {
	return s.repo.DeletePhase(ctx, projectID, orgID, phaseID)
}
