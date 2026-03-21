'use client';

import { projectsApi } from '@/features/projects/api/projectsApi';
import type { Project } from '@/features/projects/types/project.types';
import { useQuery } from '@tanstack/react-query';

export function useProject(
  id: string | undefined,
): ReturnType<typeof useQuery<Project, Error>> {
  return useQuery({
    queryKey: ['projects', 'detail', id],
    queryFn: () => projectsApi.get(id as string),
    enabled: Boolean(id),
  });
}
