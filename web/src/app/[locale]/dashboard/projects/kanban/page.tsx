'use client';

import { ProjectKanban } from '@/features/projects/components/ProjectKanban';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

export default function ProjectsKanbanPage(): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <ProjectsShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{t('kanban.title')}</h1>
            <p className="mt-1 text-muted-foreground">{t('kanban.subtitle')}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/projects">{t('detail.back')}</Link>
          </Button>
        </div>
        <ProjectKanban />
      </div>
    </ProjectsShell>
  );
}
