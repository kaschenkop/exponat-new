'use client';

import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useCategoryMutations } from '../../hooks/useCategoryMutations';
import { categoryCreateSchema } from '../../utils/budgetValidation';
import type { z } from 'zod';

type FormValues = z.infer<typeof categoryCreateSchema>;

export function CategoryForm({
  budgetId,
  parentId,
  onClose,
}: {
  budgetId: string;
  parentId: string | null;
  onClose: () => void;
}): React.ReactElement {
  const t = useTranslations('budget.categories');
  const { createCategory } = useCategoryMutations(budgetId);

  const form = useForm<FormValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      plannedAmount: 0,
      parentId: parentId ?? null,
    },
  });

  const formKey = parentId ?? 'root';

  const onSubmit = form.handleSubmit(async (values) => {
    await createCategory.mutateAsync({
      name: values.name,
      code: values.code,
      plannedAmount: values.plannedAmount,
      parentId: parentId ?? values.parentId ?? null,
    });
    onClose();
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('formTitle')}</DialogTitle>
        </DialogHeader>
        <form key={formKey} onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">{t('name')}</Label>
            <Input id="cat-name" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-code">{t('code')}</Label>
            <Input id="cat-code" {...form.register('code')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-plan">{t('planned')}</Label>
            <Input
              id="cat-plan"
              type="number"
              {...form.register('plannedAmount', { valueAsNumber: true })}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={createCategory.isPending}>
              {t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
