'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onecApi } from '../api/onecApi';

export function useOneC(budgetId: string) {
  const qc = useQueryClient();

  const state = useQuery({
    queryKey: ['budget', budgetId, 'integration'],
    queryFn: () => onecApi.getState(budgetId),
    enabled: Boolean(budgetId),
    staleTime: 30_000,
  });

  const sync = useMutation({
    mutationFn: () => onecApi.sync(budgetId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'integration'] });
    },
  });

  return { ...state, sync };
}
