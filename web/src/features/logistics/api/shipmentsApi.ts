import type { Shipment } from '../types/shipment.types';
import { logisticsGet, logisticsPatch, logisticsPost } from './logisticsClient';

export interface ShipmentsListResponse {
  items: Shipment[];
  total: number;
}

export const shipmentsApi = {
  list() {
    return logisticsGet<ShipmentsListResponse>('/shipments');
  },
  get(id: string) {
    return logisticsGet<Shipment>(`/shipments/${id}`);
  },
  create(body: Partial<Shipment>) {
    return logisticsPost<Shipment>('/shipments', body);
  },
  update(id: string, body: Partial<Shipment>) {
    return logisticsPatch<Shipment>(`/shipments/${id}`, body);
  },
};
