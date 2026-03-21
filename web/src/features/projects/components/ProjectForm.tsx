'use client';

import { useProjectMutations } from '@/features/projects/hooks/useProjectMutations';
import { useProjectStore } from '@/features/projects/store/projectStore';
import type { ProjectCreateInput } from '@/features/projects/types/project.types';
import {
  projectWizardStep1Schema,
  projectWizardStep2Schema,
  projectWizardStep3Schema,
} from '@/features/projects/utils/projectValidation';
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
import { useRouter } from '@/i18n/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const DEMO_MANAGERS = [
  { id: '22222222-2222-2222-2222-222222222222', name: 'Анна Петрова' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Иван Смирнов' },
];

const fullSchema = z
  .object({
    name: z.string().min(2),
    description: z.string(),
    type: z.enum(['museum', 'corporate', 'expo_forum', 'other']),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    totalBudget: z.coerce.number().min(0),
    location: z.object({
      venue: z.string().min(1),
      address: z.string(),
      city: z.string().min(1),
      country: z.string().min(1),
    }),
    managerId: z.string().uuid(),
    teamMemberIds: z.array(z.string().uuid()).default([]),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'end',
    path: ['endDate'],
  });

type FullValues = z.infer<typeof fullSchema>;

export function ProjectForm(): React.ReactElement {
  const t = useTranslations('projects');
  const router = useRouter();
  const step = useProjectStore((s) => s.wizardStep);
  const setStep = useProjectStore((s) => s.setWizardStep);
  const mutations = useProjectMutations();

  const form = useForm<FullValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'museum',
      startDate: '',
      endDate: '',
      totalBudget: 0,
      location: { venue: '', address: '', city: '', country: 'Россия' },
      managerId: DEMO_MANAGERS[0]?.id ?? '22222222-2222-2222-2222-222222222222',
      teamMemberIds: [],
    },
  });

  const next = async () => {
    const vals = form.getValues();
    if (step === 0) {
      const r = projectWizardStep1Schema.safeParse({
        name: vals.name,
        description: vals.description,
        type: vals.type,
      });
      if (!r.success) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const r = projectWizardStep2Schema.safeParse({
        startDate: vals.startDate,
        endDate: vals.endDate,
        totalBudget: vals.totalBudget,
      });
      if (!r.success) return;
      setStep(2);
      return;
    }
  };

  const back = () => setStep(Math.max(0, step - 1));

  const onSubmit = form.handleSubmit(async (data) => {
    const r3 = projectWizardStep3Schema.safeParse({
      location: data.location,
      managerId: data.managerId,
      teamMemberIds: data.teamMemberIds,
    });
    if (!r3.success) return;

    const body: ProjectCreateInput = {
      name: data.name,
      description: data.description,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      totalBudget: data.totalBudget,
      location: data.location,
      managerId: data.managerId,
      teamMemberIds: data.teamMemberIds.filter((id) => id !== data.managerId),
    };

    try {
      const p = await mutations.create.mutateAsync(body);
      router.push(`/dashboard/projects/${p.id}`);
    } catch {
      /* toast optional */
    }
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-8">
      <ol className="flex gap-2 text-sm text-muted-foreground">
        <li className={step >= 0 ? 'font-medium text-foreground' : ''}>1. {t('wizard.step1')}</li>
        <li>→</li>
        <li className={step >= 1 ? 'font-medium text-foreground' : ''}>2. {t('wizard.step2')}</li>
        <li>→</li>
        <li className={step >= 2 ? 'font-medium text-foreground' : ''}>3. {t('wizard.step3')}</li>
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">{t('form.description')}</Label>
            <textarea
              id="desc"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register('description')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('form.type')}</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(v) =>
                form.setValue('type', v as FullValues['type'], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="museum">{t('type.museum')}</SelectItem>
                <SelectItem value="corporate">{t('type.corporate')}</SelectItem>
                <SelectItem value="expo_forum">{t('type.expo_forum')}</SelectItem>
                <SelectItem value="other">{t('type.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sd">{t('form.startDate')}</Label>
              <Input id="sd" type="date" {...form.register('startDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ed">{t('form.endDate')}</Label>
              <Input id="ed" type="date" {...form.register('endDate')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bud">{t('form.budget')}</Label>
            <Input id="bud" type="number" min={0} {...form.register('totalBudget', { valueAsNumber: true })} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venue">{t('form.venue')}</Label>
            <Input id="venue" {...form.register('location.venue')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr">{t('form.address')}</Label>
            <Input id="addr" {...form.register('location.address')} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">{t('form.city')}</Label>
              <Input id="city" {...form.register('location.city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t('form.country')}</Label>
              <Input id="country" {...form.register('location.country')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('form.manager')}</Label>
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
          <div className="space-y-2">
            <Label>{t('form.teamOptional')}</Label>
            <div className="flex flex-wrap gap-2">
              {DEMO_MANAGERS.map((m) => {
                const checked = form.watch('teamMemberIds').includes(m.id);
                return (
                  <Button
                    key={m.id}
                    type="button"
                    size="sm"
                    variant={checked ? 'default' : 'outline'}
                    onClick={() => {
                      const cur = form.getValues('teamMemberIds');
                      const next = checked
                        ? cur.filter((x) => x !== m.id)
                        : [...cur, m.id];
                      form.setValue('teamMemberIds', next);
                    }}
                  >
                    {m.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
          {t('wizard.back')}
        </Button>
        {step < 2 ? (
          <Button type="button" onClick={() => void next()}>
            {t('wizard.next')}
          </Button>
        ) : (
          <Button type="submit" disabled={mutations.create.isPending}>
            {t('form.submit')}
          </Button>
        )}
      </div>
    </form>
  );
}
