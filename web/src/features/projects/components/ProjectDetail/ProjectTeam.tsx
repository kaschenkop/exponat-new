'use client';

import type { ProjectTeamMember } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectTeam({
  members,
}: {
  members: ProjectTeamMember[] | null | undefined;
}): React.ReactElement {
  const t = useTranslations('projects');
  const list = members ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.team')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {list.map((m) => (
            <li key={m.userId} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium">{m.userName}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(m.joinedAt).toLocaleDateString()}
              </span>
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
