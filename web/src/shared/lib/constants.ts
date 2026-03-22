export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/** Базовый URL сервиса projects (REST + WebSocket). Локально через Kong — тот же хост, что и API. */
export const PROJECTS_API_BASE_URL =
  process.env.NEXT_PUBLIC_PROJECTS_API_URL ?? 'http://localhost:8000';
