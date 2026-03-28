'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categoriesApi';
import type { CategoryCreateInput } from '../api/categoriesApi';

export function useCategoryMutations(budgetId: string) {
  const qc = useQueryClient();

  const createCategory = useMutation({
    mutationFn: (input: CategoryCreateInput) =>
      categoriesApi.create(budgetId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'categories'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (categoryId: string) =>
      categoriesApi.delete(budgetId, categoryId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'categories'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId] });
    },
  });

  return { createCategory, deleteCategory };
}
