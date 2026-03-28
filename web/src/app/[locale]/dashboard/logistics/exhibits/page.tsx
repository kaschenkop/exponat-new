import { ExhibitsCatalog } from '@/features/logistics/components/exhibits/ExhibitsCatalog';

export default function LogisticsExhibitsPage({
  params,
}: {
  params: { locale: string };
}): React.ReactElement {
  return <ExhibitsCatalog locale={params.locale} />;
}
