'use client';

import { OneCIntegration } from '@/features/budget/components/integration/OneCIntegration';
import { useParams } from 'next/navigation';

export default function BudgetIntegrationPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  return <OneCIntegration budgetId={id} />;
}
