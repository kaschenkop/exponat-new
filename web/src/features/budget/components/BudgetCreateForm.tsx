'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useBudgetMutations } from '../hooks/useBudgetMutations';
import { budgetCreateSchema } from '../utils/budgetValidation';
import type { z } from 'zod';
import { CurrencySelect } from './shared/CurrencySelect';
import type { Currency } from '../types/budget.types';

type FormValues = z.infer<typeof budgetCreateSchema> & { currency: Currency };

export function BudgetCreateForm(): React.ReactElement {
  const t = useTranslations('budget.new');
  const router = useRouter();
  const { createBudget } = useBudgetMutations();

  const form = useForm<FormValues>({
    resolver: zodResolver(budgetCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      totalPlanned: 100_000,
      currency: 'RUB',
      period: 'monthly',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const b = await createBudget.mutateAsync({
      name: values.name,
      description: values.description,
      totalPlanned: values.totalPlanned,
      currency: values.currency,
      period: values.period,
      startDate: values.startDate,
      endDate: values.endDate,
      status: 'draft',
    });
    router.push(`/dashboard/budgets/${b.id}/overview`);
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="b-name">{t('name')}</Label>
        <Input id="b-name" {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="b-desc">{t('description')}</Label>
        <Input id="b-desc" {...form.register('description')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('currency')}</Label>
          <CurrencySelect
            value={form.watch('currency')}
            onChange={(c) => form.setValue('currency', c)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-plan">{t('totalPlanned')}</Label>
          <Input
            id="b-plan"
            type="number"
            {...form.register('totalPlanned', { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="b-start">{t('startDate')}</Label>
          <Input id="b-start" type="date" {...form.register('startDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-end">{t('endDate')}</Label>
          <Input id="b-end" type="date" {...form.register('endDate')} />
        </div>
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={createBudget.isPending}>
        {t('submit')}
      </Button>
    </form>
  );
}
