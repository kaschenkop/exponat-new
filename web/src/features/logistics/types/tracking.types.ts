export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
  address: string | null;
}

export interface TrackingAlert {
  id: string;
  type:
    | 'offline'
    | 'speed_exceeded'
    | 'route_deviation'
    | 'geofence_breach'
    | 'low_battery';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
}

export interface TrackingDevice {
  id: string;
  deviceId: string;
  shipmentId: string;
  vehiclePlateNumber: string;
  currentPosition: {
    lat: number;
    lng: number;
    accuracy: number;
    altitude: number | null;
    heading: number | null;
    speed: number;
    timestamp: string;
  };
  isOnline: boolean;
  lastSeenAt: string;
  batteryLevel: number | null;
  plannedRoute: RoutePoint[];
  actualRoute: RoutePoint[];
  alerts: TrackingAlert[];
}
