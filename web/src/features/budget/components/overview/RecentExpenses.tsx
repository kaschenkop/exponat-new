'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTranslations } from 'next-intl';
import { useExpenses } from '../../hooks/useExpenses';
import type { ExpenseFilters } from '../../types/expense.types';
import { AmountDisplay } from '../shared/AmountDisplay';
import { ExpenseStatusBadge } from '../shared/ExpenseStatusBadge';

const emptyFilters = (): ExpenseFilters => ({
  search: '',
  categoryIds: [],
  statuses: [],
  types: [],
  dateFrom: '',
  dateTo: '',
  amountMin: 0,
  amountMax: 0,
  vendors: [],
  createdBy: [],
});

export function RecentExpenses({
  budgetId,
  currency,
}: {
  budgetId: string;
  currency: string;
}): React.ReactElement {
  const t = useTranslations('budget.overview');
  const { data, isLoading } = useExpenses(budgetId, emptyFilters());
  const first = data?.pages[0]?.items ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('recent')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('recent')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {first.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noExpenses')}</p>
        ) : (
          first.slice(0, 5).map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.categoryName}</p>
              </div>
              <div className="flex items-center gap-2">
                <AmountDisplay amount={e.amount} currency={currency} />
                <ExpenseStatusBadge status={e.status} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
