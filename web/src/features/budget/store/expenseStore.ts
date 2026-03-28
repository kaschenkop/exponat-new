'use client';

import { create } from 'zustand';
import type { ExpenseFilters } from '../types/expense.types';

const defaultFilters = (): ExpenseFilters => ({
  search: '',
  categoryIds: [],
  statuses: [],
  types: [],
  dateFrom: '',
  dateTo: '',
  amountMin: 0,
  amountMax: 0,
  vendors: [],
  createdBy: [],
});

interface ExpenseFilterState {
  filters: ExpenseFilters;
  setFilters: (f: Partial<ExpenseFilters>) => void;
  resetFilters: () => void;
}

export const useExpenseFilterStore = create<ExpenseFilterState>((set) => ({
  filters: defaultFilters(),
  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters() }),
}));
