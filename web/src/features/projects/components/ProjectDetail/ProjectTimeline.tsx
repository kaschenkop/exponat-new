'use client';

import type { ProjectPhase } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectTimeline({ phases }: { phases: ProjectPhase[] }): React.ReactElement {
  const t = useTranslations('projects');

  if (!phases.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('detail.timelineTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t('detail.timelineEmpty')}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.timelineTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phases.map((ph) => (
          <div
            key={ph.id}
            className="relative border-l-2 border-primary/30 pl-4 pb-2 last:pb-0"
          >
            <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
            <p className="font-medium">{ph.name}</p>
            <p className="text-sm text-muted-foreground">
              {ph.startDate} — {ph.endDate} · {t(`phaseStatus.${ph.status}`)}
            </p>
            <p className="text-sm">{ph.description}</p>
            <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${ph.progress}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
