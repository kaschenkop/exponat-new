'use client';

import { ProjectCard } from '@/features/projects/components/ProjectCard';
import type { Project } from '@/features/projects/types/project.types';
import { useTranslations } from 'next-intl';

export function ProjectList({
  projects,
}: {
  projects: Project[];
}): React.ReactElement {
  const t = useTranslations('projects');

  if (!projects.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        {t('list.empty')}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
