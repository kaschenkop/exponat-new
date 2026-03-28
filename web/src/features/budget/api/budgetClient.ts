import { apiFetchJson } from '@/shared/lib/api-client';
import { BUDGET_API_BASE_URL } from '@/shared/lib/constants';

const BASE = `${BUDGET_API_BASE_URL}/api/v1/budgets`;

export function budgetHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!token) {
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
  }
  return headers;
}

export async function budgetGet<T>(path: string): Promise<T> {
  return apiFetchJson<T>(`${BASE}${path}`, { headers: budgetHeaders() });
}

export async function budgetPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetchJson<T>(`${BASE}${path}`, {
    method: 'POST',
    headers: budgetHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function budgetDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: budgetHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
}

export { BASE as BUDGETS_API_PREFIX };
