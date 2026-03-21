import type { ProjectStatus } from '@/features/projects/types/project.types';

const STATUS_ORDER: ProjectStatus[] = [
  'draft',
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
];

export function projectStatusLabelKey(status: ProjectStatus): string {
  return `projects.status.${status}`;
}

export function statusBadgeClass(status: ProjectStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
    case 'planning':
      return 'bg-sky-500/15 text-sky-800 dark:text-sky-300';
    case 'draft':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-400';
    case 'on_hold':
      return 'bg-orange-500/15 text-orange-800 dark:text-orange-300';
    case 'completed':
      return 'bg-violet-500/15 text-violet-800 dark:text-violet-300';
    case 'cancelled':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function kanbanColumns(): ProjectStatus[] {
  return STATUS_ORDER.filter((s) => s !== 'cancelled');
}

export function formatCurrencyRub(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}
