'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectFiles(): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.files')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t('detail.filesPlaceholder')}</p>
      </CardContent>
    </Card>
  );
}
