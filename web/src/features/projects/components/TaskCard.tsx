'use client';

import { Calendar, MessageCircle, CheckSquare, GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Task } from '@/features/projects/types/task.types';
import { TASK_PRIORITY_COLORS } from '@/features/projects/types/task.types';
import { cn } from '@/shared/lib/utils';

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps): React.ReactElement {
  const t = useTranslations('tasks');
  const isDone = task.status === 'done';
  const tags = Array.isArray(task.tags) ? task.tags : [];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'group relative rounded-lg bg-white p-4 transition-shadow hover:shadow-md',
        isDone && 'opacity-60',
        isDragging && 'shadow-lg',
      )}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: task.isAtRisk ? '2px solid #FBBC04' : '1px solid #E0E0E0',
      }}
    >
      <div className="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <GripVertical size={16} className="text-gray-400" />
      </div>

      <div className="mb-2 flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: TASK_PRIORITY_COLORS[task.priority] }}
        />
        <span className="text-xs font-medium text-gray-500">{task.taskKey}</span>
        {isDone && (
          <div className="ml-auto">
            <CheckSquare size={14} style={{ color: '#34A853' }} />
          </div>
        )}
      </div>

      <h4 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
        {task.title}
      </h4>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs text-gray-600">{task.description}</p>
      )}

      {task.progress > 0 && task.progress < 100 && (
        <div className="mb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${task.progress}%`, backgroundColor: '#1A73E8' }}
            />
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="rounded px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}15`,
                color: tag.color,
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-2">
          {task.assigneeName && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: '#1A73E8' }}
              title={task.assigneeName}
            >
              {task.assigneeName.slice(0, 2).toUpperCase()}
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{task.dueDate}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {task.subtasks && (
            <div className="flex items-center gap-1">
              <CheckSquare size={12} />
              <span>{task.subtasks.completed}/{task.subtasks.total}</span>
            </div>
          )}
          {task.commentsCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle size={12} />
              <span>{task.commentsCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
