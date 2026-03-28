import { LogisticsSubnav } from '@/features/logistics/components/LogisticsSubnav';
import { initPageLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';

export default async function LogisticsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('logisticsModule');

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">{t('title')}</h1>
      <LogisticsSubnav />
      {children}
    </div>
  );
}
