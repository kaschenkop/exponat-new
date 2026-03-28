'use client';

import { useQuery } from '@tanstack/react-query';
import { budgetGet } from '../api/budgetClient';
import type { Expense } from '../types/expense.types';

export interface BudgetAnalyticsData {
  trends: { date: string; value: number }[];
  categoryBreakdown: { name: string; value: number }[];
  monthlyComparison: { month: string; planned: number; actual: number }[];
  forecast: { projectedTotal: number; confidence: number; message: string };
  topExpenses: Expense[];
}

export function useBudgetAnalytics(budgetId: string) {
  return useQuery({
    queryKey: ['budget', budgetId, 'analytics'],
    queryFn: () =>
      budgetGet<BudgetAnalyticsData>(`/${budgetId}/analytics`),
    enabled: Boolean(budgetId),
    staleTime: 60_000,
  });
}
