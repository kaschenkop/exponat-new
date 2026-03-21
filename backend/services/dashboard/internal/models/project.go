package models

import "encoding/json"

type ProjectLocation struct {
	Venue   string `json:"venue"`
	Address string `json:"address"`
	City    string `json:"city"`
	Country string `json:"country"`
}

type ProjectTeamMember struct {
	UserID      string   `json:"userId"`
	UserName    string   `json:"userName"`
	UserAvatar  string   `json:"userAvatar,omitempty"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
	JoinedAt    string   `json:"joinedAt"`
}

type ProjectPhase struct {
	ID            string   `json:"id"`
	ProjectID     string   `json:"projectId"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	StartDate     string   `json:"startDate"`
	EndDate       string   `json:"endDate"`
	Status        string   `json:"status"`
	Progress      int      `json:"progress"`
	Dependencies  []string `json:"dependencies"`
	SortOrder     int      `json:"sortOrder"`
}

type ProjectFile struct {
	ID          string `json:"id"`
	ProjectID   string `json:"projectId"`
	Name        string `json:"name"`
	URL         string `json:"url"`
	MimeType    string `json:"mimeType,omitempty"`
	SizeBytes   int64  `json:"sizeBytes,omitempty"`
	UploadedBy  string `json:"uploadedBy,omitempty"`
	CreatedAt   string `json:"createdAt"`
}

type ProjectActivityItem struct {
	ID         string `json:"id"`
	Action     string `json:"action"`
	UserID     string `json:"userId"`
	UserName   string `json:"userName"`
	UserAvatar string `json:"userAvatar,omitempty"`
	Timestamp  string `json:"timestamp"`
}

type Project struct {
	ID                 string             `json:"id"`
	OrganizationID     string             `json:"organizationId"`
	Name               string             `json:"name"`
	Description        string             `json:"description"`
	Type               string             `json:"type"`
	Status             string             `json:"status"`
	StartDate          string             `json:"startDate"`
	EndDate            string             `json:"endDate"`
	CreatedAt          string             `json:"createdAt"`
	UpdatedAt          string             `json:"updatedAt"`
	TotalBudget        float64            `json:"totalBudget"`
	SpentBudget        float64            `json:"spentBudget"`
	Currency           string             `json:"currency"`
	Location           ProjectLocation    `json:"location"`
	Team               []ProjectTeamMember `json:"team"`
	ManagerID          string             `json:"managerId"`
	Progress           int                `json:"progress"`
	ExhibitsCount      int                `json:"exhibitsCount"`
	ParticipantsCount  int                `json:"participantsCount"`
	Tags               []string            `json:"tags"`
	CustomFields       json.RawMessage     `json:"customFields"`
	Phases             []ProjectPhase     `json:"phases,omitempty"`
	Files              []ProjectFile      `json:"files,omitempty"`
	Activity           []ProjectActivityItem `json:"activity,omitempty"`
}

type ProjectCreateInput struct {
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	Type          string          `json:"type"`
	StartDate     string          `json:"startDate"`
	EndDate       string          `json:"endDate"`
	TotalBudget   float64         `json:"totalBudget"`
	Location      ProjectLocation `json:"location"`
	ManagerID     string          `json:"managerId"`
	TeamMemberIDs []string        `json:"teamMemberIds"`
}

type ProjectUpdateInput struct {
	Name          *string          `json:"name"`
	Description   *string          `json:"description"`
	Type          *string          `json:"type"`
	Status        *string          `json:"status"`
	StartDate     *string          `json:"startDate"`
	EndDate       *string          `json:"endDate"`
	TotalBudget   *float64         `json:"totalBudget"`
	SpentBudget   *float64         `json:"spentBudget"`
	Location      *ProjectLocation `json:"location"`
	ManagerID     *string          `json:"managerId"`
	Progress      *int             `json:"progress"`
	Tags          *[]string        `json:"tags"`
	CustomFields  json.RawMessage  `json:"customFields"`
	TeamMemberIDs *[]string        `json:"teamMemberIds"`
}

type ProjectFilters struct {
	Search    string
	Statuses  []string
	Types     []string
	DateFrom  string
	DateTo    string
	BudgetMin *float64
	BudgetMax *float64
	ManagerID string
	SortBy    string
	SortDir   string
	Limit     int
	Offset    int
}

type ProjectListResult struct {
	Items []Project `json:"items"`
	Total int       `json:"total"`
}

type ProjectCollaborationMessage struct {
	Type      string `json:"type"`
	ProjectID string `json:"projectId,omitempty"`
	Payload   any    `json:"payload,omitempty"`
}
