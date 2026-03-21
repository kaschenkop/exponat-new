'use client';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { DashboardProject } from '@/features/dashboard/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';

export function useRecentProjects(): ReturnType<
  typeof useQuery<DashboardProject[], Error>
> {
  return useQuery({
    queryKey: ['dashboard', 'recent-projects'],
    queryFn: () => dashboardApi.getRecentProjects(),
  });
}
