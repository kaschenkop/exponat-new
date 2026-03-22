package models

import "encoding/json"

type ProjectStatus string

const (
	StatusDraft     ProjectStatus = "draft"
	StatusPlanning  ProjectStatus = "planning"
	StatusActive    ProjectStatus = "active"
	StatusOnHold    ProjectStatus = "on_hold"
	StatusCompleted ProjectStatus = "completed"
	StatusCancelled ProjectStatus = "cancelled"
)

type ProjectType string

const (
	TypeMuseum    ProjectType = "museum"
	TypeCorporate ProjectType = "corporate"
	TypeExpoForum ProjectType = "expo_forum"
	TypeOther     ProjectType = "other"
)

type Location struct {
	Venue   string `json:"venue"`
	Address string `json:"address"`
	City    string `json:"city"`
	Country string `json:"country"`
}

type Project struct {
	ID                 string          `json:"id"`
	OrganizationID     string          `json:"organizationId"`
	Name               string          `json:"name"`
	Description        string          `json:"description"`
	Type               ProjectType     `json:"type"`
	Status             ProjectStatus   `json:"status"`
	StartDate          string          `json:"startDate"`
	EndDate            string          `json:"endDate"`
	CreatedAt          string          `json:"createdAt"`
	UpdatedAt          string          `json:"updatedAt"`
	TotalBudget        float64         `json:"totalBudget"`
	SpentBudget        float64         `json:"spentBudget"`
	Currency           string          `json:"currency"`
	Location           Location        `json:"location"`
	Team               []TeamMember    `json:"team"`
	ManagerID          string          `json:"managerId"`
	ManagerName        string          `json:"managerName,omitempty"`
	Progress           int             `json:"progress"`
	ExhibitsCount      int             `json:"exhibitsCount"`
	ParticipantsCount  int             `json:"participantsCount"`
	Tags               []string        `json:"tags"`
	CustomFields       json.RawMessage `json:"customFields,omitempty"`
}

type TeamMember struct {
	UserID      string   `json:"userId"`
	UserName    string   `json:"userName"`
	UserAvatar  string   `json:"userAvatar,omitempty"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
	JoinedAt    string   `json:"joinedAt"`
}

type ProjectPhase struct {
	ID           string   `json:"id"`
	ProjectID    string   `json:"projectId"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	StartDate    string   `json:"startDate"`
	EndDate      string   `json:"endDate"`
	Status       string   `json:"status"`
	Progress     int      `json:"progress"`
	Dependencies []string `json:"dependencies"`
	OrderNum     int      `json:"orderNum"`
}

type ProjectChange struct {
	ID         string          `json:"id"`
	ProjectID  string          `json:"projectId"`
	UserID     string          `json:"userId"`
	UserName   string          `json:"userName,omitempty"`
	ChangeType string          `json:"changeType"`
	FieldName  string          `json:"fieldName,omitempty"`
	OldValue   string          `json:"oldValue,omitempty"`
	NewValue   string          `json:"newValue,omitempty"`
	CreatedAt  string          `json:"createdAt"`
}

type ProjectCreateInput struct {
	Name          string   `json:"name" binding:"required"`
	Description   string   `json:"description"`
	Type          string   `json:"type" binding:"required"`
	StartDate     string   `json:"startDate" binding:"required"`
	EndDate       string   `json:"endDate" binding:"required"`
	TotalBudget   float64  `json:"totalBudget"`
	Location      Location `json:"location" binding:"required"`
	ManagerID     string   `json:"managerId" binding:"required"`
	TeamMemberIDs []string `json:"teamMemberIds"`
}

type ProjectUpdateInput struct {
	Name          *string  `json:"name"`
	Description   *string  `json:"description"`
	Type          *string  `json:"type"`
	Status        *string  `json:"status"`
	StartDate     *string  `json:"startDate"`
	EndDate       *string  `json:"endDate"`
	TotalBudget   *float64 `json:"totalBudget"`
	SpentBudget   *float64 `json:"spentBudget"`
	Location      *Location `json:"location"`
	ManagerID     *string  `json:"managerId"`
	Progress      *int     `json:"progress"`
	Tags          []string `json:"tags"`
	CustomFields  json.RawMessage `json:"customFields"`
}

type ProjectFilters struct {
	Search    string
	Status    []string
	Type      []string
	DateFrom  string
	DateTo    string
	BudgetMin *float64
	BudgetMax *float64
	ManagerID string
	SortBy    string
	SortOrder string
	Page      int
	Limit     int
}

type ListMeta struct {
	Total int `json:"total"`
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

type ListResponse struct {
	Data []Project `json:"data"`
	Meta ListMeta  `json:"meta"`
}

type PhaseInput struct {
	Name         string   `json:"name" binding:"required"`
	Description  string   `json:"description"`
	StartDate    string   `json:"startDate" binding:"required"`
	EndDate      string   `json:"endDate" binding:"required"`
	Status       string   `json:"status"`
	Progress     int      `json:"progress"`
	Dependencies []string `json:"dependencies"`
	OrderNum     int      `json:"orderNum"`
}

type PhasePatchInput struct {
	Name         *string  `json:"name"`
	Description  *string  `json:"description"`
	StartDate    *string  `json:"startDate"`
	EndDate      *string  `json:"endDate"`
	Status       *string  `json:"status"`
	Progress     *int     `json:"progress"`
	Dependencies []string `json:"dependencies"`
	OrderNum     *int     `json:"orderNum"`
}
