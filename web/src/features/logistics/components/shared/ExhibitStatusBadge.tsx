'use client';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { ExhibitStatus } from '../../types/exhibit.types';

const styles: Record<ExhibitStatus, string> = {
  in_storage: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  on_display: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  in_transit: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  in_restoration: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  decommissioned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function ExhibitStatusBadge({
  status,
  label,
}: {
  status: ExhibitStatus;
  label: string;
}): React.ReactElement {
  return (
    <Badge variant="outline" className={cn('border-0', styles[status])}>
      {label}
    </Badge>
  );
}
