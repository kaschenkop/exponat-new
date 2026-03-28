'use client';

import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { useTranslations } from 'next-intl';
import type { ExpenseFilters as Filters } from '../../types/expense.types';
import type { ExpenseStatus } from '../../types/expense.types';
import { DateRangePicker } from '../shared/DateRangePicker';

const STATUSES: ExpenseStatus[] = [
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'paid',
  'cancelled',
];

export function ExpenseFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}): React.ReactElement {
  const t = useTranslations('budget.filters');
  const ts = useTranslations('budget.expense.status');

  const toggleStatus = (s: ExpenseStatus) => {
    const set = new Set(filters.statuses);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    onChange({ ...filters, statuses: Array.from(set) });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={filters.statuses.includes(s) ? 'default' : 'outline'}
            onClick={() => toggleStatus(s)}
          >
            {ts(s)}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        <Label>{t('period')}</Label>
        <DateRangePicker
          from={filters.dateFrom}
          to={filters.dateTo}
          onFromChange={(dateFrom) => onChange({ ...filters, dateFrom })}
          onToChange={(dateTo) => onChange({ ...filters, dateTo })}
        />
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        {t('reset')}
      </Button>
    </div>
  );
}
