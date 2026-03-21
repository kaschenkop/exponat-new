'use client';

import type { Project } from '@/features/projects/types/project.types';
import { statusBadgeClass } from '@/features/projects/utils/projectHelpers';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

export function ProjectHeader({
  project,
}: {
  project: Project;
}): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('detail.eyebrow')}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight">{project.name}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(project.status)}`}
          >
            {t(`status.${project.status}`)}
          </span>
        </div>
        <p className="max-w-3xl text-muted-foreground">{project.description || '—'}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/projects">{t('detail.back')}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/dashboard/projects/${project.id}/edit`}>{t('detail.edit')}</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/projects/kanban">{t('detail.kanban')}</Link>
        </Button>
      </div>
    </div>
  );
}
