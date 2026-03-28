'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Budget, BudgetView } from '../types/budget.types';
import { BudgetStatusBadge } from './shared/BudgetStatusBadge';
import { BudgetViewTabs } from './BudgetViewTabs';

export function BudgetHeader({
  budget,
  active,
}: {
  budget: Budget;
  active: BudgetView;
}): React.ReactElement {
  const t = useTranslations('budget');

  return (
    <div className="border-b border-border bg-card">
      <div className="space-y-4 px-1 pb-4 pt-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
              <Link href="/dashboard/budgets">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                {t('detail.back')}
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {budget.name}
              </h1>
              <BudgetStatusBadge status={budget.status} />
            </div>
            {budget.description ? (
              <p className="max-w-3xl text-sm text-muted-foreground">
                {budget.description}
              </p>
            ) : null}
          </div>
        </div>
        <BudgetViewTabs budgetId={budget.id} active={active} />
      </div>
    </div>
  );
}
