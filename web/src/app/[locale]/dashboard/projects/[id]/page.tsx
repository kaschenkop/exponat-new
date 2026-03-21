'use client';

import { ProjectActivity } from '@/features/projects/components/ProjectDetail/ProjectActivity';
import { ProjectBudget } from '@/features/projects/components/ProjectDetail/ProjectBudget';
import { ProjectFiles } from '@/features/projects/components/ProjectDetail/ProjectFiles';
import { ProjectHeader } from '@/features/projects/components/ProjectDetail/ProjectHeader';
import { ProjectInfo } from '@/features/projects/components/ProjectDetail/ProjectInfo';
import { ProjectTeam } from '@/features/projects/components/ProjectDetail/ProjectTeam';
import { ProjectTimeline } from '@/features/projects/components/ProjectDetail/ProjectTimeline';
import { ProjectGantt } from '@/features/projects/components/ProjectGantt';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { useProject } from '@/features/projects/hooks/useProject';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function ProjectDetailPage(): React.ReactElement {
  const t = useTranslations('projects');
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data, isPending, isError, refetch } = useProject(id);

  return (
    <ProjectsShell>
      <div className="mx-auto max-w-6xl space-y-8">
        {isPending && <p className="text-muted-foreground">{t('loading')}</p>}
        {isError && (
          <div className="rounded-md border border-destructive/40 p-4 text-sm">
            {t('error')}{' '}
            <button type="button" className="underline" onClick={() => refetch()}>
              {t('retry')}
            </button>
          </div>
        )}
        {data && (
          <>
            <ProjectHeader project={data} />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <ProjectInfo project={data} />
                <ProjectTimeline phases={data.phases ?? []} />
                <ProjectGantt
                  phases={data.phases ?? []}
                  projectStart={data.startDate}
                  projectEnd={data.endDate}
                />
                <ProjectActivity activity={data.activity ?? []} />
              </div>
              <div className="space-y-6">
                <ProjectBudget project={data} />
                <ProjectTeam team={data.team} />
                <ProjectFiles files={data.files ?? []} />
              </div>
            </div>
          </>
        )}
      </div>
    </ProjectsShell>
  );
}
