package store

import (
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

// JSON DTOs (camelCase) aligned with the web app.

type BudgetSettings struct {
	RequireApproval    bool    `json:"requireApproval"`
	ApprovalThreshold  float64 `json:"approvalThreshold"`
	AutoSyncWith1C     bool    `json:"autoSyncWith1C"`
	NotifyOnThreshold  bool    `json:"notifyOnThreshold"`
}

type Budget struct {
	ID                 string         `json:"id"`
	ProjectID          string         `json:"projectId"`
	OrganizationID     string         `json:"organizationId"`
	Name               string         `json:"name"`
	Description        string         `json:"description"`
	Status             string         `json:"status"`
	Period             string         `json:"period"`
	Currency           string         `json:"currency"`
	StartDate          string         `json:"startDate"`
	EndDate            string         `json:"endDate"`
	CreatedAt          string         `json:"createdAt"`
	UpdatedAt          string         `json:"updatedAt"`
	TotalPlanned       float64        `json:"totalPlanned"`
	TotalSpent         float64        `json:"totalSpent"`
	TotalApproved      float64        `json:"totalApproved"`
	TotalPending       float64        `json:"totalPending"`
	TotalRemaining     float64        `json:"totalRemaining"`
	ProgressPercent    float64        `json:"progressPercent"`
	WarningThreshold   float64        `json:"warningThreshold"`
	CriticalThreshold  float64        `json:"criticalThreshold"`
	IsOverBudget       bool           `json:"isOverBudget"`
	ManagerID          string         `json:"managerId"`
	ManagerName        string         `json:"managerName"`
	Settings           BudgetSettings `json:"settings"`
}

type Category struct {
	ID              string     `json:"id"`
	BudgetID        string     `json:"budgetId"`
	ParentID        *string    `json:"parentId"`
	Path            string     `json:"path"`
	Level           int        `json:"level"`
	Order           int        `json:"order"`
	Name            string     `json:"name"`
	Code            string     `json:"code"`
	Description     string     `json:"description"`
	Color           string     `json:"color"`
	Icon            string     `json:"icon"`
	PlannedAmount   float64    `json:"plannedAmount"`
	SpentAmount     float64    `json:"spentAmount"`
	ApprovedAmount  float64    `json:"approvedAmount"`
	PendingAmount   float64    `json:"pendingAmount"`
	RemainingAmount float64    `json:"remainingAmount"`
	Children        []Category `json:"children"`
	HasChildren     bool       `json:"hasChildren"`
	ChildrenCount   int        `json:"childrenCount"`
	ProgressPercent float64    `json:"progressPercent"`
	IsOverBudget    bool       `json:"isOverBudget"`
	OnecID          *string    `json:"onecId"`
	OnecSynced      bool       `json:"onecSynced"`
	LastSyncAt      *string    `json:"lastSyncAt"`
	CreatedAt       string     `json:"createdAt"`
	UpdatedAt       string     `json:"updatedAt"`
}

type ExpenseAttachment struct {
	ID         string `json:"id"`
	ExpenseID  string `json:"expenseId"`
	FileName   string `json:"fileName"`
	FileURL    string `json:"fileUrl"`
	FileSize   int64  `json:"fileSize"`
	MimeType   string `json:"mimeType"`
	UploadedBy string `json:"uploadedBy"`
	UploadedAt string `json:"uploadedAt"`
}

type Expense struct {
	ID                string              `json:"id"`
	BudgetID          string              `json:"budgetId"`
	CategoryID        string              `json:"categoryId"`
	OrganizationID    string              `json:"organizationId"`
	Title             string              `json:"title"`
	Description       string              `json:"description"`
	Type              string              `json:"type"`
	Status            string              `json:"status"`
	Amount            float64             `json:"amount"`
	Currency          string              `json:"currency"`
	AmountRUB         float64             `json:"amountRUB"`
	ExpenseDate       string              `json:"expenseDate"`
	DueDate           *string             `json:"dueDate"`
	PaidDate          *string             `json:"paidDate"`
	CreatedAt         string              `json:"createdAt"`
	UpdatedAt         string              `json:"updatedAt"`
	PaymentMethod     string              `json:"paymentMethod"`
	InvoiceNumber     *string             `json:"invoiceNumber"`
	ContractNumber    *string             `json:"contractNumber"`
	CreatedBy         string              `json:"createdBy"`
	CreatedByName     string              `json:"createdByName"`
	Vendor            string              `json:"vendor"`
	VendorINN         *string             `json:"vendorINN"`
	RequiresApproval  bool                `json:"requiresApproval"`
	ApprovalStatus    *string             `json:"approvalStatus"`
	ApprovedBy        *string             `json:"approvedBy"`
	ApprovedByName    *string             `json:"approvedByName"`
	ApprovedAt        *string             `json:"approvedAt"`
	RejectionReason   *string             `json:"rejectionReason"`
	Attachments       []ExpenseAttachment `json:"attachments"`
	AttachmentCount   int                 `json:"attachmentCount"`
	CategoryName      string              `json:"categoryName"`
	CategoryPath      string              `json:"categoryPath"`
	OnecID            *string             `json:"onecId"`
	OnecSynced        bool                `json:"onecSynced"`
	LastSyncAt        *string             `json:"lastSyncAt"`
	Tags              []string            `json:"tags"`
	Notes             string              `json:"notes"`
}

type ApprovalHistoryItem struct {
	ID        string `json:"id"`
	Action    string `json:"action"`
	UserID    string `json:"userId"`
	UserName  string `json:"userName"`
	UserAvatar *string `json:"userAvatar"`
	Comment   string `json:"comment"`
	Timestamp string `json:"timestamp"`
}

type ApprovalRequest struct {
	ID                 string                `json:"id"`
	ExpenseID          string                `json:"expenseId"`
	BudgetID           string                `json:"budgetId"`
	ExpenseTitle       string                `json:"expenseTitle"`
	ExpenseAmount      float64               `json:"expenseAmount"`
	ExpenseCurrency    string                `json:"expenseCurrency"`
	CategoryName       string                `json:"categoryName"`
	Vendor             string                `json:"vendor"`
	Level              int                   `json:"level"`
	RequiredApprovers  []string              `json:"requiredApprovers"`
	CurrentApprover    *string               `json:"currentApprover"`
	Status             string                `json:"status"`
	CreatedAt          string                `json:"createdAt"`
	DueDate            string                `json:"dueDate"`
	RespondedAt        *string               `json:"respondedAt"`
	History            []ApprovalHistoryItem `json:"history"`
}

type TrendPoint struct {
	Date  string  `json:"date"`
	Value float64 `json:"value"`
}

type NameValue struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type MonthCompare struct {
	Month   string  `json:"month"`
	Planned float64 `json:"planned"`
	Actual  float64 `json:"actual"`
}

type Forecast struct {
	ProjectedTotal float64 `json:"projectedTotal"`
	Confidence     float64 `json:"confidence"`
	Message        string  `json:"message"`
}

type Analytics struct {
	Trends             []TrendPoint   `json:"trends"`
	CategoryBreakdown  []NameValue    `json:"categoryBreakdown"`
	MonthlyComparison  []MonthCompare `json:"monthlyComparison"`
	Forecast           Forecast       `json:"forecast"`
	TopExpenses        []Expense      `json:"topExpenses"`
}

type SyncLogEntry struct {
	ID        string `json:"id"`
	Level     string `json:"level"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

type IntegrationState struct {
	Connected    bool           `json:"connected"`
	LastSyncAt   *string        `json:"lastSyncAt"`
	MappingCount int            `json:"mappingCount"`
	BaseURL      string         `json:"baseUrl"`
	Logs         []SyncLogEntry `json:"logs"`
}

type Memory struct {
	mu         sync.RWMutex
	budgets    map[string]*Budget
	categories map[string]*Category
	expenses   map[string]*Expense
	approvals  map[string]*ApprovalRequest
	integ      map[string]*IntegrationState
}

func NewMemory() *Memory {
	m := &Memory{
		budgets:    make(map[string]*Budget),
		categories: make(map[string]*Category),
		expenses:   make(map[string]*Expense),
		approvals:  make(map[string]*ApprovalRequest),
		integ:      make(map[string]*IntegrationState),
	}
	m.seed()
	return m
}

const demoOrg = "11111111-1111-1111-1111-111111111111"

func (m *Memory) seed() {
	now := time.Now().UTC()
	budgetID := "b0000001-0001-0001-0001-000000000001"
	projectID := "p0000001-0001-0001-0001-000000000001"
	catRoot := "c0000001-0001-0001-0001-000000000001"
	catChild1 := "c0000001-0001-0001-0001-000000000002"
	catChild2 := "c0000001-0001-0001-0001-000000000003"

	pidRoot := (*string)(nil)
	pidChild := catRoot

	m.budgets[budgetID] = &Budget{
		ID:                budgetID,
		ProjectID:         projectID,
		OrganizationID:    demoOrg,
		Name:              "Выставка «Северное сияние»",
		Description:       "Операционный бюджет выставки",
		Status:            "active",
		Period:            "quarterly",
		Currency:          "RUB",
		StartDate:         now.AddDate(0, -2, 0).Format("2006-01-02"),
		EndDate:           now.AddDate(0, 4, 0).Format("2006-01-02"),
		CreatedAt:         now.AddDate(0, -2, 0).Format(time.RFC3339),
		UpdatedAt:         now.Format(time.RFC3339),
		TotalPlanned:      5_000_000,
		WarningThreshold:  80,
		CriticalThreshold: 90,
		ManagerID:         "22222222-2222-2222-2222-222222222222",
		ManagerName:       "Иванова А.",
		Settings: BudgetSettings{
			RequireApproval:    true,
			ApprovalThreshold:  150_000,
			AutoSyncWith1C:     false,
			NotifyOnThreshold:  true,
		},
	}

	m.categories[catRoot] = &Category{
		ID: catRoot, BudgetID: budgetID, ParentID: pidRoot, Path: "1", Level: 0, Order: 0,
		Name: "Маркетинг", Code: "MKT", Description: "", Color: "#2563eb", Icon: "Megaphone",
		PlannedAmount: 2_000_000, CreatedAt: now.Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339),
	}
	m.categories[catChild1] = &Category{
		ID: catChild1, BudgetID: budgetID, ParentID: &pidChild, Path: "1.1", Level: 1, Order: 0,
		Name: "Реклама", Code: "MKT-ADV", Description: "", Color: "#7c3aed", Icon: "Radio",
		PlannedAmount: 1_200_000, CreatedAt: now.Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339),
	}
	m.categories[catChild2] = &Category{
		ID: catChild2, BudgetID: budgetID, ParentID: &pidChild, Path: "1.2", Level: 1, Order: 1,
		Name: "Перевозка", Code: "MKT-LOG", Description: "", Color: "#059669", Icon: "Truck",
		PlannedAmount: 800_000, CreatedAt: now.Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339),
	}

	e1 := "e0000001-0001-0001-0001-000000000001"
	e2 := "e0000001-0001-0001-0001-000000000002"
	e3 := "e0000001-0001-0001-0001-000000000003"

	m.expenses[e1] = &Expense{
		ID: e1, BudgetID: budgetID, CategoryID: catChild1, OrganizationID: demoOrg,
		Title: "Баннеры и наружка", Description: "", Type: "invoice", Status: "paid",
		Amount: 320_000, Currency: "RUB", AmountRUB: 320_000,
		ExpenseDate: now.AddDate(0, 0, -5).Format("2006-01-02"),
		CreatedAt: now.AddDate(0, 0, -6).Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339),
		PaymentMethod: "bank_transfer", Vendor: "ООО «Реклама»", VendorINN: strPtr("7701234567"),
		CreatedBy: "22222222-2222-2222-2222-222222222222", CreatedByName: "Иванова А.",
		CategoryName: "Реклама", CategoryPath: "Маркетинг > Реклама", Tags: []string{}, Notes: "",
		OnecSynced: false, RequiresApproval: false, ApprovalStatus: nil,
		Attachments: []ExpenseAttachment{}, AttachmentCount: 0,
	}
	m.expenses[e2] = &Expense{
		ID: e2, BudgetID: budgetID, CategoryID: catChild2, OrganizationID: demoOrg,
		Title: "Логистика монтажа", Description: "", Type: "contract", Status: "pending_approval",
		Amount: 410_000, Currency: "RUB", AmountRUB: 410_000,
		ExpenseDate: now.AddDate(0, 0, -1).Format("2006-01-02"),
		CreatedAt: now.AddDate(0, 0, -2).Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339),
		PaymentMethod: "bank_transfer", Vendor: "ТК «Север»", VendorINN: strPtr("7809988776"),
		CreatedBy: "22222222-2222-2222-2222-222222222222", CreatedByName: "Иванова А.",
		CategoryName: "Перевозка", CategoryPath: "Маркетинг > Перевозка", Tags: []string{}, Notes: "",
		OnecSynced: false, RequiresApproval: true, ApprovalStatus: strPtr("pending"),
		Attachments: []ExpenseAttachment{}, AttachmentCount: 0,
	}
	m.expenses[e3] = &Expense{
		ID: e3, BudgetID: budgetID, CategoryID: catChild1, OrganizationID: demoOrg,
		Title: "SMM-кампания", Description: "", Type: "invoice", Status: "approved",
		Amount: 180_000, Currency: "RUB", AmountRUB: 180_000,
		ExpenseDate: now.AddDate(0, 0, -10).Format("2006-01-02"),
		CreatedAt: now.AddDate(0, 0, -12).Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339),
		PaymentMethod: "card", Vendor: "Агентство «Пиксель»", VendorINN: strPtr("7700001122"),
		CreatedBy: "22222222-2222-2222-2222-222222222222", CreatedByName: "Иванова А.",
		CategoryName: "Реклама", CategoryPath: "Маркетинг > Реклама", Tags: []string{}, Notes: "",
		OnecSynced: false, RequiresApproval: true, ApprovalStatus: strPtr("approved"),
		ApprovedBy: strPtr("33333333-3333-3333-3333-333333333333"), ApprovedByName: strPtr("Петров С."),
		ApprovedAt: strPtr(now.AddDate(0, 0, -9).Format(time.RFC3339)),
		Attachments: []ExpenseAttachment{}, AttachmentCount: 0,
	}

	a1 := "a0000001-0001-0001-0001-000000000001"
	m.approvals[a1] = &ApprovalRequest{
		ID: a1, ExpenseID: e2, BudgetID: budgetID,
		ExpenseTitle: "Логистика монтажа", ExpenseAmount: 410_000, ExpenseCurrency: "RUB",
		CategoryName: "Перевозка", Vendor: "ТК «Север»",
		Level: 1, RequiredApprovers: []string{"33333333-3333-3333-3333-333333333333"},
		CurrentApprover: strPtr("33333333-3333-3333-3333-333333333333"),
		Status:            "pending",
		CreatedAt:         now.AddDate(0, 0, -2).Format(time.RFC3339),
		DueDate:           now.AddDate(0, 0, 3).Format(time.RFC3339),
		History:           []ApprovalHistoryItem{},
	}

	lastSync := now.Add(-2 * time.Hour).Format(time.RFC3339)
	m.integ[budgetID] = &IntegrationState{
		Connected:    true,
		LastSyncAt:   &lastSync,
		MappingCount: 12,
		BaseURL:      "https://1c.example.local/exponat",
		Logs: []SyncLogEntry{
			{ID: uuid.NewString(), Level: "info", Message: "Синхронизация категорий завершена", Timestamp: lastSync},
		},
	}

	m.recomputeBudget(budgetID)
	for _, cid := range []string{catRoot, catChild1, catChild2} {
		m.recomputeCategory(cid)
	}
}

func strPtr(s string) *string { return &s }

func (m *Memory) recomputeCategory(categoryID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.recomputeCategoryUnlocked(categoryID)
}

func (m *Memory) recomputeBudget(budgetID string) {
	b := m.budgets[budgetID]
	if b == nil {
		return
	}
	var planned, spent, approved, pending float64
	for _, c := range m.categories {
		if c.BudgetID != budgetID {
			continue
		}
		planned += c.PlannedAmount
	}
	for _, e := range m.expenses {
		if e.BudgetID != budgetID {
			continue
		}
		switch e.Status {
		case "paid":
			spent += e.AmountRUB
		case "approved":
			approved += e.AmountRUB
			spent += e.AmountRUB
		case "pending_approval":
			pending += e.AmountRUB
		}
	}
	b.TotalPlanned = planned
	b.TotalSpent = spent
	b.TotalApproved = approved
	b.TotalPending = pending
	b.TotalRemaining = planned - spent - pending
	if planned > 0 {
		b.ProgressPercent = math.Min(100, (spent/planned)*100)
	}
	b.IsOverBudget = b.TotalRemaining < 0
	b.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
}

// ListBudgets returns budgets for an organization.
func (m *Memory) ListBudgets(orgID string) []Budget {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]Budget, 0)
	for _, b := range m.budgets {
		if b.OrganizationID != orgID {
			continue
		}
		cp := *b
		m.recomputeBudgetUnlocked(b.ID, &cp)
		out = append(out, cp)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].UpdatedAt > out[j].UpdatedAt })
	return out
}

func (m *Memory) GetBudget(id string) (*Budget, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	b, ok := m.budgets[id]
	if !ok {
		return nil, false
	}
	copy := *b
	m.recomputeBudgetUnlocked(id, &copy)
	return &copy, true
}

func (m *Memory) recomputeBudgetUnlocked(budgetID string, b *Budget) {
	var planned, spent, approved, pending float64
	for _, c := range m.categories {
		if c.BudgetID != budgetID {
			continue
		}
		planned += c.PlannedAmount
	}
	for _, e := range m.expenses {
		if e.BudgetID != budgetID {
			continue
		}
		switch e.Status {
		case "paid":
			spent += e.AmountRUB
		case "approved":
			approved += e.AmountRUB
			spent += e.AmountRUB
		case "pending_approval":
			pending += e.AmountRUB
		}
	}
	b.TotalPlanned = planned
	b.TotalSpent = spent
	b.TotalApproved = approved
	b.TotalPending = pending
	b.TotalRemaining = planned - spent - pending
	if planned > 0 {
		b.ProgressPercent = math.Min(100, (spent/planned)*100)
	}
	b.IsOverBudget = b.TotalRemaining < 0
}

// CreateBudget creates a new budget.
func (m *Memory) CreateBudget(orgID string, body json.RawMessage) (Budget, error) {
	var in struct {
		ProjectID   string `json:"projectId"`
		Name        string `json:"name"`
		Description string `json:"description"`
		Status      string `json:"status"`
		Period      string `json:"period"`
		Currency    string `json:"currency"`
		StartDate   string `json:"startDate"`
		EndDate     string `json:"endDate"`
		TotalPlanned float64 `json:"totalPlanned"`
	}
	if err := json.Unmarshal(body, &in); err != nil {
		return Budget{}, err
	}
	if in.Name == "" {
		return Budget{}, fmt.Errorf("name required")
	}
	now := time.Now().UTC().Format(time.RFC3339)
	id := uuid.NewString()
	if in.ProjectID == "" {
		in.ProjectID = uuid.NewString()
	}
	if in.Currency == "" {
		in.Currency = "RUB"
	}
	if in.Status == "" {
		in.Status = "draft"
	}
	if in.Period == "" {
		in.Period = "monthly"
	}
	b := &Budget{
		ID: id, ProjectID: in.ProjectID, OrganizationID: orgID,
		Name: in.Name, Description: in.Description, Status: in.Status, Period: in.Period, Currency: in.Currency,
		StartDate: in.StartDate, EndDate: in.EndDate,
		CreatedAt: now, UpdatedAt: now,
		TotalPlanned: in.TotalPlanned, WarningThreshold: 80, CriticalThreshold: 90,
		ManagerID: "22222222-2222-2222-2222-222222222222", ManagerName: "Менеджер",
		Settings: BudgetSettings{RequireApproval: true, ApprovalThreshold: 100_000, AutoSyncWith1C: false, NotifyOnThreshold: true},
	}
	m.mu.Lock()
	m.budgets[id] = b
	m.integ[id] = &IntegrationState{Connected: false, MappingCount: 0, BaseURL: "", Logs: []SyncLogEntry{}}
	m.recomputeBudgetUnlockedFull(id)
	out := *m.budgets[id]
	m.mu.Unlock()
	return out, nil
}

// ListCategoriesFlat returns categories for budget (flat, client builds tree).
func (m *Memory) ListCategoriesFlat(budgetID string) []Category {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, c := range m.categories {
		if c.BudgetID == budgetID {
			m.recomputeCategoryUnlocked(c.ID)
		}
	}
	out := make([]Category, 0)
	for _, c := range m.categories {
		if c.BudgetID != budgetID {
			continue
		}
		copy := *c
		copy.Children = nil
		out = append(out, copy)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Path != out[j].Path {
			return out[i].Path < out[j].Path
		}
		return out[i].Order < out[j].Order
	})
	return out
}

// CreateCategory adds category.
func (m *Memory) CreateCategory(budgetID string, body json.RawMessage) (Category, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var in struct {
		ParentID      *string `json:"parentId"`
		Name          string  `json:"name"`
		Code          string  `json:"code"`
		Description   string  `json:"description"`
		Color         string  `json:"color"`
		Icon          string  `json:"icon"`
		PlannedAmount float64 `json:"plannedAmount"`
	}
	if err := json.Unmarshal(body, &in); err != nil {
		return Category{}, err
	}
	if m.budgets[budgetID] == nil {
		return Category{}, fmt.Errorf("budget not found")
	}
	if in.Name == "" {
		return Category{}, fmt.Errorf("name required")
	}
	id := uuid.NewString()
	level := 0
	var path string
	var order int
	if in.ParentID != nil && *in.ParentID != "" {
		p := m.categories[*in.ParentID]
		if p == nil || p.BudgetID != budgetID {
			return Category{}, fmt.Errorf("invalid parent")
		}
		level = p.Level + 1
		// path: count siblings
		n := 0
		for _, c := range m.categories {
			if c.BudgetID == budgetID && c.ParentID != nil && *c.ParentID == *in.ParentID {
				n++
			}
		}
		path = fmt.Sprintf("%s.%d", p.Path, n+1)
		order = n
	} else {
		n := 0
		for _, c := range m.categories {
			if c.BudgetID == budgetID && c.ParentID == nil {
				n++
			}
		}
		path = fmt.Sprintf("%d", n+1)
		order = n
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if in.Color == "" {
		in.Color = "#64748b"
	}
	if in.Icon == "" {
		in.Icon = "Folder"
	}
	c := &Category{
		ID: id, BudgetID: budgetID, ParentID: in.ParentID, Path: path, Level: level, Order: order,
		Name: in.Name, Code: in.Code, Description: in.Description, Color: in.Color, Icon: in.Icon,
		PlannedAmount: in.PlannedAmount, CreatedAt: now, UpdatedAt: now,
	}
	m.categories[id] = c
	m.recomputeCategoryUnlocked(id)
	for _, cc := range m.categories {
		if cc.BudgetID == budgetID {
			m.recomputeCategoryUnlocked(cc.ID)
		}
	}
	return *m.categories[id], nil
}

func (m *Memory) recomputeCategoryUnlocked(categoryID string) {
	c := m.categories[categoryID]
	if c == nil {
		return
	}
	var spent, approved, pending float64
	for _, ex := range m.expenses {
		if ex.CategoryID != categoryID {
			continue
		}
		switch ex.Status {
		case "paid":
			spent += ex.AmountRUB
		case "approved":
			approved += ex.AmountRUB
			spent += ex.AmountRUB
		case "pending_approval":
			pending += ex.AmountRUB
		}
	}
	c.SpentAmount = spent
	c.ApprovedAmount = approved
	c.PendingAmount = pending
	c.RemainingAmount = c.PlannedAmount - spent - pending
	if c.PlannedAmount > 0 {
		c.ProgressPercent = math.Min(100, (spent/c.PlannedAmount)*100)
	}
	c.IsOverBudget = c.RemainingAmount < 0
	childCount := 0
	for _, ch := range m.categories {
		if ch.ParentID != nil && *ch.ParentID == categoryID {
			childCount++
		}
	}
	c.ChildrenCount = childCount
	c.HasChildren = childCount > 0
	c.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
}

// DeleteCategory removes category and descendants.
func (m *Memory) DeleteCategory(budgetID, categoryID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	c := m.categories[categoryID]
	if c == nil || c.BudgetID != budgetID {
		return fmt.Errorf("not found")
	}
	toDelete := []string{categoryID}
	for i := 0; i < len(toDelete); i++ {
		id := toDelete[i]
		for cid, ch := range m.categories {
			if ch.ParentID != nil && *ch.ParentID == id {
				toDelete = append(toDelete, cid)
			}
		}
	}
	seen := map[string]bool{}
	var uniq []string
	for _, id := range toDelete {
		if !seen[id] {
			seen[id] = true
			uniq = append(uniq, id)
		}
	}
	for _, id := range uniq {
		delete(m.categories, id)
	}
	return nil
}

// ListExpenses returns paginated expenses.
func (m *Memory) ListExpenses(budgetID string, page, limit int, search string) ([]Expense, int) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var list []*Expense
	for _, e := range m.expenses {
		if e.BudgetID == budgetID {
			if search != "" && !strings.Contains(strings.ToLower(e.Title+e.Vendor+e.CategoryName), strings.ToLower(search)) {
				continue
			}
			list = append(list, e)
		}
	}
	sort.Slice(list, func(i, j int) bool { return list[i].CreatedAt > list[j].CreatedAt })
	total := len(list)
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	start := (page - 1) * limit
	if start > total {
		return []Expense{}, total
	}
	end := start + limit
	if end > total {
		end = total
	}
	out := make([]Expense, 0, end-start)
	for i := start; i < end; i++ {
		out = append(out, *list[i])
	}
	return out, total
}

func (m *Memory) CreateExpense(budgetID, orgID, userID string, body json.RawMessage) (Expense, error) {
	var in Expense
	if err := json.Unmarshal(body, &in); err != nil {
		return Expense{}, err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.budgets[budgetID] == nil {
		return Expense{}, fmt.Errorf("budget not found")
	}
	if in.CategoryID == "" || in.Title == "" {
		return Expense{}, fmt.Errorf("categoryId and title required")
	}
	cat := m.categories[in.CategoryID]
	if cat == nil || cat.BudgetID != budgetID {
		return Expense{}, fmt.Errorf("invalid category")
	}
	id := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	in.ID = id
	in.BudgetID = budgetID
	in.OrganizationID = orgID
	in.CreatedAt = now
	in.UpdatedAt = now
	if in.Currency == "" {
		in.Currency = "RUB"
	}
	in.AmountRUB = in.Amount
	if in.Status == "" {
		in.Status = "draft"
	}
	if in.Type == "" {
		in.Type = "other"
	}
	if in.PaymentMethod == "" {
		in.PaymentMethod = "other"
	}
	in.CreatedBy = userID
	if in.CreatedByName == "" {
		in.CreatedByName = "Пользователь"
	}
	in.CategoryName = cat.Name
	in.CategoryPath = m.categoryPathUnlocked(cat)
	in.Attachments = []ExpenseAttachment{}
	in.AttachmentCount = 0
	m.expenses[id] = &in
	m.recomputeAfterExpense(budgetID)
	return *m.expenses[id], nil
}

func (m *Memory) categoryPathUnlocked(cat *Category) string {
	var parts []string
	walk := cat
	for walk != nil {
		parts = append([]string{walk.Name}, parts...)
		if walk.ParentID == nil {
			break
		}
		walk = m.categories[*walk.ParentID]
	}
	return strings.Join(parts, " > ")
}

func (m *Memory) recomputeAfterExpense(budgetID string) {
	for id, c := range m.categories {
		if c.BudgetID == budgetID {
			m.recomputeCategoryUnlocked(id)
		}
	}
	m.recomputeBudgetUnlockedFull(budgetID)
}

func (m *Memory) recomputeBudgetUnlockedFull(budgetID string) {
	b := m.budgets[budgetID]
	if b == nil {
		return
	}
	m.recomputeBudgetUnlocked(budgetID, b)
}

// ListApprovals .
func (m *Memory) ListApprovals(budgetID, status string) []ApprovalRequest {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]ApprovalRequest, 0)
	for _, a := range m.approvals {
		if a.BudgetID != budgetID {
			continue
		}
		if status != "" && a.Status != status {
			continue
		}
		out = append(out, *a)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt > out[j].CreatedAt })
	return out
}

// Approve sets approval approved.
func (m *Memory) Approve(budgetID, approvalID, userID, userName, comment string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	a := m.approvals[approvalID]
	if a == nil || a.BudgetID != budgetID {
		return fmt.Errorf("not found")
	}
	now := time.Now().UTC().Format(time.RFC3339)
	a.Status = "approved"
	a.RespondedAt = &now
	a.History = append(a.History, ApprovalHistoryItem{
		ID: uuid.NewString(), Action: "approve", UserID: userID, UserName: userName,
		Comment: comment, Timestamp: now,
	})
	ex := m.expenses[a.ExpenseID]
	if ex != nil {
		ex.Status = "approved"
		st := "approved"
		ex.ApprovalStatus = &st
		ex.ApprovedBy = &userID
		ex.ApprovedByName = &userName
		ex.ApprovedAt = &now
		ex.UpdatedAt = now
	}
	a.Status = "approved"
	a.RespondedAt = &now
	a.CurrentApprover = nil
	m.recomputeAfterExpense(budgetID)
	return nil
}

// Reject .
func (m *Memory) Reject(budgetID, approvalID, userID, userName, reason string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	a := m.approvals[approvalID]
	if a == nil || a.BudgetID != budgetID {
		return fmt.Errorf("not found")
	}
	now := time.Now().UTC().Format(time.RFC3339)
	a.Status = "rejected"
	a.RespondedAt = &now
	a.History = append(a.History, ApprovalHistoryItem{
		ID: uuid.NewString(), Action: "reject", UserID: userID, UserName: userName,
		Comment: reason, Timestamp: now,
	})
	ex := m.expenses[a.ExpenseID]
	if ex != nil {
		ex.Status = "rejected"
		st := "rejected"
		ex.ApprovalStatus = &st
		ex.RejectionReason = &reason
		ex.UpdatedAt = now
	}
	a.Status = "rejected"
	a.RespondedAt = &now
	a.CurrentApprover = nil
	m.recomputeAfterExpense(budgetID)
	return nil
}

// Analytics .
func (m *Memory) Analytics(budgetID string) Analytics {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var trends []TrendPoint
	var breakdown []NameValue
	months := []MonthCompare{
		{Month: "Янв", Planned: 1_200_000, Actual: 980_000},
		{Month: "Фев", Planned: 1_300_000, Actual: 1_210_000},
		{Month: "Мар", Planned: 1_400_000, Actual: 1_050_000},
	}
	for i := 0; i < 6; i++ {
		trends = append(trends, TrendPoint{
			Date:  time.Now().AddDate(0, -5+i, 0).Format("2006-01"),
			Value: 800_000 + float64(i)*45_000,
		})
	}
	for _, c := range m.categories {
		if c.BudgetID != budgetID {
			continue
		}
		if c.ParentID == nil {
			breakdown = append(breakdown, NameValue{Name: c.Name, Value: c.SpentAmount})
		}
	}
	top := make([]Expense, 0)
	for _, e := range m.expenses {
		if e.BudgetID == budgetID {
			top = append(top, *e)
		}
	}
	sort.Slice(top, func(i, j int) bool { return top[i].AmountRUB > top[j].AmountRUB })
	if len(top) > 10 {
		top = top[:10]
	}
	return Analytics{
		Trends:            trends,
		CategoryBreakdown: breakdown,
		MonthlyComparison: months,
		Forecast: Forecast{
			ProjectedTotal: 4_850_000,
			Confidence:     0.72,
			Message:        "Прогноз на основе текущих трендов",
		},
		TopExpenses: top,
	}
}

// Integration returns 1C panel state.
func (m *Memory) Integration(budgetID string) IntegrationState {
	m.mu.RLock()
	defer m.mu.RUnlock()
	s := m.integ[budgetID]
	if s == nil {
		return IntegrationState{Connected: false, Logs: []SyncLogEntry{}}
	}
	return *s
}

// Sync triggers fake sync.
func (m *Memory) Sync(budgetID string) IntegrationState {
	m.mu.Lock()
	defer m.mu.Unlock()
	s := m.integ[budgetID]
	if s == nil {
		s = &IntegrationState{}
		m.integ[budgetID] = s
	}
	now := time.Now().UTC().Format(time.RFC3339)
	s.Connected = true
	s.LastSyncAt = &now
	s.MappingCount = 12
	s.Logs = append([]SyncLogEntry{{ID: uuid.NewString(), Level: "info", Message: "Синхронизация выполнена", Timestamp: now}}, s.Logs...)
	if len(s.Logs) > 20 {
		s.Logs = s.Logs[:20]
	}
	return *s
}

func (m *Memory) DeleteBudget(id string) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.budgets[id] == nil {
		return false
	}
	delete(m.budgets, id)
	delete(m.integ, id)
	for eid, e := range m.expenses {
		if e.BudgetID == id {
			delete(m.expenses, eid)
		}
	}
	for cid, c := range m.categories {
		if c.BudgetID == id {
			delete(m.categories, cid)
		}
	}
	for aid, a := range m.approvals {
		if a.BudgetID == id {
			delete(m.approvals, aid)
		}
	}
	return true
}

// Summary aggregates all budgets for org.
func (m *Memory) Summary(orgID string) map[string]any {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var totalPlanned, totalSpent, totalRem float64
	var n, active, over int
	for _, b := range m.budgets {
		if b.OrganizationID != orgID {
			continue
		}
		n++
		if b.Status == "active" {
			active++
		}
		cp := *b
		m.recomputeBudgetUnlocked(b.ID, &cp)
		totalPlanned += cp.TotalPlanned
		totalSpent += cp.TotalSpent
		totalRem += cp.TotalRemaining
		if cp.IsOverBudget {
			over++
		}
	}
	avg := 0.0
	if n > 0 {
		avg = totalSpent / float64(n) / math.Max(1, totalPlanned/float64(n)) * 100
	}
	return map[string]any{
		"totalBudgets":     n,
		"totalPlanned":     totalPlanned,
		"totalSpent":       totalSpent,
		"totalRemaining":   totalRem,
		"averageProgress":  math.Round(avg*10) / 10,
		"overBudgetCount":  over,
		"activeCount":      active,
	}
}
