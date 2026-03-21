'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/features/projects/api/tasksApi';

export function useMilestones(projectId: string) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => tasksApi.listMilestones(projectId),
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });
}

export function useMilestoneMutations(projectId: string) {
  const qc = useQueryClient();

  const createMilestone = useMutation({
    mutationFn: (input: { title: string; date: string; description?: string }) =>
      tasksApi.createMilestone(projectId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: (msId: string) => tasksApi.deleteMilestone(projectId, msId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });

  return { createMilestone, deleteMilestone };
}
