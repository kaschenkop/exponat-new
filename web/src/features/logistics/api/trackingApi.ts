import type { RoutePoint, TrackingDevice } from '../types/tracking.types';
import { logisticsGet } from './logisticsClient';

export interface DevicesListResponse {
  items: TrackingDevice[];
  total: number;
}

export const trackingApi = {
  devices() {
    return logisticsGet<DevicesListResponse>('/tracking/devices');
  },
  deviceHistory(id: string) {
    return logisticsGet<{ points: RoutePoint[] }>(`/tracking/devices/${id}/history`);
  },
};
