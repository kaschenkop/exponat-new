import { ShipmentsList } from '@/features/logistics/components/shipments/ShipmentsList';

export default function LogisticsShipmentsPage({
  params,
}: {
  params: { locale: string };
}): React.ReactElement {
  return <ShipmentsList locale={params.locale} />;
}
