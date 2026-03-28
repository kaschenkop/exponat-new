'use client';

import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

/** Заглушка массовых действий (экспорт, согласование пакетом). */
export function ExpenseBulkActions(): React.ReactElement {
  const t = useTranslations('budget.expenses');
  return (
    <Button variant="outline" type="button" disabled>
      {t('bulkSoon')}
    </Button>
  );
}
