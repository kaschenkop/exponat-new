'use client';

import type { Project } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectInfo({ project }: { project: Project }): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.infoTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">{t('form.type')}</p>
          <p className="font-medium">{t(`type.${project.type}`)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('detail.dates')}</p>
          <p className="font-medium">
            {project.startDate} — {project.endDate}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('detail.location')}</p>
          <p className="font-medium">
            {project.location.venue}, {project.location.city}
          </p>
          <p className="text-sm text-muted-foreground">{project.location.address}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('detail.metrics')}</p>
          <p className="font-medium">
            {t('detail.exhibits')}: {project.exhibitsCount} · {t('detail.participants')}:{' '}
            {project.participantsCount}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
