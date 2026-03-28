'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { useTranslations } from 'next-intl';
import type { Category } from '../../types/category.types';
import { AmountDisplay } from '../shared/AmountDisplay';

export function BudgetProgress({
  categories,
  currency,
}: {
  categories: Category[];
  currency: string;
}): React.ReactElement {
  const t = useTranslations('budget.overview');
  const roots = categories.filter((c) => !c.parentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('byCategory')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roots.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noCategories')}</p>
        ) : (
          roots.map((c) => (
            <div key={c.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  <AmountDisplay amount={c.spentAmount} currency={currency} /> /{' '}
                  <AmountDisplay amount={c.plannedAmount} currency={currency} />
                </span>
              </div>
              <Progress value={Math.min(c.progressPercent, 100)} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
