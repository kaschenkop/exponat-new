'use client';

import { Link } from '@/i18n/navigation';
import { formatBudget } from '@/features/projects/utils/projectHelpers';
import type { Project } from '@/features/projects/types/project.types';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectCard({ project }: { project: Project }): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="font-semibold leading-tight text-foreground hover:underline"
          >
            {project.name}
          </Link>
          <Badge variant="secondary" className="shrink-0">
            {t(`status.${project.status}`)}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description || '—'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>
            {project.startDate} — {project.endDate}
          </span>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{t('progress')}</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>
            {t('budget')}:{' '}
            {formatBudget(project.totalBudget, project.currency)}
          </span>
          {project.managerName ? (
            <span>
              {t('manager')}: {project.managerName}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
