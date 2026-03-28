import type { ExhibitCondition } from './exhibit.types';

export interface InventoryAuditItem {
  id: string;
  auditId: string;
  exhibitId: string;
  exhibitName: string;
  inventoryNumber: string;
  expectedLocationId: string;
  expectedLocationName: string;
  actualLocationId: string | null;
  actualLocationName: string | null;
  status: 'found' | 'missing' | 'misplaced' | 'extra';
  condition: ExhibitCondition;
  scannedAt: string | null;
  scannedBy: string | null;
  notes: string;
}

export interface InventoryAudit {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  locationIds: string[];
  exhibitIds: string[] | null;
  plannedDate: string;
  startedAt: string | null;
  completedAt: string | null;
  totalExpected: number;
  totalScanned: number;
  totalFound: number;
  totalMissing: number;
  totalExtra: number;
  items: InventoryAuditItem[];
  createdBy: string;
  assignedTo: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  exhibitId: string;
  exhibitName: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  movedAt: string;
  movedBy: string;
  movedByName: string;
  reason: 'exhibition' | 'storage' | 'restoration' | 'shipment' | 'inventory' | 'other';
  reasonDetails: string;
  shipmentId: string | null;
  auditId: string | null;
  approved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface LogisticsReportSummary {
  exhibitCount: number;
  shipmentActive: number;
  shipmentDelivered: number;
  trackingOnline: number;
  sensorsWarning: number;
  openIncidents: number;
  inventoryAuditsOpen: number;
  movementsLast30d: number;
}
