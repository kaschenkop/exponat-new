'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useTranslations } from 'next-intl';
import type { Currency } from '../../types/budget.types';

export function CurrencySelect({
  value,
  onChange,
  disabled,
}: {
  value: Currency;
  onChange: (v: Currency) => void;
  disabled?: boolean;
}): React.ReactElement {
  const t = useTranslations('budget.currency');
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as Currency)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(['RUB', 'USD', 'EUR'] as const).map((c) => (
          <SelectItem key={c} value={c}>
            {t(c)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
