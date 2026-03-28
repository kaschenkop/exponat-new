'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useShipment } from '../../hooks/useShipments';
import { ShipmentStatusBadge } from '../shared/ShipmentStatusBadge';

export function ShipmentDetail({
  locale,
  id,
}: {
  locale: string;
  id: string;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.shipments.detail');
  const ts = useTranslations('logisticsModule.shipments.status');
  const { data, isLoading, isError } = useShipment(id);
  const back = `/${locale}/dashboard/logistics/shipments`;

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }
  if (isError || !data) {
    return <p className="text-sm text-destructive">{t('notFound')}</p>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={back}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Link>
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">{data.number}</h1>
        <ShipmentStatusBadge status={data.status} label={ts(data.status)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('route')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t('from')}</span>{' '}
              {data.route.origin.address}
            </p>
            <p>
              <span className="text-muted-foreground">{t('to')}</span>{' '}
              {data.route.destination.address}
            </p>
            {data.currentLocation ? (
              <p className="pt-2 font-mono text-xs">
                GPS: {data.currentLocation.lat.toFixed(4)},{' '}
                {data.currentLocation.lng.toFixed(4)} · {data.currentLocation.speed}{' '}
                {t('kmh')}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('vehicle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {data.vehicle.model} · {data.vehicle.plateNumber}
            </p>
            <p className="text-muted-foreground">
              {data.vehicle.driverName} · {data.vehicle.driverPhone}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('timeline')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.timeline.map((item) => (
            <div
              key={item.id}
              className="border-l-2 border-primary/30 pl-4 text-sm"
            >
              <div className="font-medium">{item.title}</div>
              <div className="text-muted-foreground">{item.description}</div>
              <div className="text-xs text-muted-foreground">{item.timestamp}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
