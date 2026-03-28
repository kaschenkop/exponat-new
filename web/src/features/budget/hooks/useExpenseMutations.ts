'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expensesApi';
import type { ExpenseCreateInput } from '../api/expensesApi';

export function useExpenseMutations(budgetId: string) {
  const qc = useQueryClient();

  const createExpense = useMutation({
    mutationFn: (input: ExpenseCreateInput) =>
      expensesApi.create(budgetId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'expenses'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'categories'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'approvals'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'analytics'] });
    },
  });

  return { createExpense };
}
