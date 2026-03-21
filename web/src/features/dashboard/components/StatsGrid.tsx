'use client';

import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import {
  formatChangePercent,
  formatCurrencyRub,
} from '@/features/dashboard/utils/dashboardHelpers';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Boxes, Coins, Users, Waypoints } from 'lucide-react';
import { useTranslations } from 'next-intl';

function StatsGridSkeleton(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6">
          <Skeleton className="mb-4 h-4 w-24" />
          <Skeleton className="mb-2 h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function StatsGrid(): React.ReactElement {
  const t = useTranslations('dashboard.home.stats');
  const { data, isPending, isError, refetch } = useDashboardStats();

  if (isPending) {
    return <StatsGridSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">{t('error')}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  const { activeProjects, totalBudget, exhibits, participants } = data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title={t('activeProjects')}
        value={String(activeProjects.count)}
        change={formatChangePercent(activeProjects.change)}
        icon={Boxes}
        trend={activeProjects.change >= 0 ? 'up' : 'down'}
      />
      <StatsCard
        title={t('totalBudget')}
        value={formatCurrencyRub(totalBudget.amount)}
        change={formatChangePercent(totalBudget.change)}
        icon={Coins}
        trend={totalBudget.change >= 0 ? 'up' : 'down'}
      />
      <StatsCard
        title={t('exhibits')}
        value={String(exhibits.count)}
        change={formatChangePercent(exhibits.change)}
        icon={Waypoints}
        trend={exhibits.change >= 0 ? 'up' : 'down'}
      />
      <StatsCard
        title={t('participants')}
        value={String(participants.count)}
        change={formatChangePercent(participants.change)}
        icon={Users}
        trend={participants.change >= 0 ? 'up' : 'down'}
      />
    </div>
  );
}
