'use client';

import { useTranslations } from 'next-intl';
import type { Task, TaskStatus } from '@/features/projects/types/task.types';
import { TASK_PRIORITY_COLORS, TASK_STATUS_COLORS } from '@/features/projects/types/task.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export function TaskList({ tasks, onTaskClick, onStatusChange }: TaskListProps): React.ReactElement {
  const t = useTranslations('tasks');

  return (
    <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="rounded-lg border bg-white" style={{ borderColor: '#E0E0E0' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">{t('list.columns.key')}</TableHead>
              <TableHead>{t('list.columns.title')}</TableHead>
              <TableHead className="w-32">{t('list.columns.status')}</TableHead>
              <TableHead className="w-28">{t('list.columns.priority')}</TableHead>
              <TableHead className="w-32">{t('list.columns.assignee')}</TableHead>
              <TableHead className="w-28">{t('list.columns.dueDate')}</TableHead>
              <TableHead className="w-24">{t('list.columns.progress')}</TableHead>
              <TableHead>{t('list.columns.tags')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-gray-500">
                  {t('empty')}
                </TableCell>
              </TableRow>
            )}
            {tasks.map((task) => {
              const tags = Array.isArray(task.tags) ? task.tags : [];
              return (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onTaskClick(task.id)}
                >
                  <TableCell className="text-xs font-medium text-gray-500">
                    {task.taskKey}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <select
                      value={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(task.id, e.target.value as TaskStatus);
                      }}
                      className="rounded-md border-0 bg-transparent px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      style={{ color: TASK_STATUS_COLORS[task.status] }}
                    >
                      <option value="backlog">{t('status.backlog')}</option>
                      <option value="in_progress">{t('status.in_progress')}</option>
                      <option value="review">{t('status.review')}</option>
                      <option value="done">{t('status.done')}</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: TASK_PRIORITY_COLORS[task.priority] }}
                      />
                      <span className="text-xs">{t(`priority.${task.priority}`)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.assigneeName && (
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                          style={{ backgroundColor: '#1A73E8' }}
                        >
                          {task.assigneeName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate text-xs">{task.assigneeName}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {task.dueDate ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${task.progress}%`,
                            backgroundColor: '#1A73E8',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="rounded px-1.5 py-0.5 text-xs"
                          style={{
                            backgroundColor: `${tag.color}15`,
                            color: tag.color,
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                      {tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{tags.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
