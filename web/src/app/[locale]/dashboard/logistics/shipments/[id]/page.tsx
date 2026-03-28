import { ShipmentDetail } from '@/features/logistics/components/shipments/ShipmentDetail';

export default function LogisticsShipmentDetailPage({
  params,
}: {
  params: { id: string };
}): React.ReactElement {
  return <ShipmentDetail id={params.id} />;
}
