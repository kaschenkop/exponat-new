'use client';

import { CategoriesTree } from '@/features/budget/components/categories/CategoriesTree';
import { useParams } from 'next/navigation';

export default function BudgetCategoriesPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  return <CategoriesTree budgetId={id} />;
}
