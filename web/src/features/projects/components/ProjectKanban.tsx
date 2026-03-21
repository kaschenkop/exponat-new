'use client';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';
import type { Project, ProjectStatus } from '@/features/projects/types/project.types';
import { Card, CardContent } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';

const COLUMNS: ProjectStatus[] = [
  'draft',
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
];

function DraggableProject({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className="cursor-grab active:cursor-grabbing">
        <CardContent className="p-3 text-sm">
          <p className="font-medium">{project.name}</p>
          <p className="text-xs text-muted-foreground">{project.progress}%</p>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({
  status,
  title,
  children,
}: {
  status: ProjectStatus;
  title: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] rounded-lg border p-2 ${
        isOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
      }`}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function ProjectKanban(): React.ReactElement {
  const t = useTranslations('projects');
  const { data, isLoading } = useProjects({ limit: 100, page: 1 });
  const { updateStatus } = useProjectMutations();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byStatus = (s: ProjectStatus) =>
    data?.data.filter((p) => p.status === s) ?? [];

  const onDragEnd = (e: DragEndEvent) => {
    const pid = String(e.active.id);
    const overId = e.over?.id;
    if (!overId || typeof overId !== 'string') {
      return;
    }
    const next = overId as ProjectStatus;
    if (!COLUMNS.includes(next)) {
      return;
    }
    const current = data?.data.find((p) => p.id === pid);
    if (!current || current.status === next) {
      return;
    }
    void updateStatus.mutateAsync({ id: pid, status: next });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t('loadError')}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('kanban.hint')}</p>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col} status={col} title={t(`status.${col}`)}>
              {byStatus(col).map((p) => (
                <DraggableProject key={p.id} project={p} />
              ))}
            </KanbanColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
