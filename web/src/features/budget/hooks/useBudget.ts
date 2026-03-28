'use client';

import { useQuery } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';

export function useBudget(id: string) {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsApi.getById(id),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}
