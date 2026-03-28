import { budgetDelete, budgetGet, budgetPost } from './budgetClient';
import type { Budget, BudgetSummary } from '../types/budget.types';

export interface BudgetsListResponse {
  items: Budget[];
  total: number;
}

export interface BudgetCreateInput {
  projectId?: string;
  name: string;
  description?: string;
  status?: Budget['status'];
  period?: Budget['period'];
  currency?: Budget['currency'];
  startDate?: string;
  endDate?: string;
  totalPlanned?: number;
}

export const budgetsApi = {
  summary: () => budgetGet<BudgetSummary>('/summary'),

  list: () => budgetGet<BudgetsListResponse>(''),

  getById: (id: string) => budgetGet<Budget>(`/${id}`),

  create: (input: BudgetCreateInput) =>
    budgetPost<Budget>('', input) as Promise<Budget>,

  delete: (id: string) => budgetDelete(`/${id}`),
};
