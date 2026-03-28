'use client';

import { useQuery } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.list(),
    staleTime: 30_000,
  });
}

export function useBudgetSummary() {
  return useQuery({
    queryKey: ['budgets', 'summary'],
    queryFn: () => budgetsApi.summary(),
    staleTime: 30_000,
  });
}
