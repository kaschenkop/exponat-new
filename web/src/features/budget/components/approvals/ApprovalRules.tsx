'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ApprovalRules(): React.ReactElement {
  const t = useTranslations('budget.approvals');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('rulesTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t('rulesHint')}</p>
      </CardContent>
    </Card>
  );
}
