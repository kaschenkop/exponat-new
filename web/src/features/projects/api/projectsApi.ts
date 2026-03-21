import { apiFetchJson } from '@/shared/lib/api-client';
import type {
  Project,
  ProjectCreateInput,
  ProjectFilters,
  ProjectListResponse,
  ProjectPhase,
  ProjectUpdateInput,
} from '@/features/projects/types/project.types';

function projectHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
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
  }
  return headers;
}

function buildListQuery(f: ProjectFilters): string {
  const q = new URLSearchParams();
  if (f.search) q.set('search', f.search);
  if (f.status?.length) q.set('status', f.status.join(','));
  if (f.type?.length) q.set('type', f.type.join(','));
  if (f.dateFrom) q.set('dateFrom', f.dateFrom);
  if (f.dateTo) q.set('dateTo', f.dateTo);
  if (f.budgetMin != null) q.set('budgetMin', String(f.budgetMin));
  if (f.budgetMax != null) q.set('budgetMax', String(f.budgetMax));
  if (f.managerId) q.set('managerId', f.managerId);
  if (f.sortBy) q.set('sortBy', f.sortBy);
  if (f.sortDir) q.set('sortDir', f.sortDir);
  q.set('limit', '100');
  q.set('offset', '0');
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const projectsApi = {
  list: async (filters: ProjectFilters): Promise<ProjectListResponse> => {
    return apiFetchJson<ProjectListResponse>(`/api/projects${buildListQuery(filters)}`, {
      headers: projectHeaders(),
    });
  },

  get: async (id: string): Promise<Project> => {
    return apiFetchJson<Project>(`/api/projects/${encodeURIComponent(id)}`, {
      headers: projectHeaders(),
    });
  },

  create: async (body: ProjectCreateInput): Promise<Project> => {
    return apiFetchJson<Project>('/api/projects', {
      method: 'POST',
      headers: projectHeaders(),
      body: JSON.stringify(body),
    });
  },

  update: async (id: string, body: ProjectUpdateInput): Promise<Project> => {
    return apiFetchJson<Project>(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: projectHeaders(),
      body: JSON.stringify(body),
    });
  },

  remove: async (id: string): Promise<void> => {
    await apiFetchJson<unknown>(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: projectHeaders(),
    });
  },

  patchStatus: async (
    id: string,
    status: string,
    kanbanPosition?: number,
  ): Promise<Project> => {
    return apiFetchJson<Project>(`/api/projects/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: projectHeaders(),
      body: JSON.stringify({ status, kanbanPosition }),
    });
  },

  patchPhase: async (
    projectId: string,
    phaseId: string,
    body: { status?: string; progress?: number },
  ): Promise<ProjectPhase> => {
    return apiFetchJson<ProjectPhase>(
      `/api/projects/${encodeURIComponent(projectId)}/phases/${encodeURIComponent(phaseId)}`,
      {
        method: 'PATCH',
        headers: projectHeaders(),
        body: JSON.stringify(body),
      },
    );
  },
};
