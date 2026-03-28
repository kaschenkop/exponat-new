import { budgetGet, budgetPost } from './budgetClient';
import type { Expense } from '../types/expense.types';

export interface ExpensesListResponse {
  items: Expense[];
  total: number;
  page: number;
  limit: number;
}

export interface ExpenseListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ExpenseCreateInput {
  categoryId: string;
  title: string;
  description?: string;
  type?: Expense['type'];
  status?: Expense['status'];
  amount: number;
  currency?: Expense['currency'];
  expenseDate: string;
  paymentMethod?: Expense['paymentMethod'];
  vendor: string;
  vendorINN?: string | null;
  notes?: string;
}

export const expensesApi = {
  list: (budgetId: string, params: ExpenseListParams = {}) => {
    const p = new URLSearchParams();
    if (params.page) p.set('page', String(params.page));
    if (params.limit) p.set('limit', String(params.limit));
    if (params.search) p.set('search', params.search);
    const qs = p.toString();
    return budgetGet<ExpensesListResponse>(
      `/${budgetId}/expenses${qs ? `?${qs}` : ''}`,
    );
  },

  create: (budgetId: string, input: ExpenseCreateInput) =>
    budgetPost<Expense>(`/${budgetId}/expenses`, input),
};
