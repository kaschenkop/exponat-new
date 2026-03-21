package handlers

import (
	"context"
	"log/slog"
	"net/http"
	"strconv"

	"exponat/projects/internal/models"
	"exponat/projects/internal/repository"
	"exponat/projects/internal/services"

	"github.com/gin-gonic/gin"
)

type TaskHandlers struct {
	svc *services.TaskService
}

func NewTaskHandlers(svc *services.TaskService) *TaskHandlers {
	return &TaskHandlers{svc: svc}
}

func (h *TaskHandlers) Register(g *gin.RouterGroup) {
	g.GET("/:id/tasks", h.listTasks)
	g.POST("/:id/tasks", h.createTask)
	g.GET("/:id/tasks/:taskId", h.getTask)
	g.PATCH("/:id/tasks/:taskId", h.updateTask)
	g.DELETE("/:id/tasks/:taskId", h.deleteTask)
	g.PATCH("/:id/tasks-reorder", h.reorderTasks)

	g.GET("/:id/tasks/:taskId/subtasks", h.listSubtasks)
	g.POST("/:id/tasks/:taskId/subtasks", h.createSubtask)
	g.PATCH("/:id/tasks/:taskId/subtasks/:subId", h.updateSubtask)
	g.DELETE("/:id/tasks/:taskId/subtasks/:subId", h.deleteSubtask)

	g.GET("/:id/tasks/:taskId/comments", h.listComments)
	g.POST("/:id/tasks/:taskId/comments", h.createComment)

	g.GET("/:id/milestones", h.listMilestones)
	g.POST("/:id/milestones", h.createMilestone)
	g.PATCH("/:id/milestones/:msId", h.updateMilestone)
	g.DELETE("/:id/milestones/:msId", h.deleteMilestone)
}

func parseTaskFilters(c *gin.Context) models.TaskFilters {
	f := models.TaskFilters{
		Search:    c.Query("search"),
		GroupName: c.Query("group"),
		DateFrom:  c.Query("dateFrom"),
		DateTo:    c.Query("dateTo"),
		SortBy:    c.Query("sortBy"),
		SortOrder: c.Query("sortOrder"),
		Status:    c.QueryArray("status"),
		Priority:  c.QueryArray("priority"),
		Assignee:  c.QueryArray("assignee"),
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

func (h *TaskHandlers) listTasks(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	ctx := context.Background()
	out, err := h.svc.ListTasks(ctx, projectID, org, parseTaskFilters(c))
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		slog.Error("tasks.list", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *TaskHandlers) getTask(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	ctx := context.Background()
	t, err := h.svc.GetTask(ctx, projectID, org, taskID)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, t)
}

func (h *TaskHandlers) createTask(c *gin.Context) {
	var in models.TaskCreateInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	ctx := context.Background()
	t, err := h.svc.CreateTask(ctx, projectID, org, in)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, t)
}

func (h *TaskHandlers) updateTask(c *gin.Context) {
	var in models.TaskUpdateInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	ctx := context.Background()
	t, err := h.svc.UpdateTask(ctx, projectID, org, taskID, in)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, t)
}

func (h *TaskHandlers) deleteTask(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	ctx := context.Background()
	if err := h.svc.DeleteTask(ctx, projectID, org, taskID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *TaskHandlers) reorderTasks(c *gin.Context) {
	var items []models.TaskReorderInput
	if err := c.ShouldBindJSON(&items); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	ctx := context.Background()
	if err := h.svc.ReorderTasks(ctx, projectID, org, items); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

// --- Subtasks ---

func (h *TaskHandlers) listSubtasks(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	ctx := context.Background()
	out, err := h.svc.ListSubtasks(ctx, projectID, org, taskID)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *TaskHandlers) createSubtask(c *gin.Context) {
	var in models.SubtaskInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	ctx := context.Background()
	s, err := h.svc.CreateSubtask(ctx, projectID, org, taskID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusCreated, s)
}

func (h *TaskHandlers) updateSubtask(c *gin.Context) {
	var in models.SubtaskPatchInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	subID := c.Param("subId")
	ctx := context.Background()
	s, err := h.svc.UpdateSubtask(ctx, projectID, org, taskID, subID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusOK, s)
}

func (h *TaskHandlers) deleteSubtask(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	subID := c.Param("subId")
	ctx := context.Background()
	if err := h.svc.DeleteSubtask(ctx, projectID, org, taskID, subID); err != nil {
		handleErr(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// --- Comments ---

func (h *TaskHandlers) listComments(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	ctx := context.Background()
	out, err := h.svc.ListComments(ctx, projectID, org, taskID)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *TaskHandlers) createComment(c *gin.Context) {
	var in models.CommentInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	uid := c.GetString("userId")
	projectID := c.Param("id")
	taskID := c.Param("taskId")
	ctx := context.Background()
	cm, err := h.svc.CreateComment(ctx, projectID, org, taskID, uid, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusCreated, cm)
}

// --- Milestones ---

func (h *TaskHandlers) listMilestones(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	ctx := context.Background()
	out, err := h.svc.ListMilestones(ctx, projectID, org)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *TaskHandlers) createMilestone(c *gin.Context) {
	var in models.MilestoneInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	ctx := context.Background()
	m, err := h.svc.CreateMilestone(ctx, projectID, org, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *TaskHandlers) updateMilestone(c *gin.Context) {
	var in models.MilestonePatchInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	msID := c.Param("msId")
	ctx := context.Background()
	m, err := h.svc.UpdateMilestone(ctx, projectID, org, msID, in)
	if err != nil {
		handleErr(c, err)
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *TaskHandlers) deleteMilestone(c *gin.Context) {
	org := c.GetString("organizationId")
	projectID := c.Param("id")
	msID := c.Param("msId")
	ctx := context.Background()
	if err := h.svc.DeleteMilestone(ctx, projectID, org, msID); err != nil {
		handleErr(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func handleErr(c *gin.Context, err error) {
	if err == repository.ErrNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}
	slog.Error("task_handlers", "err", err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
}
