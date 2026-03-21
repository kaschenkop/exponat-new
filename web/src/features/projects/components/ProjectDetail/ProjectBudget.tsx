'use client';

import type { Project } from '@/features/projects/types/project.types';
import { formatCurrencyRub } from '@/features/projects/utils/projectHelpers';
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
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('detail.budgetTotal')}</span>
          <span className="tabular-nums font-medium">
            {formatCurrencyRub(project.totalBudget)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('detail.budgetSpent')}</span>
          <span className="tabular-nums font-medium">
            {formatCurrencyRub(project.spentBudget)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{t('detail.budgetHint', { pct })}</p>
      </CardContent>
    </Card>
  );
}
