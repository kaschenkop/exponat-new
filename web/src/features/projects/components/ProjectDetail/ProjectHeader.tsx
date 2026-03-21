'use client';

import { Link } from '@/i18n/navigation';
import type { Project } from '@/features/projects/types/project.types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, LayoutGrid, ListTodo, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ProjectHeader({
  project,
  onDeleteClick,
}: {
  project: Project;
  onDeleteClick: () => void;
}): React.ReactElement {
  const t = useTranslations('projects');
  const tt = useTranslations('tasks');

  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            {t('detail.back')}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <Badge variant="secondary">{t(`status.${project.status}`)}</Badge>
        </div>
        <p className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <Link
            className="inline-flex items-center gap-1 hover:text-foreground"
            href={`/dashboard/projects/${project.id}/tasks`}
          >
            <ListTodo className="h-4 w-4" aria-hidden />
            {tt('tasksLink')}
          </Link>
          <Link
            className="inline-flex items-center gap-1 hover:text-foreground"
            href="/dashboard/projects/kanban"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            {t('detail.kanbanLink')}
          </Link>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" aria-hidden />
            {t('detail.edit')}
          </Link>
        </Button>
        <Button variant="destructive" size="sm" type="button" onClick={onDeleteClick}>
          {t('detail.delete')}
        </Button>
      </div>
    </div>
  );
}
