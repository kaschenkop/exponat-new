import type { ProjectKind, ProjectStatus } from '@/features/projects/types/project.types';

export function formatBudget(amount: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function statusLabel(
  status: ProjectStatus,
  t: (k: string) => string,
): string {
  const key = `projects.status.${status}` as const;
  return t(key);
}

export function typeLabel(kind: ProjectKind, t: (k: string) => string): string {
  return t(`projects.type.${kind}`);
}

export function parseApiDate(isoOrDate: string): Date {
  return new Date(isoOrDate);
}
