export type ExhibitStatus =
  | 'in_storage'
  | 'on_display'
  | 'in_transit'
  | 'in_restoration'
  | 'decommissioned';

export type ExhibitCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export type ExhibitCategory =
  | 'painting'
  | 'sculpture'
  | 'artifact'
  | 'document'
  | 'photo'
  | 'video'
  | 'interactive'
  | 'other';

export interface ExhibitImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface ExhibitDocument {
  id: string;
  type: 'passport' | 'certificate' | 'insurance' | 'customs' | 'other';
  title: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Location {
  id: string;
  type: 'warehouse' | 'exhibition_hall' | 'storage' | 'restoration' | 'transit';
  name: string;
  address: string;
  building: string | null;
  floor: string | null;
  room: string | null;
  shelf: string | null;
  coordinates: { lat: number; lng: number };
}

export interface LocationHistory {
  id: string;
  locationId: string;
  locationName: string;
  movedAt: string;
  movedBy: string;
  reason: string;
  shipmentId: string | null;
}

export interface Exhibit {
  id: string;
  organizationId: string;
  projectId: string | null;
  name: string;
  inventoryNumber: string;
  description: string;
  category: ExhibitCategory;
  tags: string[];
  status: ExhibitStatus;
  condition: ExhibitCondition;
  dimensions: { width: number; height: number; depth: number; weight: number };
  estimatedValue: number;
  insuranceValue: number;
  isInsured: boolean;
  requirements: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
    fragile: boolean;
    requiresClimateControl: boolean;
    requiresSpecialHandling: boolean;
    handlingNotes: string;
  };
  currentLocation: Location;
  locationId: string;
  locationHistory: LocationHistory[];
  currentShipmentId: string | null;
  images: ExhibitImage[];
  primaryImageUrl: string;
  documents: ExhibitDocument[];
  qrCode: string;
  barcode: string;
  rfidTag: string | null;
  author: string | null;
  yearCreated: number | null;
  origin: string | null;
  acquisitionDate: string;
  acquisitionSource: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastInventoryDate: string;
}

export interface ExhibitFilters {
  search: string;
  categories: ExhibitCategory[];
  statuses: ExhibitStatus[];
  locations: string[];
  conditions: ExhibitCondition[];
}
