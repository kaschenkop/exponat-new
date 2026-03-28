'use client';

import { ExpensesList } from '@/features/budget/components/expenses/ExpensesList';
import { useParams } from 'next/navigation';

export default function BudgetExpensesPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  return <ExpensesList budgetId={id} />;
}
