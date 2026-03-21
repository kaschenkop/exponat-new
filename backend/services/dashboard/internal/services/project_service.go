package services

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"exponat/dashboard/internal/models"
	"exponat/dashboard/internal/repository"
	"exponat/dashboard/pkg/cache"
)

type ProjectService struct {
	repo  *repository.ProjectRepository
	redis *cache.RedisCache
}

func NewProjectService(repo *repository.ProjectRepository, redis *cache.RedisCache) *ProjectService {
	return &ProjectService{repo: repo, redis: redis}
}

func (s *ProjectService) notify(ctx context.Context, orgID, eventType, projectID string) {
	if s.redis == nil || orgID == "" {
		return
	}
	msg := fmt.Sprintf(`{"type":%q,"projectId":%q}`, eventType, projectID)
	_ = s.redis.Publish(ctx, "projects:org:"+orgID, msg)
}

func (s *ProjectService) List(ctx context.Context, orgID string, f models.ProjectFilters) (*models.ProjectListResult, error) {
	return s.repo.List(ctx, orgID, f)
}

func (s *ProjectService) Get(ctx context.Context, orgID, id string) (*models.Project, error) {
	return s.repo.GetByID(ctx, orgID, id)
}

func (s *ProjectService) Create(ctx context.Context, orgID string, in models.ProjectCreateInput) (*models.Project, error) {
	out, err := s.repo.Create(ctx, orgID, in)
	if err != nil {
		return nil, err
	}
	if out != nil {
		s.notify(ctx, orgID, "project.created", out.ID)
	}
	return out, nil
}

func (s *ProjectService) Update(ctx context.Context, orgID, id string, in models.ProjectUpdateInput) (*models.Project, error) {
	out, err := s.repo.Update(ctx, orgID, id, in)
	if err != nil {
		return nil, err
	}
	if out != nil {
		s.notify(ctx, orgID, "project.updated", id)
	}
	return out, nil
}

func (s *ProjectService) UpdateStatus(ctx context.Context, orgID, id, status string, kanbanPos *int) (*models.Project, error) {
	out, err := s.repo.UpdateStatus(ctx, orgID, id, status, kanbanPos)
	if err != nil {
		return nil, err
	}
	if out != nil {
		s.notify(ctx, orgID, "project.status", id)
	}
	return out, nil
}

func (s *ProjectService) UpdatePhase(ctx context.Context, orgID, projectID, phaseID string, status *string, progress *int) (*models.ProjectPhase, error) {
	out, err := s.repo.UpdatePhase(ctx, orgID, projectID, phaseID, status, progress)
	if err != nil {
		return nil, err
	}
	if out != nil {
		s.notify(ctx, orgID, "project.phase", projectID)
	}
	return out, nil
}

func (s *ProjectService) Delete(ctx context.Context, orgID, id string) error {
	err := s.repo.Delete(ctx, orgID, id)
	if err != nil {
		return err
	}
	s.notify(ctx, orgID, "project.deleted", id)
	return nil
}

func ParseProjectFilters(q map[string][]string) models.ProjectFilters {
	f := models.ProjectFilters{}
	if v := strings.TrimSpace(first(q["search"])); v != "" {
		f.Search = v
	}
	if v := first(q["status"]); v != "" {
		for _, s := range strings.Split(v, ",") {
			s = strings.TrimSpace(s)
			if s != "" {
				f.Statuses = append(f.Statuses, s)
			}
		}
	}
	if v := first(q["type"]); v != "" {
		for _, s := range strings.Split(v, ",") {
			s = strings.TrimSpace(s)
			if s != "" {
				f.Types = append(f.Types, s)
			}
		}
	}
	f.DateFrom = strings.TrimSpace(first(q["dateFrom"]))
	f.DateTo = strings.TrimSpace(first(q["dateTo"]))
	f.ManagerID = strings.TrimSpace(first(q["managerId"]))
	f.SortBy = strings.TrimSpace(first(q["sortBy"]))
	f.SortDir = strings.TrimSpace(first(q["sortDir"]))
	f.Limit = parseIntDefault(first(q["limit"]), 50)
	f.Offset = parseIntDefault(first(q["offset"]), 0)
	if v := first(q["budgetMin"]); v != "" {
		if x, ok := parseFloatPtr(v); ok {
			f.BudgetMin = x
		}
	}
	if v := first(q["budgetMax"]); v != "" {
		if x, ok := parseFloatPtr(v); ok {
			f.BudgetMax = x
		}
	}
	return f
}

func first(v []string) string {
	if len(v) == 0 {
		return ""
	}
	return v[0]
}

func parseIntDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil || n < 0 {
		return def
	}
	return n
}

func parseFloatPtr(s string) (*float64, bool) {
	x, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return nil, false
	}
	return &x, true
}
