'use client';

import { Input } from '@/shared/ui/input';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ExpenseSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}): React.ReactElement {
  const t = useTranslations('budget.expenses');
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        aria-label={t('searchPlaceholder')}
      />
    </div>
  );
}
