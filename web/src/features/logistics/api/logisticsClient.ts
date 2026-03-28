import { apiFetchJson } from '@/shared/lib/api-client';
import { LOGISTICS_API_BASE_URL } from '@/shared/lib/constants';

export const LOGISTICS_API_PREFIX = `${LOGISTICS_API_BASE_URL}/api/v1/logistics`;

export function logisticsHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // Node/SSR: нет localStorage — те же заголовки, что у неавторизованного клиента в dev
  if (typeof window === 'undefined') {
    const devOrg =
      process.env.NEXT_PUBLIC_DEV_ORGANIZATION_ID ??
      (process.env.NODE_ENV !== 'production'
        ? '11111111-1111-1111-1111-111111111111'
        : undefined);
    if (devOrg) {
      headers['X-Organization-Id'] = devOrg;
    }
    headers['X-User-Id'] = '22222222-2222-2222-2222-222222222222';
    return headers;
  }
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
  return headers;
}

export async function logisticsGet<T>(path: string): Promise<T> {
  return apiFetchJson<T>(`${LOGISTICS_API_PREFIX}${path}`, {
    headers: logisticsHeaders(),
  });
}

export async function logisticsPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetchJson<T>(`${LOGISTICS_API_PREFIX}${path}`, {
    method: 'POST',
    headers: logisticsHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function logisticsPatch<T>(path: string, body: unknown): Promise<T> {
  return apiFetchJson<T>(`${LOGISTICS_API_PREFIX}${path}`, {
    method: 'PATCH',
    headers: logisticsHeaders(),
    body: JSON.stringify(body),
  });
}

export async function logisticsDelete(path: string): Promise<void> {
  const res = await fetch(`${LOGISTICS_API_PREFIX}${path}`, {
    method: 'DELETE',
    headers: logisticsHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
}
