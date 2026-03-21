'use client';

import { fetchProjects } from '@/features/projects/api/projectsApi';
import type { ProjectType } from '@/features/projects/types/project.types';
import { useQuery } from '@tanstack/react-query';

export function useProjectsQuery(): ReturnType<typeof useQuery<ProjectType[]>> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
}
