import type { ProjectType } from '@/features/projects/types/project.types';

export function sortProjectsByUpdatedAt(
  projects: ProjectType[],
): ProjectType[] {
  return [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
