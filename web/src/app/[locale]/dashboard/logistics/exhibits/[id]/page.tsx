import { ExhibitDetail } from '@/features/logistics/components/exhibits/ExhibitDetail';

export default function LogisticsExhibitDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}): React.ReactElement {
  return <ExhibitDetail locale={params.locale} id={params.id} />;
}
