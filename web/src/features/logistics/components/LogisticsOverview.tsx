'use client';

import { Package, Truck, Navigation, Thermometer, AlertTriangle, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useLogisticsSummary } from '../hooks/useLogisticsSummary';

export function LogisticsOverview({
  locale,
}: {
  locale: string;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.overview');
  const { data, isLoading, isError } = useLogisticsSummary();
  const base = `/${locale}/dashboard/logistics`;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {t('loadError')}
      </p>
    );
  }

  const items = [
    {
      icon: Package,
      label: t('exhibits'),
      value: data.exhibitCount,
      href: `${base}/exhibits`,
    },
    {
      icon: Truck,
      label: t('shipmentsActive'),
      value: data.shipmentActive,
      href: `${base}/shipments`,
    },
    {
      icon: Navigation,
      label: t('trackingOnline'),
      value: data.trackingOnline,
      href: `${base}/tracking`,
    },
    {
      icon: Thermometer,
      label: t('sensorsWarning'),
      value: data.sensorsWarning,
      href: `${base}/monitoring`,
    },
    {
      icon: AlertTriangle,
      label: t('openIncidents'),
      value: data.openIncidents,
      href: `${base}/reports`,
    },
    {
      icon: ClipboardList,
      label: t('auditsOpen'),
      value: data.inventoryAuditsOpen,
      href: `${base}/inventory`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, label, value, href }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="font-display text-2xl font-semibold tabular-nums">
                    {value}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{t('hint')}</p>
    </div>
  );
}
