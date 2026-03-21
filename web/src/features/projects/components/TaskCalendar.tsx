'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import type { Task } from '@/features/projects/types/task.types';
import { TASK_PRIORITY_COLORS } from '@/features/projects/types/task.types';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

interface TaskCalendarProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
}

export function TaskCalendar({ tasks, onTaskClick }: TaskCalendarProps): React.ReactElement {
  const t = useTranslations('tasks');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = task.dueDate;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    }
    return map;
  }, [tasks]);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="rounded-lg border bg-white" style={{ borderColor: '#E0E0E0' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: '#E0E0E0' }}>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              {t('calendar.today')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: '#E0E0E0' }}>
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-semibold text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={i}
                className={cn(
                  'min-h-[120px] border-b border-r p-2',
                  !inMonth && 'bg-gray-50',
                )}
                style={{ borderColor: '#E0E0E0' }}
              >
                <div
                  className={cn(
                    'mb-1 text-sm',
                    today
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-semibold text-white'
                      : inMonth
                        ? 'font-medium text-gray-900'
                        : 'text-gray-400',
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(task.id)}
                      className="block w-full truncate rounded px-1.5 py-0.5 text-left text-xs transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: `${TASK_PRIORITY_COLORS[task.priority]}15`,
                        color: TASK_PRIORITY_COLORS[task.priority],
                        borderLeft: `3px solid ${TASK_PRIORITY_COLORS[task.priority]}`,
                      }}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-xs text-gray-400">+{dayTasks.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
