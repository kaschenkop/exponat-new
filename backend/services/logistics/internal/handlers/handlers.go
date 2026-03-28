package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"

	"github.com/exponat/logistics/internal/models"
	"github.com/exponat/logistics/internal/store"
)

type Handler struct {
	mem *store.Memory
	mux *http.ServeMux
	srv *http.Server
}

func New() *Handler {
	h := &Handler{
		mem: store.NewMemory(),
		mux: http.NewServeMux(),
	}
	h.registerRoutes()
	return h
}

func (h *Handler) registerRoutes() {
	h.mux.HandleFunc("GET /health", h.healthCheck)

	p := "/api/v1/logistics"
	h.mux.HandleFunc("GET "+p+"/summary", h.summary)

	h.mux.HandleFunc("GET "+p+"/exhibits", h.listExhibits)
	h.mux.HandleFunc("POST "+p+"/exhibits", h.createExhibit)
	h.mux.HandleFunc("GET "+p+"/exhibits/{id}", h.getExhibit)
	h.mux.HandleFunc("PATCH "+p+"/exhibits/{id}", h.patchExhibit)
	h.mux.HandleFunc("DELETE "+p+"/exhibits/{id}", h.deleteExhibit)

	h.mux.HandleFunc("GET "+p+"/shipments", h.listShipments)
	h.mux.HandleFunc("POST "+p+"/shipments", h.createShipment)
	h.mux.HandleFunc("GET "+p+"/shipments/{id}", h.getShipment)
	h.mux.HandleFunc("PATCH "+p+"/shipments/{id}", h.patchShipment)

	h.mux.HandleFunc("GET "+p+"/tracking/devices", h.listDevices)
	h.mux.HandleFunc("GET "+p+"/tracking/devices/{id}/history", h.deviceHistory)

	h.mux.HandleFunc("GET "+p+"/sensors", h.listSensors)
	h.mux.HandleFunc("GET "+p+"/sensors/{id}/readings", h.sensorReadings)

	h.mux.HandleFunc("GET "+p+"/locations", h.listLocations)
	h.mux.HandleFunc("GET "+p+"/inventory/audits", h.listAudits)
	h.mux.HandleFunc("GET "+p+"/movements", h.listMovements)
	h.mux.HandleFunc("GET "+p+"/reports/summary", h.summary)
}

func (h *Handler) ListenAndServe(addr string) error {
	h.srv = &http.Server{Addr: addr, Handler: h.mux}
	return h.srv.ListenAndServe()
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode: %v", err)
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

func (h *Handler) healthCheck(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "logistics"})
}

func (h *Handler) summary(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.mem.Summary(orgID(r)))
}

func (h *Handler) listExhibits(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	list := h.mem.ListExhibits(orgID(r), q.Get("search"), q.Get("category"), q.Get("status"))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}

func (h *Handler) getExhibit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	e, ok := h.mem.GetExhibit(orgID(r), id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, e)
}

func (h *Handler) createExhibit(w http.ResponseWriter, r *http.Request) {
	raw, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	var e models.Exhibit
	if err := json.Unmarshal(raw, &e); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	e.ID = uuid.NewString()
	e.OrganizationID = orgID(r)
	if e.CreatedBy == "" {
		e.CreatedBy = userID(r)
	}
	if e.CreatedAt == "" {
		e.CreatedAt = now
	}
	e.UpdatedAt = now
	if e.LastInventoryDate == "" {
		e.LastInventoryDate = now
	}
	if e.InventoryNumber == "" {
		e.InventoryNumber = "ИНВ-" + e.ID[:8]
	}
	if e.PrimaryImageURL == "" && len(e.Images) > 0 {
		e.PrimaryImageURL = e.Images[0].URL
	}
	if e.QRCode == "" {
		e.QRCode = "QR-" + e.ID
	}
	if e.LocationID == "" || e.CurrentLocation.ID == "" {
		if loc, ok := h.mem.DefaultLocation(); ok {
			e.CurrentLocation = loc
			e.LocationID = loc.ID
		}
	}
	h.mem.PutExhibit(e)
	writeJSON(w, http.StatusCreated, e)
}

func (h *Handler) patchExhibit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	prev, ok := h.mem.GetExhibit(orgID(r), id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	raw, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	merged, err := shallowMergeExhibit(prev, raw)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	merged.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	h.mem.PutExhibit(merged)
	writeJSON(w, http.StatusOK, merged)
}

func (h *Handler) deleteExhibit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !h.mem.DeleteExhibit(orgID(r), id) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) listShipments(w http.ResponseWriter, r *http.Request) {
	list := h.mem.ListShipments(orgID(r))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}

func (h *Handler) getShipment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	s, ok := h.mem.GetShipment(orgID(r), id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, s)
}

func (h *Handler) createShipment(w http.ResponseWriter, r *http.Request) {
	raw, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	var s models.Shipment
	if err := json.Unmarshal(raw, &s); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	s.ID = uuid.NewString()
	s.OrganizationID = orgID(r)
	if s.Number == "" {
		s.Number = "ПЕР-" + s.ID[:8]
	}
	if s.CreatedBy == "" {
		s.CreatedBy = userID(r)
	}
	s.CreatedAt, s.UpdatedAt = now, now
	s.TotalExhibits = len(s.Exhibits)
	h.mem.PutShipment(s)
	writeJSON(w, http.StatusCreated, s)
}

func (h *Handler) patchShipment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	prev, ok := h.mem.GetShipment(orgID(r), id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	raw, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	merged, err := shallowMergeShipment(prev, raw)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	merged.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	merged.TotalExhibits = len(merged.Exhibits)
	h.mem.PutShipment(merged)
	writeJSON(w, http.StatusOK, merged)
}

func (h *Handler) listDevices(w http.ResponseWriter, r *http.Request) {
	list := h.mem.ListDevices(orgID(r))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}

func (h *Handler) deviceHistory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	pts, found := h.mem.DeviceHistory(id)
	if !found {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"points": pts})
}

func (h *Handler) listSensors(w http.ResponseWriter, r *http.Request) {
	list := h.mem.ListSensors(orgID(r))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}

func (h *Handler) sensorReadings(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	limit := 50
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}
	s, ok := h.mem.SensorByID(id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	rs := s.Readings
	if len(rs) > limit {
		rs = rs[len(rs)-limit:]
	}
	writeJSON(w, http.StatusOK, map[string]any{"readings": rs})
}

func (h *Handler) listLocations(w http.ResponseWriter, r *http.Request) {
	list := h.mem.ListLocations(orgID(r))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}

func (h *Handler) listAudits(w http.ResponseWriter, r *http.Request) {
	list := h.mem.ListAudits(orgID(r))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}

func (h *Handler) listMovements(w http.ResponseWriter, r *http.Request) {
	list := h.mem.ListMovements(orgID(r))
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "total": len(list)})
}
