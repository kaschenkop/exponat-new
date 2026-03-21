import { DashboardHomeView } from '@/features/dashboard/components/DashboardHomeView';
import { initPageLocale } from '@/i18n/server';

export default function DashboardHomePage({
  params,
}: {
  params: { locale: string };
}): React.ReactElement {
  initPageLocale(params.locale);

  return <DashboardHomeView />;
}
