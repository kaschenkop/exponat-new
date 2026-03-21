'use client';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { DashboardActivity } from '@/features/dashboard/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';

export function useRecentActivity(
  limit = 10,
): ReturnType<typeof useQuery<DashboardActivity[], Error>> {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardApi.getActivity(limit),
  });
}
