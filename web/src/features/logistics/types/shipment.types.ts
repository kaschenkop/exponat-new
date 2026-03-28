import type { ExhibitCondition } from './exhibit.types';
import type { Location } from './exhibit.types';

export type ShipmentStatus =
  | 'planned'
  | 'in_preparation'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type ShipmentType = 'incoming' | 'outgoing' | 'internal';

export type TransportType = 'truck' | 'van' | 'car' | 'air' | 'rail' | 'sea';

export interface ShipmentExhibit {
  exhibitId: string;
  exhibitName: string;
  inventoryNumber: string;
  condition: ExhibitCondition;
  packagedIn: string;
  notes: string;
}

export interface ShipmentDocument {
  id: string;
  type:
    | 'waybill'
    | 'packing_list'
    | 'insurance'
    | 'customs'
    | 'acceptance_act'
    | 'other';
  title: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ShipmentTimelineItem {
  id: string;
  timestamp: string;
  type:
    | 'created'
    | 'departed'
    | 'checkpoint'
    | 'incident'
    | 'arrived'
    | 'completed';
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  userId: string | null;
  userName: string | null;
}

export interface ShipmentIncident {
  id: string;
  timestamp: string;
  type: 'delay' | 'damage' | 'deviation' | 'temperature' | 'humidity' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: { lat: number; lng: number };
  affectedExhibits: string[];
  resolvedAt: string | null;
  resolution: string | null;
}

export interface Shipment {
  id: string;
  organizationId: string;
  projectId: string | null;
  number: string;
  type: ShipmentType;
  status: ShipmentStatus;
  route: {
    origin: Location;
    destination: Location;
    waypoints: Location[];
    distance: number;
    estimatedDuration: number;
  };
  plannedDepartureDate: string;
  actualDepartureDate: string | null;
  plannedArrivalDate: string;
  actualArrivalDate: string | null;
  transportType: TransportType;
  vehicle: {
    type: string;
    plateNumber: string;
    model: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    hasClimateControl: boolean;
    maxWeight: number;
  };
  exhibits: ShipmentExhibit[];
  totalExhibits: number;
  totalWeight: number;
  totalValue: number;
  packaging: {
    cratesCount: number;
    boxesCount: number;
    packingListUrl: string | null;
  };
  documents: ShipmentDocument[];
  cost: {
    amount: number;
    currency: 'RUB';
    includedInBudget: boolean;
    budgetCategoryId: string | null;
  };
  trackingEnabled: boolean;
  currentLocation: {
    lat: number;
    lng: number;
    timestamp: string;
    speed: number;
  } | null;
  monitoringEnabled: boolean;
  sensorIds: string[];
  timeline: ShipmentTimelineItem[];
  incidents: ShipmentIncident[];
  hasIncidents: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
