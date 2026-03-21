'use client';

import { useUpcomingEvents } from '@/features/dashboard/hooks/useUpcomingEvents';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export function UpcomingEvents(): React.ReactElement {
  const t = useTranslations('dashboard.home');
  const locale = useLocale();
  const { data, isPending, isError, refetch } = useUpcomingEvents();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('events.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">{t('events.error')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('events.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('events.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('events.empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('events.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-4">
          {data.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                  {t(`events.types.${ev.type}`)}
                </Badge>
                <span className="text-sm font-medium leading-snug">{ev.title}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {format(parseISO(ev.date), "d MMMM yyyy, HH:mm", {
                    locale: locale === 'ru' ? ru : undefined,
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {ev.location}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
