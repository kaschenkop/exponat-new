import { ExhibitDetail } from '@/features/logistics/components/exhibits/ExhibitDetail';

export default function LogisticsExhibitDetailPage({
  params,
}: {
  params: { id: string };
}): React.ReactElement {
  return <ExhibitDetail id={params.id} />;
}
