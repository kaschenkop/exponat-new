'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useLogisticsSummary } from '../../hooks/useLogisticsSummary';

export function LogisticsReports(): React.ReactElement {
  const t = useTranslations('logisticsModule.reports');
  const { data, isLoading } = useLogisticsSummary();

  if (isLoading || !data) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t('summaryTitle')}</CardTitle>
          <Button variant="outline" size="sm" type="button" disabled>
            {t('export')}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <span className="text-muted-foreground">{t('exhibits')}</span>
            <div className="text-xl font-semibold">{data.exhibitCount}</div>
          </div>
          <div>
            <span className="text-muted-foreground">{t('shipments')}</span>
            <div className="text-xl font-semibold">{data.shipmentActive}</div>
          </div>
          <div>
            <span className="text-muted-foreground">{t('movements30')}</span>
            <div className="text-xl font-semibold">{data.movementsLast30d}</div>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">{t('hint')}</p>
    </div>
  );
}
