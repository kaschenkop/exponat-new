'use client';

import type { ProjectTeamMember } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

export function ProjectTeam({ team }: { team: ProjectTeamMember[] }): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.teamTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {team.map((m) => (
          <div
            key={`${m.userId}-${m.role}`}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
          >
            <div>
              <p className="font-medium">{m.userName}</p>
              <p className="text-xs text-muted-foreground">{t(`role.${m.role}`)}</p>
            </div>
          </div>
        ))}
        {!team.length && (
          <p className="text-sm text-muted-foreground">{t('detail.teamEmpty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
