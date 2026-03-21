package handlers

import (
	"context"
	"log/slog"
	"net/http"
	"strconv"

	"exponat/projects/internal/models"
	"exponat/projects/internal/repository"
	"exponat/projects/internal/services"
	"exponat/projects/internal/websocket"

	"github.com/gin-gonic/gin"
)

type Handlers struct {
	svc *services.ProjectService
	hub *websocket.Hub
}

func New(svc *services.ProjectService, hub *websocket.Hub) *Handlers {
	return &Handlers{svc: svc, hub: hub}
}

func (h *Handlers) Register(r *gin.RouterGroup) {
	g := r.Group("/projects")
	g.GET("/ws", h.serveWS)
	g.GET("", h.list)
	g.POST("", h.create)
	g.GET("/:id", h.get)
	g.PATCH("/:id", h.update)
	g.DELETE("/:id", h.delete)
	g.GET("/:id/team", h.getTeam)
	g.POST("/:id/team", h.addTeamMember)
	g.DELETE("/:id/team/:userId", h.removeTeamMember)
	g.GET("/:id/phases", h.getPhases)
	g.POST("/:id/phases", h.createPhase)
	g.PATCH("/:id/phases/:phaseId", h.updatePhase)
	g.DELETE("/:id/phases/:phaseId", h.deletePhase)
	g.GET("/:id/activity", h.activity)
}

func (h *Handlers) serveWS(c *gin.Context) {
	if h.hub == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "websocket disabled"})
		return
	}
	websocket.ServeWS(h.hub, c)
}

func parseFilters(c *gin.Context) models.ProjectFilters {
	f := models.ProjectFilters{
		Search:    c.Query("search"),
		DateFrom:  c.Query("dateFrom"),
		DateTo:    c.Query("dateTo"),
		ManagerID: c.Query("managerId"),
		SortBy:    c.Query("sortBy"),
		SortOrder: c.Query("sortOrder"),
		Status:    c.QueryArray("status"),
		Type:      c.QueryArray("type"),
	}
	if v := c.Query("budgetMin"); v != "" {
		if x, err := strconv.ParseFloat(v, 64); err == nil {
			f.BudgetMin = &x
		}
	}
	if v := c.Query("budgetMax"); v != "" {
		if x, err := strconv.ParseFloat(v, 64); err == nil {
			f.BudgetMax = &x
		}
	}
	if v := c.Query("page"); v != "" {
		if x, err := strconv.Atoi(v); err == nil {
			f.Page = x
		}
	}
	if v := c.Query("limit"); v != "" {
		if x, err := strconv.Atoi(v); err == nil {
			f.Limit = x
		}
	}
	return f
}

func (h *Handlers) list(c *gin.Context) {
	org := c.GetString("organizationId")
	if org == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "organizationId required (header X-Organization-Id or JWT)"})
		return
	}
	ctx := context.Background()
	out, err := h.svc.List(ctx, org, parseFilters(c))
	if err != nil {
		slog.Error("projects.list", "err", err, "org", org)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handlers) get(c *gin.Context) {
	org := c.GetString("organizationId")
	id := c.Param("id")
	ctx := context.Background()
	p, err := h.svc.GetDetail(ctx, id, org)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handlers) create(c *gin.Context) {
	var in models.ProjectCreateInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	uid := c.GetString("userId")
	ctx := context.Background()
	p, err := h.svc.Create(ctx, org, uid, in)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *Handlers) update(c *gin.Context) {
	var in models.ProjectUpdateInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	uid := c.GetString("userId")
	id := c.Param("id")
	ctx := context.Background()
	p, err := h.svc.Update(ctx, org, uid, id, in)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handlers) delete(c *gin.Context) {
	org := c.GetString("organizationId")
	id := c.Param("id")
	ctx := context.Background()
	if err := h.svc.Delete(ctx, org, id); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handlers) getTeam(c *gin.Context) {
	org := c.GetString("organizationId")
	id := c.Param("id")
	ctx := context.Background()
	team, err := h.svc.GetTeam(ctx, id, org)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, team)
}

func (h *Handlers) addTeamMember(c *gin.Context) {
	var in struct {
		UserID      string   `json:"userId" binding:"required"`
		Role        string   `json:"role" binding:"required"`
		Permissions []string `json:"permissions"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	id := c.Param("id")
	ctx := context.Background()
	if err := h.svc.AddTeamMember(ctx, id, org, in.UserID, in.Role, in.Permissions); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Team member added"})
}

func (h *Handlers) removeTeamMember(c *gin.Context) {
	org := c.GetString("organizationId")
	id := c.Param("id")
	member := c.Param("userId")
	ctx := context.Background()
	if err := h.svc.RemoveTeamMember(ctx, id, org, member); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handlers) getPhases(c *gin.Context) {
	org := c.GetString("organizationId")
	id := c.Param("id")
	ctx := context.Background()
	phases, err := h.svc.GetPhases(ctx, id, org)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, phases)
}

func (h *Handlers) createPhase(c *gin.Context) {
	var in models.PhaseInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	id := c.Param("id")
	ctx := context.Background()
	ph, err := h.svc.CreatePhase(ctx, id, org, in)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, ph)
}

func (h *Handlers) updatePhase(c *gin.Context) {
	var in models.PhasePatchInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	id := c.Param("id")
	phaseID := c.Param("phaseId")
	ctx := context.Background()
	ph, err := h.svc.UpdatePhase(ctx, id, org, phaseID, in)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ph)
}

func (h *Handlers) deletePhase(c *gin.Context) {
	org := c.GetString("organizationId")
	id := c.Param("id")
	phaseID := c.Param("phaseId")
	ctx := context.Background()
	if err := h.svc.DeletePhase(ctx, id, org, phaseID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handlers) activity(c *gin.Context) {
	org := c.GetString("organizationId")
	id := c.Param("id")
	limit := 50
	if v := c.Query("limit"); v != "" {
		if x, err := strconv.Atoi(v); err == nil {
			limit = x
		}
	}
	ctx := context.Background()
	rows, err := h.svc.GetActivity(ctx, id, org, limit)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rows)
}
