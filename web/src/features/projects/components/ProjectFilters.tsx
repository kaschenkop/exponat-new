'use client';

import { Input } from '@/shared/ui/input';
import { useTranslations } from 'next-intl';
import * as React from 'react';

export function ProjectFilters({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  const t = useTranslations('common');

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('search')}
      aria-label={t('search')}
    />
  );
}
