'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Budget } from '../../types/budget.types';
import { cn } from '@/shared/lib/utils';

export function BudgetAlerts({ budget }: { budget: Budget }): React.ReactElement | null {
  const t = useTranslations('budget.overview');

  if (!budget.isOverBudget && budget.progressPercent < budget.warningThreshold) {
    return null;
  }

  const critical = budget.isOverBudget;

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border p-4',
        critical
          ? 'border-destructive/50 bg-destructive/10 text-destructive'
          : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
      )}
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="space-y-1 text-sm">
        <p className="font-medium">
          {critical ? t('alertOver') : t('alertWarning')}
        </p>
        <p className={cn('opacity-90', critical && 'text-destructive/90')}>
          {critical
            ? t('alertOverDesc')
            : t('alertWarningDesc', {
                pct: Math.round(budget.progressPercent),
              })}
        </p>
      </div>
    </div>
  );
}
