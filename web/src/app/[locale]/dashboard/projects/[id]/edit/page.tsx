'use client';

import { ProjectEditForm } from '@/features/projects/components/ProjectEditForm';
import { ProjectDeleteDialog } from '@/features/projects/components/ProjectDeleteDialog';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { useProject } from '@/features/projects/hooks/useProject';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ProjectEditPage(): React.ReactElement {
  const t = useTranslations('projects');
  const tc = useTranslations('common');
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data, isPending, isError, refetch } = useProject(id);
  const [open, setOpen] = useState(false);

  return (
    <ProjectsShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{t('edit.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('edit.autoSave')}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/projects/${id}`}>{t('detail.back')}</Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
              disabled={!data}
            >
              {tc('delete')}
            </Button>
          </div>
        </div>

        {isPending && <p className="text-muted-foreground">{t('loading')}</p>}
        {isError && (
          <div className="rounded-md border border-destructive/40 p-4 text-sm">
            {t('error')}{' '}
            <button type="button" className="underline" onClick={() => refetch()}>
              {t('retry')}
            </button>
          </div>
        )}
        {data && (
          <>
            <ProjectEditForm key={data.id} project={data} />
            <ProjectDeleteDialog
              projectId={data.id}
              projectName={data.name}
              open={open}
              onOpenChange={setOpen}
            />
          </>
        )}
      </div>
    </ProjectsShell>
  );
}
