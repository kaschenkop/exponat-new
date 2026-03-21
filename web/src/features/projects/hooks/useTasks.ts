'use client';

import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/features/projects/api/tasksApi';
import type { TaskFilters } from '@/features/projects/types/task.types';

export function useTasks(projectId: string, filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => tasksApi.list(projectId, filters),
    enabled: Boolean(projectId),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });
}

export function useTask(projectId: string, taskId: string) {
  return useQuery({
    queryKey: ['tasks', projectId, taskId],
    queryFn: () => tasksApi.getById(projectId, taskId),
    enabled: Boolean(projectId) && Boolean(taskId),
  });
}

export function useSubtasks(projectId: string, taskId: string) {
  return useQuery({
    queryKey: ['tasks', projectId, taskId, 'subtasks'],
    queryFn: () => tasksApi.listSubtasks(projectId, taskId),
    enabled: Boolean(projectId) && Boolean(taskId),
  });
}

export function useTaskComments(projectId: string, taskId: string) {
  return useQuery({
    queryKey: ['tasks', projectId, taskId, 'comments'],
    queryFn: () => tasksApi.listComments(projectId, taskId),
    enabled: Boolean(projectId) && Boolean(taskId),
  });
}
