'use client';

import { BudgetOverview } from '@/features/budget/components/overview/BudgetOverview';
import { useParams } from 'next/navigation';

export default function BudgetOverviewPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  return <BudgetOverview budgetId={id} />;
}
