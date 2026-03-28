package store

import (
	"strings"
	"sync"
	"time"

	"github.com/exponat/logistics/internal/models"
)

type Memory struct {
	mu         sync.RWMutex
	exhibits   map[string]models.Exhibit
	shipments  map[string]models.Shipment
	devices    []models.TrackingDevice
	sensors    []models.Sensor
	locations  []models.Location
	audits     []models.InventoryAudit
	movements  []models.Movement
	defaultOrg string
}

func NewMemory() *Memory {
	org := "11111111-1111-1111-1111-111111111111"
	m := &Memory{
		exhibits:   make(map[string]models.Exhibit),
		shipments:  make(map[string]models.Shipment),
		defaultOrg: org,
	}
	m.seed(org)
	return m
}

func (m *Memory) seed(org string) {
	locMain := models.Location{
		ID: "loc-1", Type: "warehouse", Name: "Склад А", Address: "Москва, ул. Складская, 1",
		Coordinates: models.Coordinates{Lat: 55.75, Lng: 37.62},
	}
	locHall := models.Location{
		ID: "loc-2", Type: "exhibition_hall", Name: "Зал 3", Address: "Москва, Музейный пр., 10",
		Building: strPtr("Корпус Б"), Floor: strPtr("2"),
		Coordinates: models.Coordinates{Lat: 55.76, Lng: 37.63},
	}
	m.locations = []models.Location{locMain, locHall}

	now := time.Now().UTC().Format(time.RFC3339)
	ex1 := models.Exhibit{
		ID: "ex-001", OrganizationID: org, ProjectID: nil,
		Name: "Икона XVII в.", InventoryNumber: "ИНВ-1001",
		Description: "Дерево, темпера", Category: "painting", Tags: []string{"религия", "старина"},
		Status: "in_storage", Condition: "good",
		Dimensions: models.ExhibitDimensions{Width: 45, Height: 62, Depth: 8, Weight: 12},
		EstimatedValue: 2_500_000, InsuranceValue: 3_000_000, IsInsured: true,
		Requirements: models.ExhibitRequirements{
			TemperatureMin: 18, TemperatureMax: 22, HumidityMin: 45, HumidityMax: 55,
			Fragile: true, RequiresClimateControl: true, RequiresSpecialHandling: false,
			HandlingNotes: "Не допускать вибраций",
		},
		CurrentLocation: locMain, LocationID: locMain.ID,
		LocationHistory: []models.LocationHistory{
			{ID: "lh-1", LocationID: locMain.ID, LocationName: locMain.Name, MovedAt: now, MovedBy: "user-1", Reason: "Приёмка", ShipmentID: nil},
		},
		CurrentShipmentID: nil,
		Images: []models.ExhibitImage{
			{ID: "img-1", URL: "/placeholder-exhibit.jpg", ThumbnailURL: "/placeholder-exhibit.jpg", Caption: "Вид спереди", IsPrimary: true, UploadedAt: now},
		},
		PrimaryImageURL: "/placeholder-exhibit.jpg",
		Documents:       []models.ExhibitDocument{},
		QRCode:          "QR-EX-001", Barcode: "BC-EX-001", RFIDTag: nil,
		Author: strPtr("Неизвестный мастер"), YearCreated: intPtr(1680), Origin: strPtr("Русский Север"),
		AcquisitionDate: "2010-05-12", AcquisitionSource: "Закупка",
		CreatedBy: "user-1", CreatedAt: now, UpdatedAt: now, LastInventoryDate: now,
	}
	ex2 := ex1
	ex2.ID = "ex-002"
	ex2.Name = "Скульптура «Весна»"
	ex2.InventoryNumber = "ИНВ-2044"
	ex2.Category = "sculpture"
	ex2.Status = "on_display"
	ex2.CurrentLocation = locHall
	ex2.LocationID = locHall.ID
	ex2.EstimatedValue = 890_000
	ex2.QRCode = "QR-EX-002"

	m.exhibits[ex1.ID] = ex1
	m.exhibits[ex2.ID] = ex2

	sh := models.Shipment{
		ID: "sh-001", OrganizationID: org, Number: "ПЕР-2026-01", Type: "outgoing", Status: "in_transit",
		Route: models.ShipmentRoute{
			Origin: locMain, Destination: locHall, Waypoints: nil,
			Distance: 12.5, EstimatedDuration: 45,
		},
		PlannedDepartureDate: now, ActualDepartureDate: &now,
		PlannedArrivalDate: time.Now().UTC().Add(2 * time.Hour).Format(time.RFC3339),
		TransportType: "van",
		Vehicle: models.ShipmentVehicle{
			Type: "Фургон", PlateNumber: "A123BC77", Model: "Mercedes Sprinter",
			DriverID: "drv-1", DriverName: "Иванов И.И.", DriverPhone: "+79001234567",
			HasClimateControl: true, MaxWeight: 1500,
		},
		Exhibits: []models.ShipmentExhibit{
			{ExhibitID: ex1.ID, ExhibitName: ex1.Name, InventoryNumber: ex1.InventoryNumber, Condition: ex1.Condition, PackagedIn: "Ящик 1", Notes: ""},
		},
		TotalExhibits: 1, TotalWeight: 45, TotalValue: ex1.EstimatedValue,
		Packaging: models.ShipmentPackaging{CratesCount: 1, BoxesCount: 0, PackingListURL: nil},
		Documents: []models.ShipmentDocument{},
		Cost:      models.ShipmentCost{Amount: 45000, Currency: "RUB", IncludedInBudget: false, BudgetCategoryID: nil},
		TrackingEnabled: true,
		CurrentLocation: &models.ShipmentCurrentLocation{
			Lat: 55.752, Lng: 37.615, Timestamp: now, Speed: 42,
		},
		MonitoringEnabled: true,
		SensorIDs:         []string{"sns-1", "sns-2"},
		Timeline: []models.ShipmentTimelineItem{
			{ID: "tl-1", Timestamp: now, Type: "created", Title: "Создана", Description: "Черновик перевозки", Location: nil, UserID: strPtr("user-1"), UserName: strPtr("Пользователь")},
			{ID: "tl-2", Timestamp: now, Type: "departed", Title: "Отправлена", Description: "Покинула склад", Location: map[string]interface{}{"lat": 55.75, "lng": 37.62, "address": locMain.Address}, UserID: nil, UserName: nil},
		},
		Incidents:    []models.ShipmentIncident{},
		HasIncidents: false,
		CreatedBy:    "user-1", CreatedAt: now, UpdatedAt: now, CompletedAt: nil,
	}
	m.shipments[sh.ID] = sh

	m.devices = []models.TrackingDevice{
		{
			ID: "td-1", DeviceID: "GPS-7788", ShipmentID: sh.ID, VehiclePlateNumber: sh.Vehicle.PlateNumber,
			CurrentPosition: models.TrackingPosition{
				Lat: 55.752, Lng: 37.615, Accuracy: 8, Altitude: nil, Heading: floatPtr(90), Speed: 42, Timestamp: now,
			},
			IsOnline: true, LastSeenAt: now, BatteryLevel: floatPtr(78),
			PlannedRoute: []models.RoutePoint{
				{Lat: 55.75, Lng: 37.62, Timestamp: now, Speed: 0, Address: strPtr(locMain.Address)},
				{Lat: 55.76, Lng: 37.63, Timestamp: time.Now().UTC().Add(time.Hour).Format(time.RFC3339), Speed: 30, Address: strPtr(locHall.Address)},
			},
			ActualRoute: []models.RoutePoint{
				{Lat: 55.751, Lng: 37.618, Timestamp: now, Speed: 40, Address: nil},
			},
			Alerts: []models.TrackingAlert{},
		},
	}

	m.sensors = []models.Sensor{
		{
			ID: "sns-1", SensorID: "TEMP-A1", Type: "temperature", Name: "Температура кузова",
			ShipmentID: &sh.ID, ExhibitID: nil, LocationID: nil,
			CurrentReading: models.SensorCurrentReading{Value: 20.5, Unit: "°C", Timestamp: now, Status: "normal"},
			Thresholds: models.SensorThresholds{MinNormal: 18, MaxNormal: 24, MinWarning: 16, MaxWarning: 26, MinCritical: 10, MaxCritical: 30},
			Readings: []models.SensorReading{
				{Timestamp: now, Value: 20.5, Status: "normal"},
			},
			IsOnline: true, LastSeenAt: now, BatteryLevel: floatPtr(92),
			Alerts:   []models.SensorAlert{},
		},
		{
			ID: "sns-2", SensorID: "HUM-A1", Type: "humidity", Name: "Влажность",
			ShipmentID: &sh.ID, ExhibitID: nil, LocationID: nil,
			CurrentReading: models.SensorCurrentReading{Value: 52, Unit: "%", Timestamp: now, Status: "normal"},
			Thresholds: models.SensorThresholds{MinNormal: 45, MaxNormal: 60, MinWarning: 40, MaxWarning: 70, MinCritical: 30, MaxCritical: 85},
			Readings: []models.SensorReading{{Timestamp: now, Value: 52, Status: "normal"}},
			IsOnline: true, LastSeenAt: now, BatteryLevel: nil,
			Alerts:   []models.SensorAlert{},
		},
	}

	m.audits = []models.InventoryAudit{
		{
			ID: "aud-1", OrganizationID: org, Name: "Годовая инвентаризация 2026", Description: "Зал + склад",
			Status: "in_progress", LocationIDs: []string{locMain.ID, locHall.ID}, ExhibitIDs: nil,
			PlannedDate: now, StartedAt: &now, CompletedAt: nil,
			TotalExpected: 2, TotalScanned: 1, TotalFound: 1, TotalMissing: 0, TotalExtra: 0,
			Items: []models.InventoryAuditItem{
				{
					ID: "ai-1", AuditID: "aud-1", ExhibitID: ex1.ID, ExhibitName: ex1.Name, InventoryNumber: ex1.InventoryNumber,
					ExpectedLocationID: locMain.ID, ExpectedLocationName: locMain.Name,
					ActualLocationID: &locMain.ID, ActualLocationName: &locMain.Name,
					Status: "found", Condition: ex1.Condition, ScannedAt: &now, ScannedBy: strPtr("user-1"), Notes: "",
				},
			},
			CreatedBy: "user-1", AssignedTo: []string{"user-1"}, CreatedAt: now, UpdatedAt: now,
		},
	}

	m.movements = []models.Movement{
		{
			ID: "mov-1", ExhibitID: ex2.ID, ExhibitName: ex2.Name,
			FromLocationID: locMain.ID, FromLocationName: locMain.Name,
			ToLocationID: locHall.ID, ToLocationName: locHall.Name,
			MovedAt: now, MovedBy: "user-1", MovedByName: "Пользователь",
			Reason: "exhibition", ReasonDetails: "Выставка весна", ShipmentID: nil, AuditID: nil,
			Approved: true, ApprovedBy: strPtr("mgr-1"), ApprovedAt: &now,
		},
	}
}

