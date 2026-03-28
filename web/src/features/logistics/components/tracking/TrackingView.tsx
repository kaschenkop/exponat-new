'use client';

import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTrackingDevices } from '../../hooks/useTracking';

export function TrackingView(): React.ReactElement {
  const t = useTranslations('logisticsModule.tracking');
  const { data, isLoading, isPending } = useTrackingDevices();
  const items = data?.items ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Card className="min-h-[420px]">
          <CardHeader>
            <CardTitle className="text-base">{t('mapTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-center">
              <MapPin className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="max-w-sm text-sm text-muted-foreground">
                {t('mapPlaceholder')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3 lg:col-span-4">
        <h2 className="font-display text-lg font-semibold">{t('devices')}</h2>
        {isLoading || isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          items.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {d.vehiclePlateNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <p>
                  {t('coords')}: {d.currentPosition.lat.toFixed(4)},{' '}
                  {d.currentPosition.lng.toFixed(4)}
                </p>
                <p>
                  {t('speed')}: {d.currentPosition.speed} {t('kmh')}
                </p>
                <p>
                  {d.isOnline ? t('online') : t('offline')} · {d.lastSeenAt}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
