import type { ProjectType } from '@/features/projects/types/project.types';

const MOCK_PROJECTS: ProjectType[] = [];

export async function fetchProjects(): Promise<ProjectType[]> {
  return Promise.resolve(MOCK_PROJECTS);
}

export async function fetchProjectById(id: string): Promise<ProjectType | null> {
  const project = MOCK_PROJECTS.find((p) => p.id === id);
  return Promise.resolve(project ?? null);
}
