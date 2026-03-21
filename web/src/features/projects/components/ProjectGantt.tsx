'use client';

import type { ProjectPhase } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';

function barStyle(
  projectStart: string,
  projectEnd: string,
  phaseStart: string,
  phaseEnd: string,
): { left: string; width: string } {
  const ps = parseISO(projectStart);
  const pe = parseISO(projectEnd);
  const a = parseISO(phaseStart);
  const b = parseISO(phaseEnd);
  const total = Math.max(1, differenceInCalendarDays(pe, ps));
  const startOff = Math.max(0, differenceInCalendarDays(a, ps));
  const len = Math.max(1, differenceInCalendarDays(b, a));
  const left = (startOff / total) * 100;
  const width = Math.min(100 - left, (len / total) * 100);
  return { left: `${left}%`, width: `${width}%` };
}

export function ProjectGantt({
  phases,
  projectStart,
  projectEnd,
}: {
  phases: ProjectPhase[];
  projectStart: string;
  projectEnd: string;
}): React.ReactElement {
  const t = useTranslations('projects');

  if (!phases.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('gantt.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t('gantt.empty')}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('gantt.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {projectStart} — {projectEnd}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-8 w-full rounded-md bg-muted">
          {phases.map((ph) => {
            const { left, width } = barStyle(projectStart, projectEnd, ph.startDate, ph.endDate);
            return (
              <div
                key={ph.id}
                className="absolute top-1 h-6 rounded bg-primary/80"
                style={{ left, width }}
                title={ph.name}
              />
            );
          })}
        </div>
        <div className="space-y-2">
          {phases.map((ph) => (
            <div key={ph.id} className="flex items-center gap-3 text-sm">
              <div className="min-w-[140px] font-medium">{ph.name}</div>
              <div className="relative h-6 flex-1 rounded bg-muted">
                <div
                  className="absolute top-0 h-6 rounded bg-primary/70"
                  style={{
                    ...barStyle(projectStart, projectEnd, ph.startDate, ph.endDate),
                    position: 'absolute',
                  }}
                />
              </div>
              <div className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                {ph.startDate} — {ph.endDate}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
