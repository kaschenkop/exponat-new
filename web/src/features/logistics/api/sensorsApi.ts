import type { Sensor, SensorReading } from '../types/sensor.types';
import { logisticsGet } from './logisticsClient';

export interface SensorsListResponse {
  items: Sensor[];
  total: number;
}

export const sensorsApi = {
  list() {
    return logisticsGet<SensorsListResponse>('/sensors');
  },
  readings(id: string, limit?: number) {
    const q = limit ? `?limit=${limit}` : '';
    return logisticsGet<{ readings: SensorReading[] }>(
      `/sensors/${id}/readings${q}`,
    );
  },
};
