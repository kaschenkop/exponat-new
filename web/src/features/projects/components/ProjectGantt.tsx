'use client';

import type { ProjectPhase } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

function parse(d: string): number {
  return new Date(d).getTime();
}

export function ProjectGantt({ phases }: { phases: ProjectPhase[] | null | undefined }): React.ReactElement {
  const t = useTranslations('projects');
  const list = phases ?? [];

  const range = useMemo(() => {
    if (!list.length) {
      return { min: 0, max: 1 };
    }
    const first = list[0];
    if (!first) {
      return { min: 0, max: 1 };
    }
    let min = parse(first.startDate);
    let max = parse(first.endDate);
    for (const p of list) {
      min = Math.min(min, parse(p.startDate));
      max = Math.max(max, parse(p.endDate));
    }
    return { min, max: Math.max(max, min + 86400000) };
  }, [list]);

  const span = range.max - range.min || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.gantt')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.map((ph) => {
          const left = ((parse(ph.startDate) - range.min) / span) * 100;
          const width =
            ((parse(ph.endDate) - parse(ph.startDate)) / span) * 100 || 2;
          return (
            <div key={ph.id} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{ph.name}</span>
                <span>
                  {ph.startDate} — {ph.endDate}
                </span>
              </div>
              <div className="relative h-6 w-full rounded-md bg-muted">
                <div
                  className="absolute top-1 h-4 rounded bg-primary/80"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 1)}%`,
                  }}
                  title={ph.name}
                />
              </div>
            </div>
          );
        })}
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
