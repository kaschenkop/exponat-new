'use client';

import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function ProjectDeleteDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}): React.ReactElement {
  const t = useTranslations('projects');
  const router = useRouter();
  const { remove } = useProjectMutations();

  const onDelete = async () => {
    try {
      await remove.mutateAsync(projectId);
      onOpenChange(false);
      router.push('/dashboard/projects');
    } catch {
      /* ignore */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.description', { name: projectName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('delete.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => void onDelete()}
          >
            {t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
