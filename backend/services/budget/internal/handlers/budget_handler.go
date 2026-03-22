package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/exponat/budget/pkg/db"
)

type Handler struct {
	db   *db.Pool
	mux  *http.ServeMux
	srv  *http.Server
}

func New(pool *db.Pool) *Handler {
	h := &Handler{db: pool, mux: http.NewServeMux()}
	h.registerRoutes()
	return h
}

func (h *Handler) registerRoutes() {
	h.mux.HandleFunc("GET /health", h.healthCheck)
	h.mux.HandleFunc("GET /api/v1/budgets", h.listBudgets)
	h.mux.HandleFunc("GET /api/v1/budgets/{id}", h.getBudget)
	h.mux.HandleFunc("POST /api/v1/budgets", h.createBudget)
	h.mux.HandleFunc("PUT /api/v1/budgets/{id}", h.updateBudget)
	h.mux.HandleFunc("DELETE /api/v1/budgets/{id}", h.deleteBudget)
}

func (h *Handler) ListenAndServe(addr string) error {
	h.srv = &http.Server{Addr: addr, Handler: h.mux}
	return h.srv.ListenAndServe()
}

func (h *Handler) healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "ok",
		"service": "budget",
	})
}

func (h *Handler) listBudgets(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"budgets": []interface{}{}, "total": 0})
}

func (h *Handler) getBudget(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(map[string]string{"error": "not implemented"})
}

func (h *Handler) createBudget(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(map[string]string{"error": "not implemented"})
}

func (h *Handler) updateBudget(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(map[string]string{"error": "not implemented"})
}

func (h *Handler) deleteBudget(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(map[string]string{"error": "not implemented"})
}
