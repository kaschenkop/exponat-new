import { budgetDelete, budgetGet, budgetPost } from './budgetClient';
import type { Category } from '../types/category.types';

export interface CategoriesResponse {
  items: Category[];
}

export interface CategoryCreateInput {
  parentId?: string | null;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
  plannedAmount?: number;
}

export const categoriesApi = {
  list: (budgetId: string) =>
    budgetGet<CategoriesResponse>(`/${budgetId}/categories`),

  create: (budgetId: string, input: CategoryCreateInput) =>
    budgetPost<Category>(`/${budgetId}/categories`, input),

  delete: (budgetId: string, categoryId: string) =>
    budgetDelete(`/${budgetId}/categories/${categoryId}`),
};
