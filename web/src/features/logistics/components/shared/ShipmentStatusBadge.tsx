'use client';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { ShipmentStatus } from '../../types/shipment.types';

const styles: Record<ShipmentStatus, string> = {
  planned: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  in_preparation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_transit: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function ShipmentStatusBadge({
  status,
  label,
}: {
  status: ShipmentStatus;
  label: string;
}): React.ReactElement {
  return (
    <Badge variant="outline" className={cn('border-0', styles[status])}>
      {label}
    </Badge>
  );
}
