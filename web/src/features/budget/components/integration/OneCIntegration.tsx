'use client';

import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTranslations } from 'next-intl';
import { useOneC } from '../../hooks/useOneC';
import { OneCLogs } from './OneCLogs';
import { OneCMapping } from './OneCMapping';
import { OneCSettings } from './OneCSettings';
import { OneCSync } from './OneCSync';

export function OneCIntegration({ budgetId }: { budgetId: string }): React.ReactElement {
  const t = useTranslations('budget.integration');
  const { data, isLoading, sync } = useOneC(budgetId);

  if (isLoading || !data) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-semibold">{t('title')}</h2>
          <Badge variant={data.connected ? 'default' : 'secondary'}>
            {data.connected ? t('connected') : t('disconnected')}
          </Badge>
        </div>
        <OneCSync onSync={() => sync.mutate()} pending={sync.isPending} />
      </div>
      {data.lastSyncAt ? (
        <p className="text-sm text-muted-foreground">
          {t('lastSync')}: {new Date(data.lastSyncAt).toLocaleString('ru-RU')}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <OneCMapping count={data.mappingCount} />
        <OneCSettings baseUrl={data.baseUrl} />
      </div>
      <OneCLogs logs={data.logs} />
    </div>
  );
}
