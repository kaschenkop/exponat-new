import type { ProjectType } from '@/features/projects/types/project.types';
import { ProjectCard } from '@/features/projects/components/ProjectCard';

export function ProjectList({
  projects,
}: {
  projects: ProjectType[];
}): React.ReactElement {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
