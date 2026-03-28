import { ShipmentCreateForm } from '@/features/logistics/components/shipments/ShipmentCreateForm';

export default function LogisticsShipmentNewPage({
  params,
}: {
  params: { locale: string };
}): React.ReactElement {
  return <ShipmentCreateForm locale={params.locale} />;
}
