'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useTaskMutations } from '@/features/projects/hooks/useTaskMutations';
import type { TaskStatus, TaskPriority, TaskCreateInput } from '@/features/projects/types/task.types';
import { Button } from '@/shared/ui/button';

interface TaskCreateDialogProps {
  projectId: string
  defaultStatus?: TaskStatus
  onClose: () => void
}

export function TaskCreateDialog({
  projectId,
  defaultStatus = 'backlog',
  onClose,
}: TaskCreateDialogProps): React.ReactElement {
  const t = useTranslations('tasks');
  const tc = useTranslations('common');
  const { createTask } = useTaskMutations(projectId);
  const [form, setForm] = React.useState<TaskCreateInput>({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    groupName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    createTask.mutate(form, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('addTask')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('list.columns.title')}
            </label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E0E0E0' }}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('detail.description')}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E0E0E0' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('detail.status')}
              </label>
              <select
                value={form.status ?? 'backlog'}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#E0E0E0' }}
              >
                <option value="backlog">{t('status.backlog')}</option>
                <option value="in_progress">{t('status.in_progress')}</option>
                <option value="review">{t('status.review')}</option>
                <option value="done">{t('status.done')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('detail.priority')}
              </label>
              <select
                value={form.priority ?? 'medium'}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#E0E0E0' }}
              >
                <option value="high">{t('priority.high')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="low">{t('priority.low')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('detail.group')}
            </label>
            <input
              value={form.groupName ?? ''}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E0E0E0' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('detail.startDate')}
              </label>
              <input
                type="date"
                value={form.startDate ?? ''}
                onChange={(e) => setForm({ ...form, startDate: e.target.value || undefined })}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#E0E0E0' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('detail.dueDate')}
              </label>
              <input
                type="date"
                value={form.dueDate ?? ''}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value || undefined })}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#E0E0E0' }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {tc('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!form.title.trim() || createTask.isPending}
              style={{ backgroundColor: '#1A73E8' }}
            >
              {t('addTask')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
