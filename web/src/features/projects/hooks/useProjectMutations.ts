'use client';

import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { projectsApi } from '@/features/projects/api/projectsApi';
import { useToast } from '@/shared/hooks/use-toast';
import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from '@/features/projects/types/project.types';

async function optimisticSet(
  qc: QueryClient,
  id: string,
  updater: (p: Project) => Project,
) {
  await qc.cancelQueries({ queryKey: ['projects', id] });
  const prev = qc.getQueryData<Project>(['projects', id]);
  if (prev) {
    qc.setQueryData<Project>(['projects', id], updater(prev));
  }
  return prev;
}

export function useProjectMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const createProject = useMutation({
    mutationFn: (input: ProjectCreateInput) => projectsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Проект создан' });
    },
    onError: (e: Error) => {
      toast({
        title: 'Ошибка',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectUpdateInput }) =>
      projectsApi.update(id, input),
    onMutate: async ({ id, input }) => {
      const prev = await optimisticSet(qc, id, (p) => ({
        ...p,
        ...input,
        location: input.location ?? p.location,
      }));
      return { prev };
    },
    onError: (e: Error, { id }, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['projects', id], ctx.prev);
      }
      toast({
        title: 'Ошибка',
        description: e.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['projects', id] });
      toast({ title: 'Сохранено' });
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Проект удалён' });
    },
    onError: (e: Error) => {
      toast({
        title: 'Ошибка',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const updatePhase = useMutation({
    mutationFn: ({
      projectId,
      phaseId,
      patch,
    }: {
      projectId: string;
      phaseId: string;
      patch: Parameters<typeof projectsApi.updatePhase>[2];
    }) => projectsApi.updatePhase(projectId, phaseId, patch),
    onSuccess: (_, { projectId }) => {
      void qc.invalidateQueries({ queryKey: ['projects', projectId, 'phases'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Project['status'] }) =>
      projectsApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      const prev = await optimisticSet(qc, id, (p) => ({ ...p, status }));
      return { prev };
    },
    onError: (e: Error, { id }, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['projects', id], ctx.prev);
      }
      toast({
        title: 'Ошибка',
        description: e.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['projects', id] });
    },
  });

  return {
    createProject,
    updateProject,
    deleteProject,
    updatePhase,
    updateStatus,
  };
}
