package services

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"exponat/dashboard/internal/models"
	"exponat/dashboard/internal/repository"
	"exponat/dashboard/pkg/cache"
)

type DashboardService struct {
	repo  *repository.DashboardRepository
	cache *cache.RedisCache
}

func NewDashboardService(repo *repository.DashboardRepository, c *cache.RedisCache) *DashboardService {
	return &DashboardService{repo: repo, cache: c}
}

func (s *DashboardService) GetStats(ctx context.Context, _, orgID string) (*models.DashboardStats, error) {
	if orgID == "" {
		return nil, fmt.Errorf("organization id required")
	}
	cacheKey := "dashboard:stats:" + orgID
	var cached models.DashboardStats
	if err := s.cache.Get(ctx, cacheKey, &cached); err == nil {
		return &cached, nil
	} else if err != nil && !errors.Is(err, cache.ErrCacheMiss) {
		return nil, err
	}

	stats, err := s.repo.GetStats(ctx, orgID)
	if err != nil {
		return nil, err
	}
	_ = s.cache.Set(ctx, cacheKey, stats, 5*time.Minute)
	return stats, nil
}

func (s *DashboardService) GetRecentProjects(ctx context.Context, orgID string, limit int) ([]models.DashboardProject, error) {
	if orgID == "" {
		return nil, fmt.Errorf("organization id required")
	}
	return s.repo.GetRecentProjects(ctx, orgID, limit)
}

func (s *DashboardService) GetBudgetTrend(ctx context.Context, orgID string, months int) ([]models.BudgetTrendRow, error) {
	if orgID == "" {
		return nil, fmt.Errorf("organization id required")
	}
	return s.repo.GetBudgetTrend(ctx, orgID, months)
}

func (s *DashboardService) GetUpcomingEvents(ctx context.Context, orgID string) ([]models.Event, error) {
	if orgID == "" {
		return nil, fmt.Errorf("organization id required")
	}
	return s.repo.GetUpcomingEvents(ctx, orgID)
}

func (s *DashboardService) GetActivity(ctx context.Context, orgID string, limit int) ([]models.Activity, error) {
	if orgID == "" {
		return nil, fmt.Errorf("organization id required")
	}
	return s.repo.GetActivity(ctx, orgID, limit)
}

func ParseLimit(s string, def int) int {
	n, err := strconv.Atoi(s)
	if err != nil || n <= 0 {
		return def
	}
	return n
}

func ParseMonths(s string, def int) int {
	n, err := strconv.Atoi(s)
	if err != nil || n <= 0 {
		return def
	}
	return n
}
