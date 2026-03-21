'use client';

import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';
import type { Project, ProjectStatus } from '@/features/projects/types/project.types';
import { kanbanColumns, statusBadgeClass } from '@/features/projects/utils/projectHelpers';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

function DraggableCard({ project }: { project: Project }): React.ReactElement {
  const t = useTranslations('projects');
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-md border bg-card p-3 shadow-sm"
    >
      <p className="font-medium leading-snug">{project.name}</p>
      <span
        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(project.status)}`}
      >
        {t(`status.${project.status}`)}
      </span>
      <Button asChild variant="link" className="mt-2 h-auto px-0 text-xs">
        <Link href={`/dashboard/projects/${project.id}`}>{t('kanban.open')}</Link>
      </Button>
    </div>
  );
}

function Column({
  status,
  projects,
}: {
  status: ProjectStatus;
  projects: Project[];
}): React.ReactElement {
  const t = useTranslations('projects');
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[320px] flex-1 flex-col rounded-lg border bg-muted/30 p-3 ${
        isOver ? 'ring-2 ring-primary/40' : ''
      }`}
    >
      <div className="mb-3 text-sm font-semibold">{t(`status.${status}`)}</div>
      <div className="flex flex-1 flex-col gap-2">
        {projects.map((p) => (
          <DraggableCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}

export function ProjectKanban(): React.ReactElement {
  const t = useTranslations('projects');
  const { data, isPending, isError, refetch } = useProjects();
  const { patchStatus } = useProjectMutations();
  const [active, setActive] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const cols = kanbanColumns();

  const grouped = useMemo(() => {
    const m = new Map<ProjectStatus, Project[]>();
    cols.forEach((c) => m.set(c, []));
    for (const p of data?.items ?? []) {
      const list = m.get(p.status);
      if (list) list.push(p);
    }
    return m;
  }, [data?.items, cols]);

  const onDragEnd = (e: DragEndEvent) => {
    const pid = String(e.active.id);
    const overId = e.over?.id;
    if (!overId) return;
    const nextStatus = String(overId) as ProjectStatus;
    const proj = data?.items.find((x) => x.id === pid);
    if (!proj || proj.status === nextStatus) return;
    patchStatus.mutate({ id: pid, status: nextStatus });
  };

  if (isPending) {
    return <p className="text-muted-foreground">{t('loading')}</p>;
  }
  if (isError) {
    return (
      <div className="rounded-md border border-destructive/40 p-4 text-sm">
        {t('error')}
        <button type="button" className="ml-2 underline" onClick={() => refetch()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        const p = data?.items.find((x) => x.id === String(active.id));
        setActive(p ?? null);
      }}
      onDragEnd={(e) => {
        setActive(null);
        onDragEnd(e);
      }}
      onDragCancel={() => setActive(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {cols.map((status) => (
          <Column key={status} status={status} projects={grouped.get(status) ?? []} />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <Card className="w-64">
            <CardHeader className="p-3">
              <CardTitle className="text-base">{active.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
              {t(`status.${active.status}`)}
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
