'use client';

import { usePathname } from '@/i18n/navigation';
import type { BudgetView } from '../types/budget.types';

export function useBudgetView(): BudgetView {
  const pathname = usePathname();
  const seg = pathname.split('/').filter(Boolean);
  const last = seg[seg.length - 1];
  const views: BudgetView[] = [
    'overview',
    'categories',
    'expenses',
    'approvals',
    'analytics',
    'integration',
  ];
  if (last && views.includes(last as BudgetView)) {
    return last as BudgetView;
  }
  return 'overview';
}
