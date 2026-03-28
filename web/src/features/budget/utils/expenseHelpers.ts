import type { ExpenseStatus } from '../types/expense.types';

export function expenseStatusLabelKey(
  status: ExpenseStatus,
): `status.${ExpenseStatus}` {
  return `status.${status}`;
}
