package models

// JSON field names match the TypeScript types in docs/LOGISTICS_MODULE_PROMPT.md.

type Coordinates struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Location struct {
	ID          string       `json:"id"`
	Type        string       `json:"type"`
	Name        string       `json:"name"`
	Address     string       `json:"address"`
	Building    *string      `json:"building"`
	Floor       *string      `json:"floor"`
	Room        *string      `json:"room"`
	Shelf       *string      `json:"shelf"`
	Coordinates Coordinates  `json:"coordinates"`
}

type LocationHistory struct {
	ID            string  `json:"id"`
	LocationID    string  `json:"locationId"`
	LocationName  string  `json:"locationName"`
	MovedAt       string  `json:"movedAt"`
	MovedBy       string  `json:"movedBy"`
	Reason        string  `json:"reason"`
	ShipmentID    *string `json:"shipmentId"`
}

type ExhibitImage struct {
	ID           string `json:"id"`
	URL          string `json:"url"`
	ThumbnailURL string `json:"thumbnailUrl"`
	Caption      string `json:"caption"`
	IsPrimary    bool   `json:"isPrimary"`
	UploadedAt   string `json:"uploadedAt"`
}

type ExhibitDocument struct {
	ID         string `json:"id"`
	Type       string `json:"type"`
	Title      string `json:"title"`
	FileURL    string `json:"fileUrl"`
	UploadedAt string `json:"uploadedAt"`
}

type ExhibitDimensions struct {
	Width  float64 `json:"width"`
	Height float64 `json:"height"`
	Depth  float64 `json:"depth"`
	Weight float64 `json:"weight"`
}

type ExhibitRequirements struct {
	TemperatureMin            float64 `json:"temperatureMin"`
	TemperatureMax            float64 `json:"temperatureMax"`
	HumidityMin               float64 `json:"humidityMin"`
	HumidityMax               float64 `json:"humidityMax"`
	Fragile                   bool    `json:"fragile"`
	RequiresClimateControl    bool    `json:"requiresClimateControl"`
	RequiresSpecialHandling   bool    `json:"requiresSpecialHandling"`
	HandlingNotes             string  `json:"handlingNotes"`
}

type Exhibit struct {
	ID                 string              `json:"id"`
	OrganizationID     string              `json:"organizationId"`
	ProjectID          *string             `json:"projectId"`
	Name               string              `json:"name"`
	InventoryNumber    string              `json:"inventoryNumber"`
	Description        string              `json:"description"`
	Category           string              `json:"category"`
	Tags               []string            `json:"tags"`
	Status             string              `json:"status"`
	Condition          string              `json:"condition"`
	Dimensions         ExhibitDimensions   `json:"dimensions"`
	EstimatedValue     float64             `json:"estimatedValue"`
	InsuranceValue     float64             `json:"insuranceValue"`
	IsInsured          bool                `json:"isInsured"`
	Requirements       ExhibitRequirements `json:"requirements"`
	CurrentLocation    Location            `json:"currentLocation"`
	LocationID         string              `json:"locationId"`
	LocationHistory    []LocationHistory   `json:"locationHistory"`
	CurrentShipmentID  *string             `json:"currentShipmentId"`
	Images             []ExhibitImage      `json:"images"`
	PrimaryImageURL    string              `json:"primaryImageUrl"`
	Documents          []ExhibitDocument   `json:"documents"`
	QRCode             string              `json:"qrCode"`
	Barcode            string              `json:"barcode"`
	RFIDTag            *string             `json:"rfidTag"`
	Author             *string             `json:"author"`
	YearCreated        *int                `json:"yearCreated"`
	Origin             *string             `json:"origin"`
	AcquisitionDate    string              `json:"acquisitionDate"`
	AcquisitionSource  string              `json:"acquisitionSource"`
	CreatedBy          string              `json:"createdBy"`
	CreatedAt          string              `json:"createdAt"`
	UpdatedAt          string              `json:"updatedAt"`
	LastInventoryDate  string              `json:"lastInventoryDate"`
}

