package models

import "time"

type Budget struct {
	ID             string    `json:"id"`
	ProjectID      string    `json:"project_id"`
	OrganizationID string    `json:"organization_id"`
	TotalAmount    float64   `json:"total_amount"`
	SpentAmount    float64   `json:"spent_amount"`
	Currency       string    `json:"currency"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type BudgetCategory struct {
	ID         string  `json:"id"`
	BudgetID   string  `json:"budget_id"`
	Name       string  `json:"name"`
	Allocated  float64 `json:"allocated"`
	Spent      float64 `json:"spent"`
}

type Expense struct {
	ID          string    `json:"id"`
	BudgetID    string    `json:"budget_id"`
	CategoryID  string    `json:"category_id"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
}