func strPtr(s string) *string  { return &s }
func intPtr(i int) *int         { return &i }
func floatPtr(f float64) *float64 { return &f }

func (m *Memory) orgMatch(org string, itemOrg string) bool {
	return itemOrg == org
}

func (m *Memory) ListExhibits(org, search, category, status string) []models.Exhibit {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.Exhibit, 0, len(m.exhibits))
	for _, e := range m.exhibits {
		if !m.orgMatch(org, e.OrganizationID) {
			continue
		}
		if category != "" && e.Category != category {
			continue
		}
		if status != "" && e.Status != status {
			continue
		}
		if search != "" {
			s := strings.ToLower(search)
			if !strings.Contains(strings.ToLower(e.Name), s) &&
				!strings.Contains(strings.ToLower(e.InventoryNumber), s) &&
				!strings.Contains(strings.ToLower(e.Description), s) {
				continue
			}
		}
		out = append(out, e)
	}
	return out
}

func (m *Memory) GetExhibit(org, id string) (models.Exhibit, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	e, ok := m.exhibits[id]
	if !ok || !m.orgMatch(org, e.OrganizationID) {
		return models.Exhibit{}, false
	}
	return e, true
}

func (m *Memory) PutExhibit(e models.Exhibit) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.exhibits[e.ID] = e
}

