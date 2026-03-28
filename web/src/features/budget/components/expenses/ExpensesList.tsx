'use client';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Download, Filter, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { useBudget } from '../../hooks/useBudget';
import type { ExpenseFilters } from '../../types/expense.types';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseFilters as ExpenseFiltersPanel } from './ExpenseFilters';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseSearch } from './ExpenseSearch';

function matchesFilters(
  row: import('../../types/expense.types').Expense,
  f: ExpenseFilters,
): boolean {
  if (f.statuses.length && !f.statuses.includes(row.status)) return false;
  if (f.dateFrom && row.expenseDate < f.dateFrom) return false;
  if (f.dateTo && row.expenseDate > f.dateTo) return false;
  return true;
}

export function ExpensesList({ budgetId }: { budgetId: string }): React.ReactElement {
  const t = useTranslations('budget.expenses');
  const { data: budget } = useBudget(budgetId);
  const [filters, setFilters] = useState<ExpenseFilters>({
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
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);

  const q = useExpenses(budgetId, filters);
  const items = useMemo(() => {
    const pages = q.data?.pages ?? [];
    const raw = pages.flatMap((p) => p.items);
    return raw.filter((e) => matchesFilters(e, filters));
  }, [q.data?.pages, filters]);

  const currency = budget?.currency ?? 'RUB';

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <ExpenseSearch
          value={filters.search}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('filters')}
          </Button>
          <Button type="button" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add')}
          </Button>
          <Button variant="outline" type="button" disabled>
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
        </div>
      </div>

      {showFilters ? (
        <ExpenseFiltersPanel
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              search: filters.search,
              categoryIds: [],
              statuses: [],
              types: [],
              dateFrom: '',
              dateTo: '',
              amountMin: 0,
              amountMax: 0,
              vendors: [],
              createdBy: [],
            })
          }
        />
      ) : null}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          items.map((e) => (
            <ExpenseCard
              key={e.id}
              expense={e}
              currency={currency}
              onEdit={() => {}}
            />
          ))
        )}
      </div>

      {q.hasNextPage ? (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => q.fetchNextPage()}
            disabled={q.isFetchingNextPage}
          >
            {t('loadMore')}
          </Button>
        </div>
      ) : null}

      {creating ? (
        <ExpenseForm budgetId={budgetId} onClose={() => setCreating(false)} />
      ) : null}
    </div>
  );
}
