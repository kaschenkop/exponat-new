'use client';

import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useExhibit } from '../../hooks/useExhibits';
import { ExhibitStatusBadge } from '../shared/ExhibitStatusBadge';

export function ExhibitDetail({
  locale,
  id,
}: {
  locale: string;
  id: string;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.exhibits.detail');
  const ts = useTranslations('logisticsModule.exhibits.status');
  const { data, isLoading, isError } = useExhibit(id);
  const back = `/${locale}/dashboard/logistics/exhibits`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {t('notFound')}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={back}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Link>
        </Button>
        <ExhibitStatusBadge status={data.status} label={ts(data.status)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card>
            <div className="flex aspect-square items-center justify-center bg-muted">
              <Package className="h-24 w-24 text-muted-foreground/40" />
            </div>
            <CardHeader>
              <CardTitle className="font-display text-xl">{data.name}</CardTitle>
              <p className="font-mono text-sm text-muted-foreground">
                {data.inventoryNumber}
              </p>
            </CardHeader>
          </Card>
        </div>
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('about')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{data.description}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <span className="font-medium text-foreground">{t('location')}</span>
                  <br />
                  {data.currentLocation.name}, {data.currentLocation.address}
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('value')}</span>
                  <br />
                  {new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    maximumFractionDigits: 0,
                  }).format(data.estimatedValue)}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('dimensions')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                {t('size')}: {data.dimensions.width}×{data.dimensions.height}×
                {data.dimensions.depth} {t('cm')}
              </div>
              <div>
                {t('weight')}: {data.dimensions.weight} {t('kg')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
