'use client';

import type { ProjectChange } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectActivity({
  changes,
}: {
  changes: ProjectChange[] | null | undefined;
}): React.ReactElement {
  const t = useTranslations('projects');
  const list = changes ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.activity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {list.map((c) => (
            <li key={c.id} className="border-b border-border pb-3 last:border-0">
              <p className="font-medium">{c.changeType}</p>
              <p className="text-xs text-muted-foreground">
                {c.userName ?? c.userId} · {new Date(c.createdAt).toLocaleString()}
              </p>
              {c.fieldName ? (
                <p className="mt-1 text-muted-foreground">
                  {c.fieldName}: {c.oldValue} → {c.newValue}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
