'use client';

import { useRecentActivity } from '@/features/dashboard/hooks/useRecentActivity';
import type { DashboardActivity } from '@/features/dashboard/types/dashboard.types';
import { groupActivityByDayLabel } from '@/features/dashboard/utils/dashboardHelpers';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

function groupByDate(
  items: DashboardActivity[],
  labelFor: (iso: string) => string,
): { label: string; items: DashboardActivity[] }[] {
  const map = new Map<string, typeof items>();
  for (const item of items) {
    const dayKey = format(parseISO(item.timestamp), 'yyyy-MM-dd');
    const prev = map.get(dayKey) ?? [];
    prev.push(item);
    map.set(dayKey, prev);
  }
  return Array.from(map.entries()).map(([, groupItems]) => {
    const first = groupItems[0];
    if (!first) {
      return { label: '', items: groupItems };
    }
    return {
      label: labelFor(first.timestamp),
      items: groupItems,
    };
  });
}

export function ActivityFeed(): React.ReactElement {
  const t = useTranslations('dashboard.home.activity');
  const locale = useLocale();
  const { data, isPending, isError, refetch } = useRecentActivity(10);

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">{t('error')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </CardContent>
      </Card>
    );
  }

  const labelFor = (iso: string) =>
    groupActivityByDayLabel(iso, t('today'), t('yesterday'));

  const groups = groupByDate(data, labelFor);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-4">
              {group.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                    {item.userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element -- внешние URL аватаров без конфигурации domains
                      <img
                        src={item.userAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                        {item.userName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium text-foreground">{item.userName}</span>{' '}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(parseISO(item.timestamp), 'HH:mm', {
                        locale: locale === 'ru' ? ru : undefined,
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
