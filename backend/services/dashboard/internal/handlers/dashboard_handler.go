package handlers

import (
	"log/slog"
	"net/http"

	"exponat/dashboard/internal/services"

	"github.com/gin-gonic/gin"
)

type DashboardHandlers struct {
	svc *services.DashboardService
}

func NewDashboardHandlers(svc *services.DashboardService) *DashboardHandlers {
	return &DashboardHandlers{svc: svc}
}

func (h *DashboardHandlers) GetStats(c *gin.Context) {
	userID := c.GetString("userId")
	orgID := c.GetString("organizationId")
	stats, err := h.svc.GetStats(c.Request.Context(), userID, orgID)
	if err != nil {
		slog.Error("GetStats", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *DashboardHandlers) GetRecentProjects(c *gin.Context) {
	orgID := c.GetString("organizationId")
	projects, err := h.svc.GetRecentProjects(c.Request.Context(), orgID, 5)
	if err != nil {
		slog.Error("GetRecentProjects", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func (h *DashboardHandlers) GetBudgetTrend(c *gin.Context) {
	orgID := c.GetString("organizationId")
	months := services.ParseMonths(c.DefaultQuery("months", "6"), 6)
	trend, err := h.svc.GetBudgetTrend(c.Request.Context(), orgID, months)
	if err != nil {
		slog.Error("GetBudgetTrend", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, trend)
}

func (h *DashboardHandlers) GetUpcomingEvents(c *gin.Context) {
	orgID := c.GetString("organizationId")
	events, err := h.svc.GetUpcomingEvents(c.Request.Context(), orgID)
	if err != nil {
		slog.Error("GetUpcomingEvents", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, events)
}

func (h *DashboardHandlers) GetActivity(c *gin.Context) {
	orgID := c.GetString("organizationId")
	limit := services.ParseLimit(c.DefaultQuery("limit", "10"), 10)
	activity, err := h.svc.GetActivity(c.Request.Context(), orgID, limit)
	if err != nil {
		slog.Error("GetActivity", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, activity)
}
