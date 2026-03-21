'use client';

import { Plus, Kanban, BarChart2, List, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import type { TaskViewType, TaskFilters } from '@/features/projects/types/task.types';
import { Button } from '@/shared/ui/button';

interface TasksTopBarProps {
  activeView: TaskViewType
  onViewChange: (view: TaskViewType) => void
  onAddTask: () => void
  filters: TaskFilters
  onFiltersChange: (f: Partial<TaskFilters>) => void
}

const views: { key: TaskViewType; icon: typeof Kanban }[] = [
  { key: 'kanban', icon: Kanban },
  { key: 'gantt', icon: BarChart2 },
  { key: 'list', icon: List },
  { key: 'calendar', icon: Calendar },
];

export function TasksTopBar({
  activeView,
  onViewChange,
  onAddTask,
  filters,
  onFiltersChange,
}: TasksTopBarProps): React.ReactElement {
  const t = useTranslations('tasks');

  return (
    <div
      className="flex flex-col gap-3 border-b bg-white px-6 py-3"
      style={{ borderColor: '#E0E0E0' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1">
          {views.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              className={cn(
                'flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors',
                activeView === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              <Icon size={16} />
              <span>{t(`view.${key}`)}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            className="rounded-md border bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#E0E0E0' }}
            value={filters.status?.[0] ?? ''}
            onChange={(e) =>
              onFiltersChange({
                status: e.target.value
                  ? [e.target.value as 'backlog' | 'in_progress' | 'review' | 'done']
                  : undefined,
              })
            }
          >
            <option value="">{t('filters.allStatus')}</option>
            <option value="backlog">{t('status.backlog')}</option>
            <option value="in_progress">{t('status.in_progress')}</option>
            <option value="review">{t('status.review')}</option>
            <option value="done">{t('status.done')}</option>
          </select>

          <select
            className="rounded-md border bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#E0E0E0' }}
            value={filters.priority?.[0] ?? ''}
            onChange={(e) =>
              onFiltersChange({
                priority: e.target.value
                  ? [e.target.value as 'high' | 'medium' | 'low']
                  : undefined,
              })
            }
          >
            <option value="">{t('filters.allPriorities')}</option>
            <option value="high">{t('priority.high')}</option>
            <option value="medium">{t('priority.medium')}</option>
            <option value="low">{t('priority.low')}</option>
          </select>

          <Button
            onClick={onAddTask}
            className="flex items-center gap-2"
            style={{ backgroundColor: '#1A73E8' }}
          >
            <Plus size={18} />
            <span>{t('addTask')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
