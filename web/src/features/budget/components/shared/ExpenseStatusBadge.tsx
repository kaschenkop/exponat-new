'use client';

import { Badge } from '@/shared/ui/badge';
import { useTranslations } from 'next-intl';
import type { ExpenseStatus } from '../../types/expense.types';

const variant: Partial<
  Record<ExpenseStatus, 'default' | 'secondary' | 'outline' | 'muted'>
> = {
  paid: 'default',
  approved: 'default',
  pending_approval: 'secondary',
  draft: 'outline',
  rejected: 'outline',
  cancelled: 'muted',
};

export function ExpenseStatusBadge({
  status,
}: {
  status: ExpenseStatus;
}): React.ReactElement {
  const t = useTranslations('budget.expense.status');
  const v = variant[status] ?? 'secondary';
  return (
    <Badge
      variant={v}
      className={status === 'rejected' ? 'border-destructive/50 text-destructive' : undefined}
    >
      {t(status)}
    </Badge>
  );
}
