'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ApprovalWorkflow(): React.ReactElement {
  const t = useTranslations('budget.approvals');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('workflowTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t('workflowHint')}</p>
      </CardContent>
    </Card>
  );
}
