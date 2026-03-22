'use client';

import type { Project } from '@/features/projects/types/project.types';
import { formatBudget } from '@/features/projects/utils/projectHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectBudget({ project }: { project: Project }): React.ReactElement {
  const t = useTranslations('projects');
  const pct =
    project.totalBudget > 0
      ? Math.min(100, Math.round((project.spentBudget / project.totalBudget) * 100))
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.budgetTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('budget')}</span>
          <span className="font-medium">{formatBudget(project.totalBudget, project.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('detail.spent')}</span>
          <span className="font-medium">{formatBudget(project.spentBudget, project.currency)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
