'use client';

import { useBudgetTrend } from '@/features/dashboard/hooks/useBudgetTrend';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTranslations } from 'next-intl';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function BudgetChart(): React.ReactElement {
  const t = useTranslations('dashboard.home.budgetChart');
  const { data, isPending, isError, refetch } = useBudgetTrend(6);

  if (isPending) {
    return (
      <Card className="min-h-[320px]">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.length) {
    return (
      <Card className="min-h-[320px]">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">{isError ? t('error') : t('empty')}</p>
          {isError ? (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t('retry')}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[320px]">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(v: number) =>
                  new Intl.NumberFormat('ru-RU', {
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  }).format(v)
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                }}
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value),
                  name === 'planned' ? t('planned') : t('actual'),
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === 'planned' ? t('planned') : t('actual')
                }
              />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="planned"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(142 71% 45%)"
                strokeWidth={2}
                dot={false}
                name="actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
