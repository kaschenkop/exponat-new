'use client';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { BudgetTrendData } from '@/features/dashboard/types/dashboard.types';
import { useQuery } from '@tanstack/react-query';

export function useBudgetTrend(
  months = 6,
): ReturnType<typeof useQuery<BudgetTrendData[], Error>> {
  return useQuery({
    queryKey: ['dashboard', 'budget-trend', months],
    queryFn: () => dashboardApi.getBudgetTrend(months),
  });
}
