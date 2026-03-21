'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/features/projects/hooks/useProjects';
import { useTasks } from '@/features/projects/hooks/useTasks';
import { useMilestones } from '@/features/projects/hooks/useMilestones';
import { useTaskMutations } from '@/features/projects/hooks/useTaskMutations';
import { useTaskStore } from '@/features/projects/store/taskStore';
import { ProjectNavTabs } from '@/features/projects/components/ProjectDetail/ProjectNavTabs';
import { TasksTopBar } from '@/features/projects/components/TasksTopBar';
import { TaskKanban } from '@/features/projects/components/TaskKanban';
import { TaskGantt } from '@/features/projects/components/TaskGantt';
import { TaskList } from '@/features/projects/components/TaskList';
import { TaskCalendar } from '@/features/projects/components/TaskCalendar';
import { TaskDetail } from '@/features/projects/components/TaskDetail';
import { TaskCreateDialog } from '@/features/projects/components/TaskCreateDialog';
import { Skeleton } from '@/shared/ui/skeleton';
import type { TaskStatus } from '@/features/projects/types/task.types';

export default function ProjectTasksPage(): React.ReactElement {
  const params = useParams();
  const projectId = String(params.id ?? '');

  const { activeView, filters, selectedTaskId, setActiveView, setFilters, setSelectedTaskId } =
    useTaskStore();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(projectId, filters);
  const { data: milestones } = useMilestones(projectId);
  const { updateTask, reorderTasks } = useTaskMutations(projectId);

  const [showCreate, setShowCreate] = React.useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = React.useState<TaskStatus>('backlog');

  const tasks = tasksData?.data ?? [];

  const handleStatusChange = (taskId: string, status: TaskStatus, orderNum?: number) => {
    if (orderNum !== undefined) {
      reorderTasks.mutate([{ taskId, status, orderNum }]);
    } else {
      updateTask.mutate({ taskId, input: { status } });
    }
  };

  const handleAddTask = (status: TaskStatus = 'backlog') => {
    setCreateDefaultStatus(status);
    setShowCreate(true);
  };

  if (projectLoading || tasksLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {project && (
        <ProjectNavTabs project={project} activeTab="tasks" />
      )}

      <TasksTopBar
        activeView={activeView}
        onViewChange={setActiveView}
        onAddTask={() => handleAddTask()}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {activeView === 'kanban' && (
        <TaskKanban
          tasks={tasks}
          onStatusChange={(taskId, status, orderNum) =>
            handleStatusChange(taskId, status, orderNum)
          }
          onTaskClick={setSelectedTaskId}
          onAddTask={handleAddTask}
        />
      )}

      {activeView === 'gantt' && (
        <TaskGantt
          tasks={tasks}
          milestones={milestones ?? []}
          onTaskClick={setSelectedTaskId}
        />
      )}

      {activeView === 'list' && (
        <TaskList
          tasks={tasks}
          onTaskClick={setSelectedTaskId}
          onStatusChange={(taskId, status) => handleStatusChange(taskId, status)}
        />
      )}

      {activeView === 'calendar' && (
        <TaskCalendar tasks={tasks} onTaskClick={setSelectedTaskId} />
      )}

      {selectedTaskId && (
        <TaskDetail
          projectId={projectId}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {showCreate && (
        <TaskCreateDialog
          projectId={projectId}
          defaultStatus={createDefaultStatus}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
