'use client';

import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { BudgetChart } from '@/features/dashboard/components/BudgetChart';
import { RecentProjects } from '@/features/dashboard/components/RecentProjects';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { UpcomingEvents } from '@/features/dashboard/components/UpcomingEvents';
import { useBudgetTrend } from '@/features/dashboard/hooks/useBudgetTrend';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useRecentActivity } from '@/features/dashboard/hooks/useRecentActivity';
import { useRecentProjects } from '@/features/dashboard/hooks/useRecentProjects';
import { useUpcomingEvents } from '@/features/dashboard/hooks/useUpcomingEvents';
import { useToast } from '@/shared/hooks/use-toast';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import * as React from 'react';

export function DashboardHomeView(): React.ReactElement {
  const t = useTranslations('dashboard.home');
  const { toast } = useToast();
  const stats = useDashboardStats();
  const projects = useRecentProjects();
  const budget = useBudgetTrend(6);
  const events = useUpcomingEvents();
  const activity = useRecentActivity(10);

  const lastToastError = React.useRef<Error | null>(null);

  React.useEffect(() => {
    const err =
      stats.error ??
      projects.error ??
      budget.error ??
      events.error ??
      activity.error;
    if (err && err !== lastToastError.current) {
      lastToastError.current = err;
      toast({
        variant: 'destructive',
        title: t('loadErrorTitle'),
        description: err.message,
      });
    }
    if (!err) {
      lastToastError.current = null;
    }
  }, [
    stats.error,
    projects.error,
    budget.error,
    events.error,
    activity.error,
    toast,
    t,
  ]);

  return (
    <motion.div
      className="mx-auto flex max-w-7xl flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          {t('welcome')}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t('subtitle')}</p>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BudgetChart />
        </div>
        <div className="xl:col-span-1">
          <UpcomingEvents />
        </div>
      </div>

      <RecentProjects />

      <ActivityFeed />
    </motion.div>
  );
}
