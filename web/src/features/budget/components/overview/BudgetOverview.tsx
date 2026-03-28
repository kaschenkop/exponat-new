'use client';

import { Skeleton } from '@/shared/ui/skeleton';
import { useCategories } from '../../hooks/useCategories';
import { useBudget } from '../../hooks/useBudget';
import { BudgetAlerts } from './BudgetAlerts';
import { BudgetChart } from './BudgetChart';
import { BudgetProgress } from './BudgetProgress';
import { BudgetSummary } from './BudgetSummary';
import { RecentExpenses } from './RecentExpenses';

export function BudgetOverview({ budgetId }: { budgetId: string }): React.ReactElement {
  const { data: budget, isLoading } = useBudget(budgetId);
  const { data: categories = [], isLoading: catLoading } = useCategories(budgetId);

  if (isLoading || !budget) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetAlerts budget={budget} />
      <BudgetSummary budget={budget} />
      <div className="grid gap-6 lg:grid-cols-2">
        {catLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BudgetProgress categories={categories} currency={budget.currency} />
        )}
        {catLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BudgetChart categories={categories} />
        )}
      </div>
      <RecentExpenses budgetId={budgetId} currency={budget.currency} />
    </div>
  );
}
