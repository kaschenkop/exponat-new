'use client';

import { Button } from '@/shared/ui/button';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CategoryImport1C(): React.ReactElement {
  const t = useTranslations('budget.categories');
  return (
    <Button variant="outline" type="button" disabled title={t('importSoon')}>
      <Upload className="mr-2 h-4 w-4" />
      {t('import1c')}
    </Button>
  );
}
