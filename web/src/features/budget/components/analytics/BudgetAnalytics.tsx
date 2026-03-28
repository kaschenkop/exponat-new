'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBudgetAnalytics } from '../../hooks/useBudgetAnalytics';
import { useBudget } from '../../hooks/useBudget';
import { BudgetForecast } from './BudgetForecast';
import { CategoryBreakdown } from './CategoryBreakdown';
import { ExportReports } from './ExportReports';
import { MonthlyComparison } from './MonthlyComparison';
import { SpendingTrends } from './SpendingTrends';
import { TopExpenses } from './TopExpenses';

export function BudgetAnalytics({ budgetId }: { budgetId: string }): React.ReactElement {
  const t = useTranslations('budget.analytics');
  const { data: budget } = useBudget(budgetId);
  const { data, isLoading } = useBudgetAnalytics(budgetId);
  const currency = budget?.currency ?? 'RUB';

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ExportReports />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="h-5 w-5 text-primary" />
              {t('trends')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingTrends data={data.trends} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-5 w-5 text-primary" />
              {t('breakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={data.categoryBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('monthly')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyComparison data={data.monthlyComparison} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('forecast')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetForecast data={data.forecast} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('top')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TopExpenses expenses={data.topExpenses} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
