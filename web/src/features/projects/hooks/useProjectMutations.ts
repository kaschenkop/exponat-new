'use client';

import { projectsApi } from '@/features/projects/api/projectsApi';
import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from '@/features/projects/types/project.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useProjectMutations(): {
  create: ReturnType<typeof useMutation<Project, Error, ProjectCreateInput>>;
  update: ReturnType<
    typeof useMutation<Project, Error, { id: string; body: ProjectUpdateInput }>
  >;
  remove: ReturnType<typeof useMutation<void, Error, string>>;
  patchStatus: ReturnType<
    typeof useMutation<
      Project,
      Error,
      { id: string; status: string; kanbanPosition?: number }
    >
  >;
} {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: ProjectCreateInput) => projectsApi.create(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProjectUpdateInput }) =>
      projectsApi.update(id, body),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['projects'] });
      await qc.invalidateQueries({ queryKey: ['projects', 'detail', vars.id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const patchStatus = useMutation<
    Project,
    Error,
    { id: string; status: string; kanbanPosition?: number }
  >({
    mutationFn: (vars: { id: string; status: string; kanbanPosition?: number }) =>
      projectsApi.patchStatus(vars.id, vars.status, vars.kanbanPosition),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['projects'] });
      await qc.invalidateQueries({ queryKey: ['projects', 'detail', vars.id] });
    },
  });

  return { create, update, remove, patchStatus };
}
