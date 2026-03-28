import type { Location } from '../types/exhibit.types';
import type { InventoryAudit, Movement } from '../types/inventory.types';
import { logisticsGet } from './logisticsClient';

export interface LocationsListResponse {
  items: Location[];
  total: number;
}

export interface AuditsListResponse {
  items: InventoryAudit[];
  total: number;
}

export interface MovementsListResponse {
  items: Movement[];
  total: number;
}

export const inventoryApi = {
  locations() {
    return logisticsGet<LocationsListResponse>('/locations');
  },
  audits() {
    return logisticsGet<AuditsListResponse>('/inventory/audits');
  },
  movements() {
    return logisticsGet<MovementsListResponse>('/movements');
  },
};
