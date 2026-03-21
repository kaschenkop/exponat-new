'use client';

import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';
import type { Project, ProjectUpdateInput } from '@/features/projects/types/project.types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

type EditValues = {
  name: string;
  description: string;
  status: Project['status'];
  totalBudget: number;
};

export function ProjectEditForm({ project }: { project: Project }): React.ReactElement {
  const t = useTranslations('projects');
  const { update } = useProjectMutations();
  const lastSaved = useRef<string>('');

  const form = useForm<EditValues>({
    defaultValues: {
      name: project.name,
      description: project.description,
      status: project.status,
      totalBudget: project.totalBudget,
    },
  });

  const values = form.watch();
  const debounced = useDebounce(values, 900);
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const payload: ProjectUpdateInput = {
      name: debounced.name,
      description: debounced.description,
      status: debounced.status,
      totalBudget: debounced.totalBudget,
    };
    const key = JSON.stringify(payload);
    if (key === lastSaved.current) return;
    lastSaved.current = key;
    update.mutate({ id: project.id, body: payload });
  }, [debounced, project.id, update]);

  return (
    <form className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t('edit.autoSave')}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={update.isPending}
          onClick={() => form.reset()}
        >
          {t('edit.reset')}
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{t('form.name')}</Label>
        <Input id="name" {...form.register('name')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">{t('form.description')}</Label>
        <textarea
          id="desc"
          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...form.register('description')}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('form.status')}</Label>
        <Select
          value={form.watch('status')}
          onValueChange={(v) => form.setValue('status', v as Project['status'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              [
                'draft',
                'planning',
                'active',
                'on_hold',
                'completed',
                'cancelled',
              ] as const
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bud">{t('form.budget')}</Label>
        <Input
          id="bud"
          type="number"
          min={0}
          {...form.register('totalBudget', { valueAsNumber: true })}
        />
      </div>
    </form>
  );
}
