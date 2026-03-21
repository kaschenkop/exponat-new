'use client';

import type { ProjectFile } from '@/features/projects/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ProjectFiles({ files }: { files: ProjectFile[] }): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.filesTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {files.map((f) => (
          <a
            key={f.id}
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
          >
            <span className="truncate font-medium">{f.name}</span>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
          </a>
        ))}
        {!files.length && (
          <p className="text-sm text-muted-foreground">{t('detail.filesEmpty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
