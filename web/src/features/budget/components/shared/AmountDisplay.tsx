'use client';

import { cn } from '@/shared/lib/utils';
import { formatMoney } from '../../utils/amountFormatters';

export function AmountDisplay({
  amount,
  currency,
  className,
}: {
  amount: number;
  currency: string;
  className?: string;
}): React.ReactElement {
  return (
    <span className={cn('tabular-nums', className)}>
      {formatMoney(amount, currency)}
    </span>
  );
}
