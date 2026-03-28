'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useShipments } from '../../hooks/useShipments';
import { ShipmentStatusBadge } from '../shared/ShipmentStatusBadge';

export function ShipmentsList(): React.ReactElement {
  const t = useTranslations('logisticsModule.shipments');
  const ts = useTranslations('logisticsModule.shipments.status');
  const { data, isLoading, isPending } = useShipments();
  const items = data?.items ?? [];
  const base = '/dashboard/logistics/shipments';

  if (isLoading || isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`${base}/new`}>{t('new')}</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {items.map((s) => (
          <Card key={s.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="font-display text-lg">
                  {s.number}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {s.route.origin.name} → {s.route.destination.name}
                </p>
              </div>
              <ShipmentStatusBadge status={s.status} label={ts(s.status)} />
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {t('exhibitsCount', { count: s.totalExhibits })} ·{' '}
                {s.vehicle.plateNumber}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`${base}/${s.id}`}>{t('open')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
