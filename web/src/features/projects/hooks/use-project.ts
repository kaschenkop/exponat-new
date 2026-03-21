'use client';

import { fetchProjectById } from '@/features/projects/api/projectsApi';
import type { ProjectType } from '@/features/projects/types/project.types';
import { useQuery } from '@tanstack/react-query';

export function useProjectQuery(id: string | null): ReturnType<
  typeof useQuery<ProjectType | null>
> {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => (id ? fetchProjectById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}
