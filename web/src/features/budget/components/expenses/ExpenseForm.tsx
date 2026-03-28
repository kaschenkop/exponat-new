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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useCategories } from '../../hooks/useCategories';
import { useExpenseMutations } from '../../hooks/useExpenseMutations';
import { expenseCreateSchema } from '../../utils/budgetValidation';
import type { z } from 'zod';
import { ExpenseAttachments } from './ExpenseAttachments';

type FormValues = z.infer<typeof expenseCreateSchema>;

export function ExpenseForm({
  budgetId,
  onClose,
}: {
  budgetId: string;
  onClose: () => void;
}): React.ReactElement {
  const t = useTranslations('budget.expenses');
  const { data: categories = [] } = useCategories(budgetId);
  const { createExpense } = useExpenseMutations(budgetId);

  const form = useForm<FormValues>({
    resolver: zodResolver(expenseCreateSchema),
    defaultValues: {
      categoryId: categories[0]?.id ?? '',
      title: '',
      amount: 1000,
      expenseDate: new Date().toISOString().slice(0, 10),
      vendor: '',
      type: 'invoice',
      paymentMethod: 'bank_transfer',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createExpense.mutateAsync({
      categoryId: values.categoryId,
      title: values.title,
      amount: values.amount,
      expenseDate: values.expenseDate,
      vendor: values.vendor,
      type: values.type,
      paymentMethod: values.paymentMethod,
    });
    onClose();
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('formTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <Select
              value={form.watch('categoryId')}
              onValueChange={(v) => form.setValue('categoryId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ex-title">{t('title')}</Label>
            <Input id="ex-title" {...form.register('title')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ex-amount">{t('amount')}</Label>
              <Input
                id="ex-amount"
                type="number"
                {...form.register('amount', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ex-date">{t('date')}</Label>
              <Input id="ex-date" type="date" {...form.register('expenseDate')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ex-vendor">{t('vendor')}</Label>
            <Input id="ex-vendor" {...form.register('vendor')} />
          </div>
          <ExpenseAttachments />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={createExpense.isPending}>
              {t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
