'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function OneCMapping({ count }: { count: number }): React.ReactElement {
  const t = useTranslations('budget.integration');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('mapping')}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {t('mappingCount', { count })}
      </CardContent>
    </Card>
  );
}
