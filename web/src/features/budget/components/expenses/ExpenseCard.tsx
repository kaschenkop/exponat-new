'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Expense } from '../../types/expense.types';
import { AmountDisplay } from '../shared/AmountDisplay';
import { CategoryBadge } from '../shared/CategoryBadge';
import { ExpenseStatusBadge } from '../shared/ExpenseStatusBadge';

export function ExpenseCard({
  expense,
  currency,
  onEdit,
}: {
  expense: Expense;
  currency: string;
  onEdit: () => void;
}): React.ReactElement {
  const t = useTranslations('budget.expenses');

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{expense.title}</h3>
            <ExpenseStatusBadge status={expense.status} />
          </div>
          <p className="text-sm text-muted-foreground">{expense.vendor}</p>
          <CategoryBadge name={expense.categoryName} />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <AmountDisplay amount={expense.amount} currency={currency} />
          <Button variant="outline" size="sm" type="button" onClick={onEdit}>
            <Pencil className="mr-1 h-4 w-4" />
            {t('edit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
