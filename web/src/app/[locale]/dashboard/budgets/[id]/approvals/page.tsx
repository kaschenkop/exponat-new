'use client';

import { ApprovalsQueue } from '@/features/budget/components/approvals/ApprovalsQueue';
import { useParams } from 'next/navigation';

export default function BudgetApprovalsPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  return <ApprovalsQueue budgetId={id} />;
}
