'use client';

import { projectsApi } from '@/features/projects/api/projectsApi';
import { useProjectStore } from '@/features/projects/store/projectStore';
import type { ProjectListResponse } from '@/features/projects/types/project.types';
import { useQuery } from '@tanstack/react-query';

export function useProjects(): ReturnType<
  typeof useQuery<ProjectListResponse, Error>
> {
  const filters = useProjectStore((s) => s.filters);
  return useQuery({
    queryKey: ['projects', 'list', filters],
    queryFn: () => projectsApi.list(filters),
  });
}
