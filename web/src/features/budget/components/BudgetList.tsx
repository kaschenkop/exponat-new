'use client';

import { Link } from '@/i18n/navigation';
import { ApiClientError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTranslations } from 'next-intl';
import { useBudgetSummary, useBudgets } from '../hooks/useBudgets';
import { AmountDisplay } from './shared/AmountDisplay';
import { BudgetStatusBadge } from './shared/BudgetStatusBadge';

export function BudgetList(): React.ReactElement {
  const t = useTranslations('budget');
  const { data, isLoading, isError, error, refetch } = useBudgets();
  const { data: summary } = useBudgetSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    const msg =
      error instanceof ApiClientError ? error.message : t('list.loadError');
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{msg}</p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          {t('list.retry')}
        </Button>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-8">
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('summary.totalPlanned')}</CardDescription>
              <CardTitle className="font-display text-xl tabular-nums">
                <AmountDisplay amount={summary.totalPlanned} currency="RUB" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('summary.totalSpent')}</CardDescription>
              <CardTitle className="font-display text-xl tabular-nums">
                <AmountDisplay amount={summary.totalSpent} currency="RUB" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('summary.active')}</CardDescription>
              <CardTitle className="font-display text-xl tabular-nums">
                {summary.activeCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('summary.overBudget')}</CardDescription>
              <CardTitle className="font-display text-xl tabular-nums">
                {summary.overBudgetCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{t('list.empty')}</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/budgets/new">{t('list.createFirst')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((b) => (
            <Link key={b.id} href={`/dashboard/budgets/${b.id}/overview`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-lg">{b.name}</CardTitle>
                    <BudgetStatusBadge status={b.status} />
                  </div>
                  <CardDescription className="line-clamp-2">
                    {b.description || '—'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('detail.progress')}
                    </span>
                    <span className="tabular-nums font-medium">
                      {Math.round(b.progressPercent)}%
                    </span>
                  </div>
                  <Progress value={Math.min(b.progressPercent, 100)} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('detail.spent')}</span>
                    <AmountDisplay amount={b.totalSpent} currency={b.currency} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
