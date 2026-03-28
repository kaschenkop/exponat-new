'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function OneCSettings({ baseUrl }: { baseUrl: string }): React.ReactElement {
  const t = useTranslations('budget.integration');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('settings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t('baseUrl')}:{' '}
          <span className="break-all font-mono text-foreground">{baseUrl || '—'}</span>
        </p>
      </CardContent>
    </Card>
  );
}
