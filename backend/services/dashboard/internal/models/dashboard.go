package models

type DashboardStats struct {
	ActiveProjects struct {
		Count  int     `json:"count"`
		Change float64 `json:"change"`
	} `json:"activeProjects"`
	TotalBudget struct {
		Amount   float64 `json:"amount"`
		Currency string  `json:"currency"`
		Change   float64 `json:"change"`
	} `json:"totalBudget"`
	Exhibits struct {
		Count  int     `json:"count"`
		Change float64 `json:"change"`
	} `json:"exhibits"`
	Participants struct {
		Count  int     `json:"count"`
		Change float64 `json:"change"`
	} `json:"participants"`
}

type DashboardProject struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Status      string  `json:"status"`
	StartDate   string  `json:"startDate"`
	EndDate     string  `json:"endDate"`
	TotalBudget float64 `json:"totalBudget"`
	TeamSize    int     `json:"teamSize"`
}

type BudgetTrendRow struct {
	Month   string  `json:"month"`
	Planned float64 `json:"planned"`
	Actual  float64 `json:"actual"`
}

type Event struct {
	ID        string `json:"id"`
	Type      string `json:"type"`
	Title     string `json:"title"`
	Date      string `json:"date"`
	Location  string `json:"location"`
	ProjectID string `json:"projectId"`
}

type Activity struct {
	ID         string `json:"id"`
	UserID     string `json:"userId"`
	UserName   string `json:"userName"`
	UserAvatar string `json:"userAvatar,omitempty"`
	Action     string `json:"action"`
	EntityType string `json:"entityType"`
	EntityID   string `json:"entityId"`
	Timestamp  string `json:"timestamp"`
}
