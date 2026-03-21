'use client';

import * as React from 'react';
import { X, CheckSquare, Send, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTask, useSubtasks, useTaskComments } from '@/features/projects/hooks/useTasks';
import { useTaskMutations } from '@/features/projects/hooks/useTaskMutations';
import type { TaskStatus, TaskPriority } from '@/features/projects/types/task.types';
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from '@/features/projects/types/task.types';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

interface TaskDetailProps {
  projectId: string
  taskId: string
  onClose: () => void
}

export function TaskDetail({ projectId, taskId, onClose }: TaskDetailProps): React.ReactElement {
  const t = useTranslations('tasks');
  const { data: task, isLoading } = useTask(projectId, taskId);
  const { data: subtasks } = useSubtasks(projectId, taskId);
  const { data: comments } = useTaskComments(projectId, taskId);
  const { updateTask, createSubtask, updateSubtask, createComment, deleteTask } =
    useTaskMutations(projectId);

  const [newSubtask, setNewSubtask] = React.useState('');
  const [newComment, setNewComment] = React.useState('');

  const handleAddSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    createSubtask.mutate({ taskId, title });
    setNewSubtask('');
  };

  const handleAddComment = () => {
    const content = newComment.trim();
    if (!content) return;
    createComment.mutate({ taskId, content });
    setNewComment('');
  };

  const handleDelete = () => {
    deleteTask.mutate(taskId);
    onClose();
  };

  if (isLoading || !task) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l bg-white shadow-xl" style={{ borderColor: '#E0E0E0' }}>
        <div className="p-6">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  const tags = Array.isArray(task.tags) ? task.tags : [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-white shadow-xl" style={{ borderColor: '#E0E0E0' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: '#E0E0E0' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">{task.taskKey}</span>
          <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Meta fields */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-gray-500">{t('detail.status')}</span>
            <div className="mt-1">
              <select
                value={task.status}
                onChange={(e) =>
                  updateTask.mutate({
                    taskId,
                    input: { status: e.target.value as TaskStatus },
                  })
                }
                className="w-full rounded-md border px-2 py-1.5 text-sm font-medium"
                style={{
                  borderColor: TASK_STATUS_COLORS[task.status],
                  color: TASK_STATUS_COLORS[task.status],
                }}
              >
                <option value="backlog">{t('status.backlog')}</option>
                <option value="in_progress">{t('status.in_progress')}</option>
                <option value="review">{t('status.review')}</option>
                <option value="done">{t('status.done')}</option>
              </select>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">{t('detail.priority')}</span>
            <div className="mt-1">
              <select
                value={task.priority}
                onChange={(e) =>
                  updateTask.mutate({
                    taskId,
                    input: { priority: e.target.value as TaskPriority },
                  })
                }
                className="w-full rounded-md border px-2 py-1.5 text-sm"
                style={{
                  borderColor: '#E0E0E0',
                  color: TASK_PRIORITY_COLORS[task.priority],
                }}
              >
                <option value="high">{t('priority.high')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="low">{t('priority.low')}</option>
              </select>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">{t('detail.assignee')}</span>
            <p className="mt-1 text-sm text-gray-900">{task.assigneeName || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">{t('detail.group')}</span>
            <p className="mt-1 text-sm text-gray-900">{task.groupName || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">{t('detail.startDate')}</span>
            <p className="mt-1 text-sm text-gray-900">{task.startDate ?? '—'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">{t('detail.dueDate')}</span>
            <p className="mt-1 text-sm text-gray-900">{task.dueDate ?? '—'}</p>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-gray-500">{t('detail.progress')}</span>
            <div className="mt-1 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${task.progress}%`, backgroundColor: '#1A73E8' }}
                />
              </div>
              <span className="text-sm font-medium">{task.progress}%</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div className="mb-6">
            <span className="text-xs font-semibold text-gray-500">{t('detail.description')}</span>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Subtasks */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <CheckSquare size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">{t('detail.subtasks')}</span>
            {subtasks && subtasks.length > 0 && (
              <span className="text-xs text-gray-500">
                {subtasks.filter((s) => s.isCompleted).length}/{subtasks.length}
              </span>
            )}
          </div>

          {(!subtasks || subtasks.length === 0) && (
            <p className="mb-2 text-xs text-gray-400">{t('detail.noSubtasks')}</p>
          )}

          <div className="space-y-2">
            {subtasks?.map((sub) => (
              <label
                key={sub.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={sub.isCompleted}
                  onChange={(e) =>
                    updateSubtask.mutate({
                      taskId,
                      subId: sub.id,
                      patch: { isCompleted: e.target.checked },
                    })
                  }
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className={sub.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}>
                  {sub.title}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder={t('detail.addSubtask')}
              className="flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E0E0E0' }}
            />
            <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
              +
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">{t('detail.comments')}</span>
          </div>

          {(!comments || comments.length === 0) && (
            <p className="mb-2 text-xs text-gray-400">{t('detail.noComments')}</p>
          )}

          <div className="mb-3 space-y-3">
            {comments?.map((c) => (
              <div key={c.id} className="rounded-md bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{c.userName || c.userId.slice(0, 8)}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder={t('detail.addComment')}
              className="flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E0E0E0' }}
            />
            <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t px-6 py-3"
        style={{ borderColor: '#E0E0E0' }}
      >
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          {t('deleteTask')}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X size={14} className="mr-1" />
        </Button>
      </div>
    </div>
  );
}
