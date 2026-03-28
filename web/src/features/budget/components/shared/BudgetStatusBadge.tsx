'use client';

import { Badge } from '@/shared/ui/badge';
import { useTranslations } from 'next-intl';
import type { BudgetStatus } from '../../types/budget.types';

export function BudgetStatusBadge({
  status,
}: {
  status: BudgetStatus;
}): React.ReactElement {
  const t = useTranslations('budget.status');
  return <Badge variant="secondary">{t(status)}</Badge>;
}
