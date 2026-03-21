export type ShipmentStatus = 'planned' | 'in_transit' | 'delivered';

export type ShipmentType = {
  id: string;
  title: string;
  status: ShipmentStatus;
};
