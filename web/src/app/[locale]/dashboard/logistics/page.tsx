import { LogisticsOverview } from '@/features/logistics/components/LogisticsOverview';

export default function LogisticsOverviewPage({
  params,
}: {
  params: { locale: string };
}): React.ReactElement {
  return <LogisticsOverview locale={params.locale} />;
}
