'use client';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import {
  CheckSquare,
  FolderTree,
  LayoutGrid,
  Link2,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { BudgetView } from '../types/budget.types';

const viewConfig: {
  value: BudgetView;
  icon: typeof LayoutGrid;
}[] = [
  { value: 'overview', icon: LayoutGrid },
  { value: 'categories', icon: FolderTree },
  { value: 'expenses', icon: Receipt },
  { value: 'approvals', icon: CheckSquare },
  { value: 'analytics', icon: TrendingUp },
  { value: 'integration', icon: Link2 },
];

export function BudgetViewTabs({
  budgetId,
  active,
}: {
  budgetId: string;
  active: BudgetView;
}): React.ReactElement {
  const t = useTranslations('budget.views');

  return (
    <nav
      className="-mx-1 flex flex-wrap gap-1 border-b border-border pb-px"
      aria-label="Budget sections"
    >
      {viewConfig.map(({ value, icon: Icon }) => {
        const href = `/dashboard/budgets/${budgetId}/${value}`;
        const isActive = active === value;
        return (
          <Link
            key={value}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-t-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{t(value)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
