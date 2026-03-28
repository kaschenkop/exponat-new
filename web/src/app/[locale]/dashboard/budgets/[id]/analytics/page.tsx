'use client';

import { BudgetAnalytics } from '@/features/budget/components/analytics/BudgetAnalytics';
import { useParams } from 'next/navigation';

export default function BudgetAnalyticsPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  return <BudgetAnalytics budgetId={id} />;
}
