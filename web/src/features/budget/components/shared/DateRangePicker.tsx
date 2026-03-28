'use client';

import { Input } from '@/shared/ui/input';
import { useTranslations } from 'next-intl';

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}): React.ReactElement {
  const t = useTranslations('budget.filters');
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        aria-label={t('dateFrom')}
        className="w-auto"
      />
      <span className="text-muted-foreground">—</span>
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        aria-label={t('dateTo')}
        className="w-auto"
      />
    </div>
  );
}
