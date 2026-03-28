'use client';

import { useTranslations } from 'next-intl';

export function ExpenseAttachments(): React.ReactElement {
  const t = useTranslations('budget.expenses');
  return (
    <p className="text-xs text-muted-foreground">{t('attachmentsSoon')}</p>
  );
}
