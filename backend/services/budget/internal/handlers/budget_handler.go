package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/exponat/budget/internal/store"
	"github.com/exponat/budget/pkg/db"
)

type Handler struct {
	db    *db.Pool
	mem   *store.Memory
	mux   *http.ServeMux
	srv   *http.Server
}

func New(pool *db.Pool) *Handler {
	h := &Handler{
		db:  pool,
		mem: store.NewMemory(),
		mux: http.NewServeMux(),
	}
	h.registerRoutes()
	return h
}

func (h *Handler) registerRoutes() {
	h.mux.HandleFunc("GET /health", h.healthCheck)

	h.mux.HandleFunc("GET /api/v1/budgets/summary", h.summary)
	h.mux.HandleFunc("GET /api/v1/budgets", h.listBudgets)
	h.mux.HandleFunc("POST /api/v1/budgets", h.createBudget)

	h.mux.HandleFunc("GET /api/v1/budgets/{budgetId}/categories", h.listCategories)
	h.mux.HandleFunc("POST /api/v1/budgets/{budgetId}/categories", h.createCategory)
	h.mux.HandleFunc("DELETE /api/v1/budgets/{budgetId}/categories/{categoryId}", h.deleteCategory)

	h.mux.HandleFunc("GET /api/v1/budgets/{budgetId}/expenses", h.listExpenses)
	h.mux.HandleFunc("POST /api/v1/budgets/{budgetId}/expenses", h.createExpense)

	h.mux.HandleFunc("GET /api/v1/budgets/{budgetId}/approvals", h.listApprovals)
	h.mux.HandleFunc("POST /api/v1/budgets/{budgetId}/approvals/{approvalId}/approve", h.approve)
	h.mux.HandleFunc("POST /api/v1/budgets/{budgetId}/approvals/{approvalId}/reject", h.reject)

	h.mux.HandleFunc("GET /api/v1/budgets/{budgetId}/analytics", h.analytics)
	h.mux.HandleFunc("GET /api/v1/budgets/{budgetId}/integration", h.integration)
	h.mux.HandleFunc("POST /api/v1/budgets/{budgetId}/integration/sync", h.integrationSync)

	h.mux.HandleFunc("GET /api/v1/budgets/{id}", h.getBudget)
	h.mux.HandleFunc("DELETE /api/v1/budgets/{id}", h.deleteBudget)
}

func (h *Handler) ListenAndServe(addr string) error {
	h.srv = &http.Server{Addr: addr, Handler: h.mux}
	return h.srv.ListenAndServe()
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("failed to encode response: %v", err)
	}
}

func readBody(r *http.Request) ([]byte, error) {
	return io.ReadAll(r.Body)
}

func orgID(r *http.Request) string {
	o := r.Header.Get("X-Organization-Id")
	if o == "" {
		o = os.Getenv("DEFAULT_ORGANIZATION_ID")
	}
	if o == "" {
		o = "11111111-1111-1111-1111-111111111111"
	}
	return o
}

func userID(r *http.Request) string {
	u := r.Header.Get("X-User-Id")
	if u == "" {
		u = "22222222-2222-2222-2222-222222222222"
	}
	return u
}

func userName(r *http.Request) string {
	n := r.Header.Get("X-User-Name")
	if n == "" {
		return "Пользователь"
	}
	return n
}

func (h *Handler) healthCheck(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "budget"})
}

func (h *Handler) summary(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.mem.Summary(orgID(r)))
}

func (h *Handler) listBudgets(w http.ResponseWriter, r *http.Request) {
	list := h.mem.ListBudgets(orgID(r))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}

func (h *Handler) createBudget(w http.ResponseWriter, r *http.Request) {
	raw, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	b, err := h.mem.CreateBudget(orgID(r), raw)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, b)
}

func (h *Handler) getBudget(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	b, ok := h.mem.GetBudget(id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, b)
}

func (h *Handler) deleteBudget(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	b, ok := h.mem.GetBudget(id)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if !h.mem.DeleteBudget(id) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) listCategories(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": h.mem.ListCategoriesFlat(budgetID)})
}

func (h *Handler) createCategory(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	raw, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	c, err := h.mem.CreateCategory(budgetID, raw)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (h *Handler) deleteCategory(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	categoryID := r.PathValue("categoryId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if err := h.mem.DeleteCategory(budgetID, categoryID); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) listExpenses(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))
	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}
	search := q.Get("search")
	items, total := h.mem.ListExpenses(budgetID, page, limit, search)
	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *Handler) createExpense(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	raw, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	e, err := h.mem.CreateExpense(budgetID, orgID(r), userID(r), raw)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, e)
}

func (h *Handler) listApprovals(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	status := r.URL.Query().Get("status")
	writeJSON(w, http.StatusOK, map[string]any{"items": h.mem.ListApprovals(budgetID, status)})
}

func (h *Handler) approve(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	approvalID := r.PathValue("approvalId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	var body struct {
		Comment string `json:"comment"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if err := h.mem.Approve(budgetID, approvalID, userID(r), userName(r), body.Comment); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handler) reject(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	approvalID := r.PathValue("approvalId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	var body struct {
		Reason string `json:"reason"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if err := h.mem.Reject(budgetID, approvalID, userID(r), userName(r), body.Reason); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handler) analytics(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, h.mem.Analytics(budgetID))
}

func (h *Handler) integration(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, h.mem.Integration(budgetID))
}

func (h *Handler) integrationSync(w http.ResponseWriter, r *http.Request) {
	budgetID := r.PathValue("budgetId")
	b, ok := h.mem.GetBudget(budgetID)
	if !ok || b.OrganizationID != orgID(r) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, h.mem.Sync(budgetID))
}
