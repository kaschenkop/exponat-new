'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';
import type { BudgetCreateInput } from '../api/budgetsApi';

export function useBudgetMutations() {
  const qc = useQueryClient();

  const createBudget = useMutation({
    mutationFn: (input: BudgetCreateInput) => budgetsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budgets'] });
      void qc.invalidateQueries({ queryKey: ['budgets', 'summary'] });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budgets'] });
      void qc.invalidateQueries({ queryKey: ['budgets', 'summary'] });
    },
  });

  return { createBudget, deleteBudget };
}
