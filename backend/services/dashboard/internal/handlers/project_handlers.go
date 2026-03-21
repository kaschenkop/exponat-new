package handlers

import (
	"log/slog"
	"net/http"
	"os"
	"strings"

	"exponat/dashboard/internal/models"
	"exponat/dashboard/internal/services"

	"github.com/gin-gonic/gin"
)

type ProjectHandlers struct {
	svc *services.ProjectService
}

func NewProjectHandlers(svc *services.ProjectService) *ProjectHandlers {
	return &ProjectHandlers{svc: svc}
}

func (h *ProjectHandlers) List(c *gin.Context) {
	orgID := c.GetString("organizationId")
	f := services.ParseProjectFilters(c.Request.URL.Query())
	out, err := h.svc.List(c.Request.Context(), orgID, f)
	if err != nil {
		slog.Error("projects list", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *ProjectHandlers) Get(c *gin.Context) {
	orgID := c.GetString("organizationId")
	id := strings.TrimSpace(c.Param("id"))
	p, err := h.svc.Get(c.Request.Context(), orgID, id)
	if err != nil {
		slog.Error("project get", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	if p == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *ProjectHandlers) Create(c *gin.Context) {
	orgID := c.GetString("organizationId")
	var in models.ProjectCreateInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	p, err := h.svc.Create(c.Request.Context(), orgID, in)
	if err != nil {
		slog.Error("project create", "err", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *ProjectHandlers) Update(c *gin.Context) {
	orgID := c.GetString("organizationId")
	id := strings.TrimSpace(c.Param("id"))
	var in models.ProjectUpdateInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	p, err := h.svc.Update(c.Request.Context(), orgID, id, in)
	if err != nil {
		slog.Error("project update", "err", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	if p == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *ProjectHandlers) Delete(c *gin.Context) {
	orgID := c.GetString("organizationId")
	id := strings.TrimSpace(c.Param("id"))
	err := h.svc.Delete(c.Request.Context(), orgID, id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"message": "not found"})
			return
		}
		slog.Error("project delete", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

type statusBody struct {
	Status          string `json:"status"`
	KanbanPosition *int   `json:"kanbanPosition"`
}

func (h *ProjectHandlers) PatchStatus(c *gin.Context) {
	orgID := c.GetString("organizationId")
	id := strings.TrimSpace(c.Param("id"))
	var b statusBody
	if err := c.ShouldBindJSON(&b); err != nil || strings.TrimSpace(b.Status) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "status required"})
		return
	}
	p, err := h.svc.UpdateStatus(c.Request.Context(), orgID, id, strings.TrimSpace(b.Status), b.KanbanPosition)
	if err != nil {
		slog.Error("project status", "err", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	if p == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

type phaseBody struct {
	Status   *string `json:"status"`
	Progress *int    `json:"progress"`
}

func (h *ProjectHandlers) PatchPhase(c *gin.Context) {
	orgID := c.GetString("organizationId")
	pid := strings.TrimSpace(c.Param("id"))
	phid := strings.TrimSpace(c.Param("phaseId"))
	var b phaseBody
	if err := c.ShouldBindJSON(&b); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	if b.Status == nil && b.Progress == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "status or progress required"})
		return
	}
	out, err := h.svc.UpdatePhase(c.Request.Context(), orgID, pid, phid, b.Status, b.Progress)
	if err != nil {
		slog.Error("project phase", "err", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	if out == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "not found"})
		return
	}
	c.JSON(http.StatusOK, out)
}

func resolveWSOrgID(c *gin.Context) string {
	skip := os.Getenv("SKIP_AUTH") == "true" || os.Getenv("SKIP_AUTH") == "1"
	if skip {
		if q := strings.TrimSpace(c.Query("organizationId")); q != "" {
			return q
		}
		if d := strings.TrimSpace(os.Getenv("DEFAULT_ORGANIZATION_ID")); d != "" {
			return d
		}
	}
	return c.GetString("organizationId")
}
