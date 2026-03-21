'use client';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { DashboardStats } from '@/features/dashboard/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats(): ReturnType<
  typeof useQuery<DashboardStats, Error>
> {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
  });
}
