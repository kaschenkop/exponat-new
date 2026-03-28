'use client';

import { create } from 'zustand';

interface BudgetUiState {
  expenseFiltersOpen: boolean;
  setExpenseFiltersOpen: (v: boolean) => void;
}

export const useBudgetUiStore = create<BudgetUiState>((set) => ({
  expenseFiltersOpen: false,
  setExpenseFiltersOpen: (v) => set({ expenseFiltersOpen: v }),
}));
