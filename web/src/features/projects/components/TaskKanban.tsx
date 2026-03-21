'use client';

import { useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Task, TaskStatus } from '@/features/projects/types/task.types';
import { TASK_STATUS_COLORS, TASK_STATUSES } from '@/features/projects/types/task.types';
import { TaskCard } from '@/features/projects/components/TaskCard';

interface TaskKanbanProps {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus, orderNum: number) => void
  onTaskClick: (taskId: string) => void
  onAddTask: (status: TaskStatus) => void
}

function DraggableTaskCard({
  task,
  onTaskClick,
}: {
  task: Task
  onTaskClick: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="mb-3 cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <TaskCard task={task} onClick={() => onTaskClick(task.id)} isDragging={isDragging} />
    </div>
  );
}

function KanbanColumn({
  status,
  count,
  color,
  onAdd,
  children,
}: {
  status: TaskStatus
  count: number
  color: string
  onAdd: () => void
  children: React.ReactNode
}) {
  const t = useTranslations('tasks');
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className="flex flex-col rounded-lg bg-white"
      style={{
        minWidth: '320px',
        maxWidth: '320px',
        height: 'calc(100vh - 220px)',
        outline: isOver ? `2px solid ${color}` : 'none',
      }}
    >
      <div
        className="flex items-center justify-between rounded-t-lg px-4 py-3"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{t(`status.${status}`)}</h3>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
            {count}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="rounded p-1 transition-colors hover:bg-white/10"
          aria-label={t('addTask')}
        >
          <Plus size={16} className="text-white" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3"
        style={{ backgroundColor: '#F8F9FA' }}
      >
        {children}
      </div>
    </div>
  );
}

export function TaskKanban({
  tasks,
  onStatusChange,
  onTaskClick,
  onAddTask,
}: TaskKanbanProps): React.ReactElement {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
      cancelled: [],
    };
    for (const task of tasks) {
      if (map[task.status]) {
        map[task.status].push(task);
      }
    }
    return map;
  }, [tasks]);

  const onDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const taskId = String(event.active.id);
      const overId = event.over?.id;
      if (!overId || typeof overId !== 'string') return;
      const nextStatus = overId as TaskStatus;
      if (!TASK_STATUSES.includes(nextStatus)) return;
      const current = tasks.find((t) => t.id === taskId);
      if (!current || current.status === nextStatus) return;
      const targetTasks = byStatus[nextStatus] ?? [];
      onStatusChange(taskId, nextStatus, targetTasks.length);
    },
    [tasks, byStatus, onStatusChange],
  );

  return (
    <div
      className="flex-1 overflow-x-auto overflow-y-hidden p-6"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              count={byStatus[status].length}
              color={TASK_STATUS_COLORS[status]}
              onAdd={() => onAddTask(status)}
            >
              {byStatus[status].map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                />
              ))}
            </KanbanColumn>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div style={{ width: 296 }}>
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
