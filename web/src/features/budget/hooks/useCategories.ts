'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categoriesApi';

export function useCategories(budgetId: string) {
  return useQuery({
    queryKey: ['budget', budgetId, 'categories'],
    queryFn: async () => {
      const res = await categoriesApi.list(budgetId);
      return res.items;
    },
    enabled: Boolean(budgetId),
    staleTime: 15_000,
  });
}
