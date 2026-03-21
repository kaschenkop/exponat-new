'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useProject } from '@/features/projects/hooks/useProjects';
import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const editSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof editSchema>;

export default function ProjectEditPage(): React.ReactElement {
  const params = useParams();
  const id = String(params.id ?? '');
  const t = useTranslations('projects');
  const { data: project, isLoading } = useProject(id);
  const { updateProject } = useProjectMutations();

  const form = useForm<FormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: '', description: '' },
  });

  React.useEffect(() => {
    if (!project) {
      return;
    }
    form.reset({
      name: project.name,
      description: project.description,
    });
  }, [project, form]);

  const name = form.watch('name');
  const description = form.watch('description');
  const debounced = useDebounce({ name, description }, 900);

  React.useEffect(() => {
    if (!project || !debounced.name) {
      return;
    }
    if (
      debounced.name === project.name &&
      (debounced.description ?? '') === project.description
    ) {
      return;
    }
    void updateProject.mutateAsync({
      id,
      input: {
        name: debounced.name,
        description: debounced.description ?? '',
      },
    });
  }, [debounced, project, id, updateProject]);

  if (isLoading || !project) {
    return <p className="text-sm text-muted-foreground">{t('saving')}</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/projects/${id}`}>{t('detail.back')}</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t('edit.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('edit.autoSave')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('fields.name')}</Label>
            <Input id="name" {...form.register('name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <textarea
              id="description"
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register('description')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
