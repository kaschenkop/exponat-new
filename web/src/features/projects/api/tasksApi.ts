import { apiFetchJson } from '@/shared/lib/api-client';
import { PROJECTS_API_BASE_URL } from '@/shared/lib/constants';
import type {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  TaskFilters,
  TasksListResponse,
  TaskReorderInput,
  Subtask,
  TaskComment,
  Milestone,
} from '@/features/projects/types/task.types';

const P = `${PROJECTS_API_BASE_URL}/api/projects`;

function taskHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const devOrg =
      process.env.NEXT_PUBLIC_DEV_ORGANIZATION_ID ??
      (process.env.NODE_ENV !== 'production'
        ? '11111111-1111-1111-1111-111111111111'
        : undefined);
    if (devOrg) {
      headers['X-Organization-Id'] = devOrg;
    }
    headers['X-User-Id'] =
      window.localStorage.getItem('dev_user_id') ??
      '22222222-2222-2222-2222-222222222222';
  }
  return headers;
}

function buildTaskQuery(f: TaskFilters): string {
  const p = new URLSearchParams();
  if (f.search) p.set('search', f.search);
  f.status?.forEach((s) => p.append('status', s));
  f.priority?.forEach((pr) => p.append('priority', pr));
  f.assignee?.forEach((a) => p.append('assignee', a));
  if (f.group) p.set('group', f.group);
  if (f.dateFrom) p.set('dateFrom', f.dateFrom);
  if (f.dateTo) p.set('dateTo', f.dateTo);
  if (f.sortBy) p.set('sortBy', f.sortBy);
  if (f.sortOrder) p.set('sortOrder', f.sortOrder);
  if (f.page) p.set('page', String(f.page));
  if (f.limit) p.set('limit', String(f.limit));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export const tasksApi = {
  list: async (projectId: string, filters: TaskFilters = {}): Promise<TasksListResponse> =>
    apiFetchJson<TasksListResponse>(`${P}/${projectId}/tasks${buildTaskQuery(filters)}`, {
      headers: taskHeaders(),
    }),

  getById: async (projectId: string, taskId: string): Promise<Task> =>
    apiFetchJson<Task>(`${P}/${projectId}/tasks/${taskId}`, {
      headers: taskHeaders(),
    }),

  create: async (projectId: string, input: TaskCreateInput): Promise<Task> =>
    apiFetchJson<Task>(`${P}/${projectId}/tasks`, {
      method: 'POST',
      headers: taskHeaders(),
      body: JSON.stringify(input),
    }),

  update: async (projectId: string, taskId: string, input: TaskUpdateInput): Promise<Task> =>
    apiFetchJson<Task>(`${P}/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: taskHeaders(),
      body: JSON.stringify(input),
    }),

  remove: async (projectId: string, taskId: string): Promise<void> => {
    await apiFetchJson<undefined>(`${P}/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: taskHeaders(),
    });
  },

  reorder: async (projectId: string, items: TaskReorderInput[]): Promise<void> => {
    await apiFetchJson(`${P}/${projectId}/tasks-reorder`, {
      method: 'PATCH',
      headers: taskHeaders(),
      body: JSON.stringify(items),
    });
  },

  listSubtasks: async (projectId: string, taskId: string): Promise<Subtask[]> =>
    apiFetchJson<Subtask[]>(`${P}/${projectId}/tasks/${taskId}/subtasks`, {
      headers: taskHeaders(),
    }),

  createSubtask: async (projectId: string, taskId: string, title: string): Promise<Subtask> =>
    apiFetchJson<Subtask>(`${P}/${projectId}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: taskHeaders(),
      body: JSON.stringify({ title }),
    }),

  updateSubtask: async (
    projectId: string,
    taskId: string,
    subId: string,
    patch: { title?: string; isCompleted?: boolean },
  ): Promise<Subtask> =>
    apiFetchJson<Subtask>(`${P}/${projectId}/tasks/${taskId}/subtasks/${subId}`, {
      method: 'PATCH',
      headers: taskHeaders(),
      body: JSON.stringify(patch),
    }),

  deleteSubtask: async (projectId: string, taskId: string, subId: string): Promise<void> => {
    await apiFetchJson<undefined>(`${P}/${projectId}/tasks/${taskId}/subtasks/${subId}`, {
      method: 'DELETE',
      headers: taskHeaders(),
    });
  },

  listComments: async (projectId: string, taskId: string): Promise<TaskComment[]> =>
    apiFetchJson<TaskComment[]>(`${P}/${projectId}/tasks/${taskId}/comments`, {
      headers: taskHeaders(),
    }),

  createComment: async (projectId: string, taskId: string, content: string): Promise<TaskComment> =>
    apiFetchJson<TaskComment>(`${P}/${projectId}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: taskHeaders(),
      body: JSON.stringify({ content }),
    }),

  listMilestones: async (projectId: string): Promise<Milestone[]> =>
    apiFetchJson<Milestone[]>(`${P}/${projectId}/milestones`, {
      headers: taskHeaders(),
    }),

  createMilestone: async (
    projectId: string,
    input: { title: string; date: string; description?: string },
  ): Promise<Milestone> =>
    apiFetchJson<Milestone>(`${P}/${projectId}/milestones`, {
      method: 'POST',
      headers: taskHeaders(),
      body: JSON.stringify(input),
    }),

  deleteMilestone: async (projectId: string, msId: string): Promise<void> => {
    await apiFetchJson<undefined>(`${P}/${projectId}/milestones/${msId}`, {
      method: 'DELETE',
      headers: taskHeaders(),
    });
  },
};
