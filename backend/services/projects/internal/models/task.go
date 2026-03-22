package models

import "encoding/json"

type TaskStatus string

const (
	TaskStatusBacklog    TaskStatus = "backlog"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusReview     TaskStatus = "review"
	TaskStatusDone       TaskStatus = "done"
	TaskStatusCancelled  TaskStatus = "cancelled"
)

type TaskPriority string

const (
	TaskPriorityHigh   TaskPriority = "high"
	TaskPriorityMedium TaskPriority = "medium"
	TaskPriorityLow    TaskPriority = "low"
)

type TaskTag struct {
	Label string `json:"label"`
	Color string `json:"color"`
}

type SubtaskSummary struct {
	Completed int `json:"completed"`
	Total     int `json:"total"`
}

type Task struct {
	ID            string          `json:"id"`
	ProjectID     string          `json:"projectId"`
	TaskKey       string          `json:"taskKey"`
	Title         string          `json:"title"`
	Description   string          `json:"description"`
	Status        TaskStatus      `json:"status"`
	Priority      TaskPriority    `json:"priority"`
	AssigneeID    *string         `json:"assigneeId"`
	AssigneeName  string          `json:"assigneeName,omitempty"`
	GroupName     string          `json:"groupName"`
	StartDate     *string         `json:"startDate"`
	DueDate       *string         `json:"dueDate"`
	CompletedAt   *string         `json:"completedAt"`
	Progress      int             `json:"progress"`
	Tags          json.RawMessage `json:"tags"`
	Dependencies  []string        `json:"dependencies"`
	OrderNum      int             `json:"orderNum"`
	IsAtRisk      bool            `json:"isAtRisk"`
	Subtasks      *SubtaskSummary `json:"subtasks,omitempty"`
	CommentsCount int             `json:"commentsCount"`
	CreatedAt     string          `json:"createdAt"`
	UpdatedAt     string          `json:"updatedAt"`
}

type Subtask struct {
	ID          string `json:"id"`
	TaskID      string `json:"taskId"`
	Title       string `json:"title"`
	IsCompleted bool   `json:"isCompleted"`
	OrderNum    int    `json:"orderNum"`
}

type TaskComment struct {
	ID        string `json:"id"`
	TaskID    string `json:"taskId"`
	UserID    string `json:"userId"`
	UserName  string `json:"userName,omitempty"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type Milestone struct {
	ID          string `json:"id"`
	ProjectID   string `json:"projectId"`
	Title       string `json:"title"`
	Date        string `json:"date"`
	Description string `json:"description,omitempty"`
}

type TaskCreateInput struct {
	Title        string       `json:"title" binding:"required"`
	Description  string       `json:"description"`
	Status       TaskStatus   `json:"status"`
	Priority     TaskPriority `json:"priority"`
	AssigneeID   *string      `json:"assigneeId"`
	GroupName    string       `json:"groupName"`
	StartDate    *string      `json:"startDate"`
	DueDate      *string      `json:"dueDate"`
	Tags         []TaskTag    `json:"tags"`
	Dependencies []string     `json:"dependencies"`
}

type TaskUpdateInput struct {
	Title        *string       `json:"title"`
	Description  *string       `json:"description"`
	Status       *TaskStatus   `json:"status"`
	Priority     *TaskPriority `json:"priority"`
	AssigneeID   *string       `json:"assigneeId"`
	GroupName    *string       `json:"groupName"`
	StartDate    *string       `json:"startDate"`
	DueDate      *string       `json:"dueDate"`
	Progress     *int          `json:"progress"`
	Tags         *[]TaskTag    `json:"tags"`
	Dependencies *[]string     `json:"dependencies"`
	OrderNum     *int          `json:"orderNum"`
	IsAtRisk     *bool         `json:"isAtRisk"`
}

type TaskFilters struct {
	Status    []string `form:"status"`
	Priority  []string `form:"priority"`
	Assignee  []string `form:"assignee"`
	GroupName string   `form:"group"`
	Search    string   `form:"search"`
	DateFrom  string   `form:"dateFrom"`
	DateTo    string   `form:"dateTo"`
	SortBy    string   `form:"sortBy"`
	SortOrder string   `form:"sortOrder"`
	Page      int      `form:"page"`
	Limit     int      `form:"limit"`
}

type TaskReorderInput struct {
	TaskID   string     `json:"taskId" binding:"required"`
	Status   TaskStatus `json:"status" binding:"required"`
	OrderNum int        `json:"orderNum"`
}

type TaskListResponse struct {
	Data []Task   `json:"data"`
	Meta ListMeta `json:"meta"`
}

type MilestoneInput struct {
	Title       string `json:"title" binding:"required"`
	Date        string `json:"date" binding:"required"`
	Description string `json:"description"`
}

type MilestonePatchInput struct {
	Title       *string `json:"title"`
	Date        *string `json:"date"`
	Description *string `json:"description"`
}

type SubtaskInput struct {
	Title string `json:"title" binding:"required"`
}

type SubtaskPatchInput struct {
	Title       *string `json:"title"`
	IsCompleted *bool   `json:"isCompleted"`
}

type CommentInput struct {
	Content string `json:"content" binding:"required"`
}
