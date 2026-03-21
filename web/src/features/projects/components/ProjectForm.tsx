'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreateSchema } from '@/features/projects/utils/projectValidation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';

type FormValues = z.infer<typeof projectCreateSchema>;

const DEFAULT_MANAGER_ID = '22222222-2222-2222-2222-222222222222';

const DEMO_MANAGERS = [
  { id: DEFAULT_MANAGER_ID, name: 'Анна Петрова' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Иван Смирнов' },
] as const;

export function ProjectForm(): React.ReactElement {
  const t = useTranslations('projects');
  const router = useRouter();
  const { createProject } = useProjectMutations();
  const [step, setStep] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'museum',
      startDate: '',
      endDate: '',
      totalBudget: 0,
      location: {
        venue: '',
        address: '',
        city: '',
        country: 'Россия',
      },
      managerId: DEFAULT_MANAGER_ID,
      teamMemberIds: [],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await createProject.mutateAsync({
      name: values.name,
      description: values.description ?? '',
      type: values.type,
      startDate: values.startDate,
      endDate: values.endDate,
      totalBudget: values.totalBudget,
      location: values.location,
      managerId: values.managerId,
      teamMemberIds: values.teamMemberIds ?? [],
    });
    router.push(`/dashboard/projects/${res.id}`);
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="flex gap-2" role="tablist" aria-label={t('wizard.steps')}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
              step === i
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border'
            }`}
            onClick={() => setStep(i)}
          >
            {t(`wizard.step${i}`)}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('wizard.step0')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fields.name')}</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description')}</Label>
              <textarea
                id="description"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...form.register('description')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.type')}</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(v) =>
                  form.setValue('type', v as FormValues['type'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="museum">{t('type.museum')}</SelectItem>
                  <SelectItem value="corporate">
                    {t('type.corporate')}
                  </SelectItem>
                  <SelectItem value="expo_forum">{t('type.expo_forum')}</SelectItem>
                  <SelectItem value="other">{t('type.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('wizard.step1')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('fields.startDate')}</Label>
              <Input id="startDate" type="date" {...form.register('startDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t('fields.endDate')}</Label>
              <Input id="endDate" type="date" {...form.register('endDate')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="budget">{t('fields.budget')}</Label>
              <Input
                id="budget"
                type="number"
                step="1"
                {...form.register('totalBudget', { valueAsNumber: true })}
              />
              {form.formState.errors.endDate ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('fields.manager')}</Label>
              <Select
                value={form.watch('managerId')}
                onValueChange={(v) => form.setValue('managerId', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_MANAGERS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('wizard.step2')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue">{t('fields.venue')}</Label>
              <Input id="venue" {...form.register('location.venue')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('fields.address')}</Label>
              <Input id="address" {...form.register('location.address')} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">{t('fields.city')}</Label>
                <Input id="city" {...form.register('location.city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('fields.country')}</Label>
                <Input id="country" {...form.register('location.country')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.team')}</Label>
              <p className="text-sm text-muted-foreground">{t('fields.teamHint')}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          {t('wizard.back')}
        </Button>
        {step < 2 ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(2, s + 1))}>
            {t('wizard.next')}
          </Button>
        ) : (
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? t('saving') : t('submit')}
          </Button>
        )}
      </div>
    </form>
  );
}
