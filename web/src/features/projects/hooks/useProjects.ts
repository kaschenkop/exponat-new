'use client';

import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/features/projects/api/projectsApi';
import type { ProjectFilters } from '@/features/projects/types/project.types';

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.list(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useProjectPhases(id: string) {
  return useQuery({
    queryKey: ['projects', id, 'phases'],
    queryFn: () => projectsApi.getPhases(id),
    enabled: Boolean(id),
  });
}

export function useProjectActivity(id: string) {
  return useQuery({
    queryKey: ['projects', id, 'activity'],
    queryFn: () => projectsApi.getActivity(id, 50),
    enabled: Boolean(id),
  });
}
