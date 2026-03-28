'use client';

import { useQuery } from '@tanstack/react-query';
import { approvalsApi } from '../api/approvalsApi';

export function useApprovals(budgetId: string) {
  return useQuery({
    queryKey: ['budget', budgetId, 'approvals'],
    queryFn: async () => {
      const res = await approvalsApi.list(budgetId);
      return res.items;
    },
    enabled: Boolean(budgetId),
    staleTime: 10_000,
  });
}