func (m *Memory) DeleteExhibit(org, id string) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	e, ok := m.exhibits[id]
	if !ok || !m.orgMatch(org, e.OrganizationID) {
		return false
	}
	delete(m.exhibits, id)
	return true
}

func (m *Memory) ListShipments(org string) []models.Shipment {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.Shipment, 0, len(m.shipments))
	for _, s := range m.shipments {
		if m.orgMatch(org, s.OrganizationID) {
			out = append(out, s)
		}
	}
	return out
}

func (m *Memory) GetShipment(org, id string) (models.Shipment, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	s, ok := m.shipments[id]
	if !ok || !m.orgMatch(org, s.OrganizationID) {
		return models.Shipment{}, false
	}
	return s, true
}

func (m *Memory) PutShipment(s models.Shipment) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.shipments[s.ID] = s
}

func (m *Memory) ListDevices(org string) []models.TrackingDevice {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.TrackingDevice, 0, len(m.devices))
	for _, d := range m.devices {
		sh, ok := m.shipments[d.ShipmentID]
		if ok && m.orgMatch(org, sh.OrganizationID) {
			out = append(out, d)
		}
	}
	return out
}

// DeviceHistory returns actual route points; ok is false if no device matches.
func (m *Memory) DeviceHistory(deviceID string) (pts []models.RoutePoint, ok bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, d := range m.devices {
		if d.ID == deviceID || d.DeviceID == deviceID {
			return append([]models.RoutePoint{}, d.ActualRoute...), true
		}
	}
	return nil, false
}

