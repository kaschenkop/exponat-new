'use client';

import { useParams } from 'next/navigation';
import { ApiClientError } from '@/shared/lib/api-client';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTranslations } from 'next-intl';
import { useBudget } from '../hooks/useBudget';
import { useBudgetView } from '../hooks/useBudgetView';
import { BudgetHeader } from './BudgetHeader';

export function BudgetDetailLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  const t = useTranslations('budget');
  const active = useBudgetView();
  const { data: budget, isLoading, isError, error, refetch } = useBudget(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !budget) {
    const msg = error instanceof ApiClientError ? error.message : t('detail.notFound');
    return (
      <div className="rounded-lg border border-destructive/40 p-6 text-center">
        <p className="text-sm text-destructive">{msg}</p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          {t('list.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BudgetHeader budget={budget} active={active} />
      <div>{children}</div>
    </div>
  );
}
