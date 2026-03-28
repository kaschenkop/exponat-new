'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useInventoryAudits, useMovements } from '../../hooks/useInventory';

export function InventoryView(): React.ReactElement {
  const t = useTranslations('logisticsModule.inventory');
  const { data: audits, isLoading: al, isPending: ap } = useInventoryAudits();
  const { data: moves, isLoading: ml, isPending: mp } = useMovements();
  const auditsLoading = al || ap;
  const movesLoading = ml || mp;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">{t('audits')}</h2>
        {auditsLoading ? (
          <Skeleton className="h-40 w-full rounded-lg" />
        ) : (
          <div className="space-y-3">
            {(audits?.items ?? []).map((a) => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{a.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{a.description}</p>
                  <p className="mt-2">
                    {t('auditProgress', {
                      found: a.totalFound,
                      expected: a.totalExpected,
                    })}
                  </p>
                  <p className="text-xs">{t('status')}: {a.status}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">
          {t('movements')}
        </h2>
        {movesLoading ? (
          <Skeleton className="h-40 w-full rounded-lg" />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-2 gap-2 border-b bg-muted/50 p-3 text-xs font-medium">
              <div>{t('exhibit')}</div>
              <div>{t('movement')}</div>
            </div>
            {(moves?.items ?? []).map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-2 gap-2 border-b p-3 text-sm last:border-0"
              >
                <div>{m.exhibitName}</div>
                <div className="text-muted-foreground">
                  {m.fromLocationName} → {m.toLocationName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
