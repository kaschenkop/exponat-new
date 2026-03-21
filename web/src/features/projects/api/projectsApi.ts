import { apiFetchJson } from '@/shared/lib/api-client';
import { PROJECTS_API_BASE_URL } from '@/shared/lib/constants';
import type {
  Project,
  ProjectChange,
  ProjectCreateInput,
  ProjectFilters,
  ProjectPhase,
  ProjectTeamMember,
  ProjectUpdateInput,
  ProjectsListResponse,
} from '@/features/projects/types/project.types';

const P = `${PROJECTS_API_BASE_URL}/api/projects`;

function projectHeaders(): HeadersInit {
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

function buildQuery(f: ProjectFilters): string {
  const p = new URLSearchParams();
  if (f.search) p.set('search', f.search);
  f.status?.forEach((s) => p.append('status', s));
  f.type?.forEach((t) => p.append('type', t));
  if (f.dateFrom) p.set('dateFrom', f.dateFrom);
  if (f.dateTo) p.set('dateTo', f.dateTo);
  if (f.budgetMin != null) p.set('budgetMin', String(f.budgetMin));
  if (f.budgetMax != null) p.set('budgetMax', String(f.budgetMax));
  if (f.managerId) p.set('managerId', f.managerId);
  if (f.sortBy) p.set('sortBy', f.sortBy);
  if (f.sortOrder) p.set('sortOrder', f.sortOrder);
  if (f.page) p.set('page', String(f.page));
  if (f.limit) p.set('limit', String(f.limit));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export const projectsApi = {
  list: async (filters: ProjectFilters = {}): Promise<ProjectsListResponse> => {
    return apiFetchJson<ProjectsListResponse>(`${P}${buildQuery(filters)}`, {
      headers: projectHeaders(),
    });
  },

  getById: async (id: string): Promise<Project> => {
    return apiFetchJson<Project>(`${P}/${id}`, {
      headers: projectHeaders(),
    });
  },

  create: async (input: ProjectCreateInput): Promise<Project> => {
    return apiFetchJson<Project>(P, {
      method: 'POST',
      headers: projectHeaders(),
      body: JSON.stringify(input),
    });
  },

  update: async (id: string, input: ProjectUpdateInput): Promise<Project> => {
    return apiFetchJson<Project>(`${P}/${id}`, {
      method: 'PATCH',
      headers: projectHeaders(),
      body: JSON.stringify(input),
    });
  },

  remove: async (id: string): Promise<void> => {
    await apiFetchJson<undefined>(`${P}/${id}`, {
      method: 'DELETE',
      headers: projectHeaders(),
    });
  },

  getTeam: async (id: string): Promise<ProjectTeamMember[]> => {
    return apiFetchJson<ProjectTeamMember[]>(`${P}/${id}/team`, {
      headers: projectHeaders(),
    });
  },

  addTeamMember: async (
    id: string,
    body: { userId: string; role: string; permissions?: string[] },
  ): Promise<void> => {
    await apiFetchJson(`${P}/${id}/team`, {
      method: 'POST',
      headers: projectHeaders(),
      body: JSON.stringify(body),
    });
  },

  removeTeamMember: async (id: string, userId: string): Promise<void> => {
    await apiFetchJson<undefined>(`${P}/${id}/team/${userId}`, {
      method: 'DELETE',
      headers: projectHeaders(),
    });
  },

  getPhases: async (id: string): Promise<ProjectPhase[]> => {
    return apiFetchJson<ProjectPhase[]>(`${P}/${id}/phases`, {
      headers: projectHeaders(),
    });
  },

  createPhase: async (
    id: string,
    body: Omit<ProjectPhase, 'id' | 'projectId'>,
  ): Promise<ProjectPhase> => {
    return apiFetchJson<ProjectPhase>(`${P}/${id}/phases`, {
      method: 'POST',
      headers: projectHeaders(),
      body: JSON.stringify({
        name: body.name,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        status: body.status,
        progress: body.progress,
        dependencies: body.dependencies,
        orderNum: body.orderNum,
      }),
    });
  },

  updatePhase: async (
    projectId: string,
    phaseId: string,
    patch: Partial<
      Pick<
        ProjectPhase,
        | 'name'
        | 'description'
        | 'startDate'
        | 'endDate'
        | 'status'
        | 'progress'
        | 'dependencies'
        | 'orderNum'
      >
    >,
  ): Promise<ProjectPhase> => {
    return apiFetchJson<ProjectPhase>(
      `${P}/${projectId}/phases/${phaseId}`,
      {
        method: 'PATCH',
        headers: projectHeaders(),
        body: JSON.stringify(patch),
      },
    );
  },

  deletePhase: async (projectId: string, phaseId: string): Promise<void> => {
    await apiFetchJson<undefined>(`${P}/${projectId}/phases/${phaseId}`, {
      method: 'DELETE',
      headers: projectHeaders(),
    });
  },

  getActivity: async (id: string, limit = 50): Promise<ProjectChange[]> => {
    return apiFetchJson<ProjectChange[]>(`${P}/${id}/activity?limit=${limit}`, {
      headers: projectHeaders(),
    });
  },
};

export function projectsWebSocketUrl(projectId: string): string {
  const base = PROJECTS_API_BASE_URL.replace(/^http/, 'ws');
  const org =
    (typeof window !== 'undefined' &&
      (process.env.NEXT_PUBLIC_DEV_ORGANIZATION_ID ??
        '11111111-1111-1111-1111-111111111111')) ||
    '';
  const uid =
    (typeof window !== 'undefined' &&
      (window.localStorage.getItem('dev_user_id') ??
        '22222222-2222-2222-2222-222222222222')) ||
    '';
  const q = new URLSearchParams({
    projectId,
    organizationId: org,
    userId: uid,
  });
  return `${base}/api/projects/ws?${q.toString()}`;
}