func (m *Memory) ListSensors(org string) []models.Sensor {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.Sensor, 0, len(m.sensors))
	for _, s := range m.sensors {
		if s.ShipmentID != nil {
			if sh, ok := m.shipments[*s.ShipmentID]; ok && m.orgMatch(org, sh.OrganizationID) {
				out = append(out, s)
			}
		} else {
			out = append(out, s)
		}
	}
	return out
}

func (m *Memory) SensorByID(id string) (models.Sensor, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, s := range m.sensors {
		if s.ID == id {
			return s, true
		}
	}
	return models.Sensor{}, false
}

func (m *Memory) ListLocations(org string) []models.Location {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return append([]models.Location{}, m.locations...)
}

// DefaultLocation returns the first seeded location (for new exhibits without placement).
func (m *Memory) DefaultLocation() (models.Location, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if len(m.locations) == 0 {
		return models.Location{}, false
	}
	return m.locations[0], true
}

func (m *Memory) ListAudits(org string) []models.InventoryAudit {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.InventoryAudit, 0)
	for _, a := range m.audits {
		if m.orgMatch(org, a.OrganizationID) {
			out = append(out, a)
		}
	}
	return out
}

func (m *Memory) ListMovements(org string) []models.Movement {
	m.mu.RLock()
	defer m.mu.RUnlock()
	// Movements are global demo data — filter by exhibit org
	out := make([]models.Movement, 0)
	for _, mv := range m.movements {
		if ex, ok := m.exhibits[mv.ExhibitID]; ok && m.orgMatch(org, ex.OrganizationID) {
			out = append(out, mv)
		}
	}
	return out
}

func (m *Memory) Summary(org string) models.ReportSummary {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var exN, shipAct, shipDel, trackOn, sensWarn, openInc, audOpen int
	for _, e := range m.exhibits {
		if m.orgMatch(org, e.OrganizationID) {
			exN++
		}
	}
	for _, s := range m.shipments {
		if !m.orgMatch(org, s.OrganizationID) {
			continue
		}
		switch s.Status {
		case "in_transit", "in_preparation", "planned":
			shipAct++
		case "delivered":
			shipDel++
		}
		for _, inc := range s.Incidents {
			if inc.ResolvedAt == nil {
				openInc++
			}
		}
	}
	for _, d := range m.devices {
		if sh, ok := m.shipments[d.ShipmentID]; ok && m.orgMatch(org, sh.OrganizationID) && d.IsOnline {
			trackOn++
		}
	}
	for _, s := range m.sensors {
		if s.CurrentReading.Status == "warning" || s.CurrentReading.Status == "critical" {
			sensWarn++
		}
	}
	for _, a := range m.audits {
		if m.orgMatch(org, a.OrganizationID) && (a.Status == "planned" || a.Status == "in_progress") {
			audOpen++
		}
	}
	return models.ReportSummary{
		ExhibitCount:        exN,
		ShipmentActive:      shipAct,
		ShipmentDelivered:   shipDel,
		TrackingOnline:      trackOn,
		SensorsWarning:      sensWarn,
		OpenIncidents:       openInc,
		InventoryAuditsOpen: audOpen,
		MovementsLast30d:    len(m.movements),
	}
}
