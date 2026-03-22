'use client';

import type { ProjectPhase } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectTimeline({
  phases,
}: {
  phases: ProjectPhase[] | null | undefined;
}): React.ReactElement {
  const t = useTranslations('projects');
  const list = phases ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.timeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {list.map((ph) => (
            <li key={ph.id} className="relative">
              <span className="absolute -left-[25px] mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <span className="text-sm font-medium">{ph.name}</span>
              <p className="text-xs text-muted-foreground">
                {ph.startDate} — {ph.endDate} · {ph.status} · {ph.progress}%
              </p>
              {ph.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{ph.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
