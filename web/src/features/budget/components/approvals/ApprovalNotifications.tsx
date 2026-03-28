'use client';

import { useTranslations } from 'next-intl';

export function ApprovalNotifications(): React.ReactElement {
  const t = useTranslations('budget.approvals');
  return (
    <p className="text-xs text-muted-foreground">{t('notificationsHint')}</p>
  );
}
