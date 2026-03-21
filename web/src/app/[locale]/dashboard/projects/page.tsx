'use client';

import { ProjectFilters } from '@/features/projects/components/ProjectFilters';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Button } from '@/shared/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function ProjectsPage(): React.ReactElement {
  const t = useTranslations('projects');
  const { data, isPending, isError, refetch } = useProjects();

  return (
    <ProjectsShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{t('title')}</h1>
            <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/projects/kanban">{t('kanbanLink')}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/projects/new">{t('new')}</Link>
            </Button>
          </div>
        </div>

        <ProjectFilters />

        {isPending && <p className="text-sm text-muted-foreground">{t('loading')}</p>}
        {isError && (
          <div className="rounded-md border border-destructive/40 p-4 text-sm">
            {t('error')}{' '}
            <button type="button" className="underline" onClick={() => refetch()}>
              {t('retry')}
            </button>
          </div>
        )}
        {data && <ProjectList projects={data.items} />}
      </div>
    </ProjectsShell>
  );
}
