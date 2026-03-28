'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';
import type { Budget } from '../../types/budget.types';
import { AmountDisplay } from '../shared/AmountDisplay';

export function BudgetSummary({ budget }: { budget: Budget }): React.ReactElement {
  const t = useTranslations('budget.overview');

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">{t('planned')}</p>
          <CardTitle className="font-display text-xl tabular-nums">
            <AmountDisplay amount={budget.totalPlanned} currency={budget.currency} />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">{t('spent')}</p>
          <CardTitle className="font-display text-xl tabular-nums">
            <AmountDisplay amount={budget.totalSpent} currency={budget.currency} />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">{t('pending')}</p>
          <CardTitle className="font-display text-xl tabular-nums">
            <AmountDisplay amount={budget.totalPending} currency={budget.currency} />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">{t('remaining')}</p>
          <CardTitle className="font-display text-xl tabular-nums">
            <AmountDisplay
              amount={budget.totalRemaining}
              currency={budget.currency}
              className={budget.totalRemaining < 0 ? 'text-destructive' : undefined}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {t('manager')}: {budget.managerName}
        </CardContent>
      </Card>
    </div>
  );
}
