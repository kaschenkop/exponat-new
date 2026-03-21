'use client';

import type { Project } from '@/features/projects/types/project.types';
import { formatCurrencyRub, statusBadgeClass } from '@/features/projects/utils/projectHelpers';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectCard({ project }: { project: Project }): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-tight">{project.name}</h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(project.status)}`}
            >
              {t(`status.${project.status}`)}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description || '—'}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {project.startDate} — {project.endDate}
            </span>
            <span className="tabular-nums">{formatCurrencyRub(project.totalBudget)}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('card.progress')}</span>
              <span>{project.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
