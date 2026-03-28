'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { expensesApi } from '../api/expensesApi';
import type { ExpenseFilters } from '../types/expense.types';

export function useExpenses(budgetId: string, filters: ExpenseFilters) {
  return useInfiniteQuery({
    queryKey: ['budget', budgetId, 'expenses', filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      expensesApi.list(budgetId, {
        page: pageParam as number,
        limit: 20,
        search: filters.search || undefined,
      }),
    getNextPageParam: (last, allPages, lastPageParam) => {
      const page = lastPageParam as number;
      const totalLoaded = allPages.reduce((s, p) => s + p.items.length, 0);
      return totalLoaded < last.total ? page + 1 : undefined;
    },
    enabled: Boolean(budgetId),
    staleTime: 15_000,
  });
}
