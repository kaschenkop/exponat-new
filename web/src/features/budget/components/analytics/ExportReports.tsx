'use client';

import { Button } from '@/shared/ui/button';
import { FileDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ExportReports(): React.ReactElement {
  const t = useTranslations('budget.analytics');
  return (
    <Button variant="outline" type="button" disabled title={t('exportSoon')}>
      <FileDown className="mr-2 h-4 w-4" />
      {t('export')}
    </Button>
  );
}
