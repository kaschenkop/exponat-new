'use client';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { DashboardEvent } from '@/features/dashboard/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';

export function useUpcomingEvents(): ReturnType<
  typeof useQuery<DashboardEvent[], Error>
> {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-events'],
    queryFn: () => dashboardApi.getUpcomingEvents(),
  });
}
