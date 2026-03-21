'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/features/projects/api/tasksApi';
import { useToast } from '@/shared/hooks/use-toast';
import type {
  TaskCreateInput,
  TaskUpdateInput,
  TaskReorderInput,
} from '@/features/projects/types/task.types';

export function useTaskMutations(projectId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const invalidateTasks = () => {
    void qc.invalidateQueries({ queryKey: ['tasks', projectId] });
  };

  const createTask = useMutation({
    mutationFn: (input: TaskCreateInput) => tasksApi.create(projectId, input),
    onSuccess: () => {
      invalidateTasks();
      toast({ title: 'Задача создана' });
    },
    onError: (e: Error) => {
      toast({ title: 'Ошибка', description: e.message, variant: 'destructive' });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: TaskUpdateInput }) =>
      tasksApi.update(projectId, taskId, input),
    onSuccess: () => {
      invalidateTasks();
    },
    onError: (e: Error) => {
      toast({ title: 'Ошибка', description: e.message, variant: 'destructive' });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(projectId, taskId),
    onSuccess: () => {
      invalidateTasks();
      toast({ title: 'Задача удалена' });
    },
    onError: (e: Error) => {
      toast({ title: 'Ошибка', description: e.message, variant: 'destructive' });
    },
  });

  const reorderTasks = useMutation({
    mutationFn: (items: TaskReorderInput[]) => tasksApi.reorder(projectId, items),
    onSuccess: () => {
      invalidateTasks();
    },
  });

  const createSubtask = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      tasksApi.createSubtask(projectId, taskId, title),
    onSuccess: (_, { taskId }) => {
      void qc.invalidateQueries({ queryKey: ['tasks', projectId, taskId, 'subtasks'] });
      invalidateTasks();
    },
  });

  const updateSubtask = useMutation({
    mutationFn: ({
      taskId,
      subId,
      patch,
    }: {
      taskId: string;
      subId: string;
      patch: { title?: string; isCompleted?: boolean };
    }) => tasksApi.updateSubtask(projectId, taskId, subId, patch),
    onSuccess: (_, { taskId }) => {
      void qc.invalidateQueries({ queryKey: ['tasks', projectId, taskId, 'subtasks'] });
      invalidateTasks();
    },
  });

  const createComment = useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      tasksApi.createComment(projectId, taskId, content),
    onSuccess: (_, { taskId }) => {
      void qc.invalidateQueries({ queryKey: ['tasks', projectId, taskId, 'comments'] });
      invalidateTasks();
    },
  });

  return {
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    createSubtask,
    updateSubtask,
    createComment,
  };
}
