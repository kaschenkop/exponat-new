'use client';

import type { Project } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectInfo({ project }: { project: Project }): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.info')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">{t('fields.type')}</p>
          <p className="font-medium">{t(`type.${project.type}`)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t('fields.startDate')}</p>
          <p className="font-medium">
            {project.startDate} — {project.endDate}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-muted-foreground">{t('fields.description')}</p>
          <p className="mt-1 whitespace-pre-wrap">{project.description || '—'}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-muted-foreground">{t('fields.address')}</p>
          <p className="font-medium">
            {project.location.venue}, {project.location.address},{' '}
            {project.location.city}, {project.location.country}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">{t('fields.manager')}</p>
          <p className="font-medium">{project.managerName ?? project.managerId}</p>
        </div>
      </CardContent>
    </Card>
  );
}
