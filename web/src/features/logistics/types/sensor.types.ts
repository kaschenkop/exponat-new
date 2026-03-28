export type SensorType =
  | 'temperature'
  | 'humidity'
  | 'vibration'
  | 'shock'
  | 'tilt'
  | 'light';

export interface SensorReading {
  timestamp: string;
  value: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  type: 'threshold_exceeded' | 'sensor_offline' | 'battery_low';
  severity: 'warning' | 'critical';
  message: string;
  value: number | null;
  threshold: number | null;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
}

export interface Sensor {
  id: string;
  sensorId: string;
  type: SensorType;
  name: string;
  shipmentId: string | null;
  exhibitId: string | null;
  locationId: string | null;
  currentReading: {
    value: number;
    unit: string;
    timestamp: string;
    status: 'normal' | 'warning' | 'critical';
  };
  thresholds: {
    minNormal: number;
    maxNormal: number;
    minWarning: number;
    maxWarning: number;
    minCritical: number;
    maxCritical: number;
  };
  readings: SensorReading[];
  isOnline: boolean;
  lastSeenAt: string;
  batteryLevel: number | null;
  alerts: SensorAlert[];
}
