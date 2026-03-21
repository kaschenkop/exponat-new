'use client';

import type { ProjectActivityItem } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

export function ProjectActivity({
  activity,
}: {
  activity: ProjectActivityItem[];
}): React.ReactElement {
  const t = useTranslations('projects');
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.activityTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activity.map((a) => (
          <div key={a.id} className="flex gap-3 text-sm">
            <div className="min-w-0 flex-1">
              <p>
                <span className="font-medium">{a.userName}</span>{' '}
                <span className="text-muted-foreground">{a.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(a.timestamp), 'd MMM yyyy, HH:mm', {
                  locale: locale === 'ru' ? ru : undefined,
                })}
              </p>
            </div>
          </div>
        ))}
        {!activity.length && (
          <p className="text-sm text-muted-foreground">{t('detail.activityEmpty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