type ShipmentExhibit struct {
	ExhibitID        string `json:"exhibitId"`
	ExhibitName      string `json:"exhibitName"`
	InventoryNumber  string `json:"inventoryNumber"`
	Condition        string `json:"condition"`
	PackagedIn       string `json:"packagedIn"`
	Notes            string `json:"notes"`
}

type ShipmentDocument struct {
	ID         string `json:"id"`
	Type       string `json:"type"`
	Title      string `json:"title"`
	FileURL    string `json:"fileUrl"`
	UploadedAt string `json:"uploadedAt"`
}

type ShipmentTimelineItem struct {
	ID          string                 `json:"id"`
	Timestamp   string                 `json:"timestamp"`
	Type        string                 `json:"type"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Location    map[string]interface{} `json:"location"`
	UserID      *string                `json:"userId"`
	UserName    *string                `json:"userName"`
}

type ShipmentIncident struct {
	ID               string     `json:"id"`
	Timestamp        string     `json:"timestamp"`
	Type             string     `json:"type"`
	Severity         string     `json:"severity"`
	Title            string     `json:"title"`
	Description      string     `json:"description"`
	Location         Coordinates `json:"location"`
	AffectedExhibits []string   `json:"affectedExhibits"`
	ResolvedAt       *string    `json:"resolvedAt"`
	Resolution       *string    `json:"resolution"`
}

type ShipmentRoute struct {
	Origin            Location   `json:"origin"`
	Destination       Location   `json:"destination"`
	Waypoints         []Location `json:"waypoints"`
	Distance          float64    `json:"distance"`
	EstimatedDuration int        `json:"estimatedDuration"`
}

type ShipmentVehicle struct {
	Type              string `json:"type"`
	PlateNumber       string `json:"plateNumber"`
	Model             string `json:"model"`
	DriverID          string `json:"driverId"`
	DriverName        string `json:"driverName"`
	DriverPhone       string `json:"driverPhone"`
	HasClimateControl bool   `json:"hasClimateControl"`
	MaxWeight         float64 `json:"maxWeight"`
}

type ShipmentPackaging struct {
	CratesCount    int     `json:"cratesCount"`
	BoxesCount     int     `json:"boxesCount"`
	PackingListURL *string `json:"packingListUrl"`
}

type ShipmentCost struct {
	Amount             float64 `json:"amount"`
	Currency           string  `json:"currency"`
	IncludedInBudget   bool    `json:"includedInBudget"`
	BudgetCategoryID   *string `json:"budgetCategoryId"`
}

type ShipmentCurrentLocation struct {
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Timestamp string  `json:"timestamp"`
	Speed     float64 `json:"speed"`
}

type Shipment struct {
	ID                   string                   `json:"id"`
	OrganizationID       string                   `json:"organizationId"`
	ProjectID            *string                  `json:"projectId"`
	Number               string                   `json:"number"`
	Type                 string                   `json:"type"`
	Status               string                   `json:"status"`
	Route                ShipmentRoute            `json:"route"`
	PlannedDepartureDate string                   `json:"plannedDepartureDate"`
	ActualDepartureDate  *string                  `json:"actualDepartureDate"`
	PlannedArrivalDate   string                   `json:"plannedArrivalDate"`
	ActualArrivalDate    *string                  `json:"actualArrivalDate"`
	TransportType        string                   `json:"transportType"`
	Vehicle              ShipmentVehicle          `json:"vehicle"`
	Exhibits             []ShipmentExhibit        `json:"exhibits"`
	TotalExhibits        int                      `json:"totalExhibits"`
	TotalWeight          float64                  `json:"totalWeight"`
	TotalValue           float64                  `json:"totalValue"`
	Packaging            ShipmentPackaging        `json:"packaging"`
	Documents            []ShipmentDocument       `json:"documents"`
	Cost                 ShipmentCost             `json:"cost"`
	TrackingEnabled      bool                     `json:"trackingEnabled"`
	CurrentLocation      *ShipmentCurrentLocation `json:"currentLocation"`
	MonitoringEnabled    bool                     `json:"monitoringEnabled"`
	SensorIDs            []string                 `json:"sensorIds"`
	Timeline             []ShipmentTimelineItem   `json:"timeline"`
	Incidents            []ShipmentIncident       `json:"incidents"`
	HasIncidents         bool                     `json:"hasIncidents"`
	CreatedBy            string                   `json:"createdBy"`
	CreatedAt            string                   `json:"createdAt"`
	UpdatedAt            string                   `json:"updatedAt"`
	CompletedAt          *string                  `json:"completedAt"`
}

type RoutePoint struct {
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Timestamp string  `json:"timestamp"`
	Speed     float64 `json:"speed"`
	Address   *string `json:"address"`
}

type TrackingAlert struct {
	ID              string  `json:"id"`
	Type            string  `json:"type"`
	Severity        string  `json:"severity"`
	Message         string  `json:"message"`
	Timestamp       string  `json:"timestamp"`
	Acknowledged    bool    `json:"acknowledged"`
	AcknowledgedBy  *string `json:"acknowledgedBy"`
}

type TrackingPosition struct {
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Accuracy  float64 `json:"accuracy"`
	Altitude  *float64 `json:"altitude"`
	Heading   *float64 `json:"heading"`
	Speed     float64 `json:"speed"`
	Timestamp string  `json:"timestamp"`
}

type TrackingDevice struct {
	ID                 string           `json:"id"`
	DeviceID           string           `json:"deviceId"`
	ShipmentID         string           `json:"shipmentId"`
	VehiclePlateNumber string           `json:"vehiclePlateNumber"`
	CurrentPosition    TrackingPosition `json:"currentPosition"`
	IsOnline           bool             `json:"isOnline"`
	LastSeenAt         string           `json:"lastSeenAt"`
	BatteryLevel       *float64         `json:"batteryLevel"`
	PlannedRoute       []RoutePoint     `json:"plannedRoute"`
	ActualRoute        []RoutePoint     `json:"actualRoute"`
	Alerts             []TrackingAlert  `json:"alerts"`
}

type SensorReading struct {
	Timestamp string  `json:"timestamp"`
	Value     float64 `json:"value"`
	Status    string  `json:"status"`
}

type SensorAlert struct {
	ID              string  `json:"id"`
	SensorID        string  `json:"sensorId"`
	Type            string  `json:"type"`
	Severity        string  `json:"severity"`
	Message         string  `json:"message"`
	Value           *float64 `json:"value"`
	Threshold       *float64 `json:"threshold"`
	Timestamp       string  `json:"timestamp"`
	Acknowledged    bool    `json:"acknowledged"`
	AcknowledgedBy  *string `json:"acknowledgedBy"`
	AcknowledgedAt  *string `json:"acknowledgedAt"`
}

type SensorCurrentReading struct {
	Value     float64 `json:"value"`
	Unit      string  `json:"unit"`
	Timestamp string  `json:"timestamp"`
	Status    string  `json:"status"`
}

type SensorThresholds struct {
	MinNormal    float64 `json:"minNormal"`
	MaxNormal    float64 `json:"maxNormal"`
	MinWarning   float64 `json:"minWarning"`
	MaxWarning   float64 `json:"maxWarning"`
	MinCritical  float64 `json:"minCritical"`
	MaxCritical  float64 `json:"maxCritical"`
}

type Sensor struct {
	ID              string               `json:"id"`
	SensorID        string               `json:"sensorId"`
	Type            string               `json:"type"`
	Name            string               `json:"name"`
	ShipmentID      *string              `json:"shipmentId"`
	ExhibitID       *string              `json:"exhibitId"`
	LocationID      *string              `json:"locationId"`
	CurrentReading  SensorCurrentReading `json:"currentReading"`
	Thresholds      SensorThresholds     `json:"thresholds"`
	Readings        []SensorReading      `json:"readings"`
	IsOnline        bool                 `json:"isOnline"`
	LastSeenAt      string               `json:"lastSeenAt"`
	BatteryLevel    *float64             `json:"batteryLevel"`
	Alerts          []SensorAlert        `json:"alerts"`
}

type InventoryAuditItem struct {
	ID                   string  `json:"id"`
	AuditID              string  `json:"auditId"`
	ExhibitID            string  `json:"exhibitId"`
	ExhibitName          string  `json:"exhibitName"`
	InventoryNumber      string  `json:"inventoryNumber"`
	ExpectedLocationID   string  `json:"expectedLocationId"`
	ExpectedLocationName string  `json:"expectedLocationName"`
	ActualLocationID     *string `json:"actualLocationId"`
	ActualLocationName   *string `json:"actualLocationName"`
	Status               string  `json:"status"`
	Condition            string  `json:"condition"`
	ScannedAt            *string `json:"scannedAt"`
	ScannedBy            *string `json:"scannedBy"`
	Notes                string  `json:"notes"`
}

type InventoryAudit struct {
	ID             string               `json:"id"`
	OrganizationID string               `json:"organizationId"`
	Name           string               `json:"name"`
	Description    string               `json:"description"`
	Status         string               `json:"status"`
	LocationIDs    []string             `json:"locationIds"`
	ExhibitIDs     []string             `json:"exhibitIds"`
	PlannedDate    string               `json:"plannedDate"`
	StartedAt      *string              `json:"startedAt"`
	CompletedAt    *string              `json:"completedAt"`
	TotalExpected  int                  `json:"totalExpected"`
	TotalScanned   int                  `json:"totalScanned"`
	TotalFound     int                  `json:"totalFound"`
	TotalMissing   int                  `json:"totalMissing"`
	TotalExtra     int                  `json:"totalExtra"`
	Items          []InventoryAuditItem `json:"items"`
	CreatedBy      string               `json:"createdBy"`
	AssignedTo     []string             `json:"assignedTo"`
	CreatedAt      string               `json:"createdAt"`
	UpdatedAt      string               `json:"updatedAt"`
}

type Movement struct {
	ID              string  `json:"id"`
	ExhibitID       string  `json:"exhibitId"`
	ExhibitName     string  `json:"exhibitName"`
	FromLocationID  string  `json:"fromLocationId"`
	FromLocationName string `json:"fromLocationName"`
	ToLocationID    string  `json:"toLocationId"`
	ToLocationName  string  `json:"toLocationName"`
	MovedAt         string  `json:"movedAt"`
	MovedBy         string  `json:"movedBy"`
	MovedByName     string  `json:"movedByName"`
	Reason          string  `json:"reason"`
	ReasonDetails   string  `json:"reasonDetails"`
	ShipmentID      *string `json:"shipmentId"`
	AuditID         *string `json:"auditId"`
	Approved        bool    `json:"approved"`
	ApprovedBy      *string `json:"approvedBy"`
	ApprovedAt      *string `json:"approvedAt"`
}

type ReportSummary struct {
	ExhibitCount        int     `json:"exhibitCount"`
	ShipmentActive      int     `json:"shipmentActive"`
	ShipmentDelivered   int     `json:"shipmentDelivered"`
	TrackingOnline      int     `json:"trackingOnline"`
	SensorsWarning      int     `json:"sensorsWarning"`
	OpenIncidents       int     `json:"openIncidents"`
	InventoryAuditsOpen int     `json:"inventoryAuditsOpen"`
	MovementsLast30d    int     `json:"movementsLast30d"`
}
