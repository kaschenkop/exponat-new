'use client';

import { useParams } from 'next/navigation';
import {
  useProject,
  useProjectActivity,
  useProjectPhases,
} from '@/features/projects/hooks/useProjects';
import { useProjectCollaboration } from '@/features/projects/hooks/useProjectCollaboration';
import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';
import { ProjectNavTabs } from '@/features/projects/components/ProjectDetail/ProjectNavTabs';
import { ProjectInfo } from '@/features/projects/components/ProjectDetail/ProjectInfo';
import { ProjectTimeline } from '@/features/projects/components/ProjectDetail/ProjectTimeline';
import { ProjectTeam } from '@/features/projects/components/ProjectDetail/ProjectTeam';
import { ProjectBudget } from '@/features/projects/components/ProjectDetail/ProjectBudget';
import { ProjectFiles } from '@/features/projects/components/ProjectDetail/ProjectFiles';
import { ProjectActivity } from '@/features/projects/components/ProjectDetail/ProjectActivity';
import { ProjectGantt } from '@/features/projects/components/ProjectGantt';
import { ProjectDeleteDialog } from '@/features/projects/components/ProjectDeleteDialog';
import { Skeleton } from '@/shared/ui/skeleton';
import { useRouter } from '@/i18n/navigation';
import * as React from 'react';

export default function ProjectDetailPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  const router = useRouter();
  const { data: project, isLoading, isError, error } = useProject(id);
  const { data: phasesData } = useProjectPhases(id);
  const { data: activityData } = useProjectActivity(id);
  const phases = phasesData ?? [];
  const activity = activityData ?? [];
  const { deleteProject } = useProjectMutations();
  const [delOpen, setDelOpen] = React.useState(false);

  useProjectCollaboration(id);

  const onDelete = async () => {
    await deleteProject.mutateAsync(id);
    setDelOpen(false);
    router.push('/dashboard/projects');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
        {error?.message ?? 'Not found'}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <ProjectNavTabs
        project={project}
        activeTab="overview"
        onDeleteClick={() => setDelOpen(true)}
      />

      <div className="space-y-8 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ProjectInfo project={project} />
            <ProjectTimeline phases={phases} />
            <ProjectGantt phases={phases} />
          </div>
          <div className="space-y-6">
            <ProjectBudget project={project} />
            <ProjectTeam members={project.team ?? []} />
            <ProjectFiles />
            <ProjectActivity changes={activity} />
          </div>
        </div>
      </div>

      <ProjectDeleteDialog
        open={delOpen}
        onOpenChange={setDelOpen}
        onConfirm={onDelete}
        pending={deleteProject.isPending}
      />
    </div>
  );
}
