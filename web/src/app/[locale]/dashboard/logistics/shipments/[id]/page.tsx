import { ShipmentDetail } from '@/features/logistics/components/shipments/ShipmentDetail';

export default function LogisticsShipmentDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}): React.ReactElement {
  return <ShipmentDetail locale={params.locale} id={params.id} />;
}
