import { API_BASE_URL } from '@/shared/lib/constants';
import type { ApiErrorType } from '@/shared/types/api.types';

export class ApiClientError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url =
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  if (res.status === 204) {
    return undefined as T;
  }
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const err = data as ApiErrorType | null;
    throw new ApiClientError(err?.message ?? res.statusText, res.status, data);
  }

  return data as T;
}
