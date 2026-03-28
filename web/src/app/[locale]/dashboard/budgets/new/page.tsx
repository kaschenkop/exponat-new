import { initPageLocale } from '@/i18n/server';
import { BudgetCreateForm } from '@/features/budget/components/BudgetCreateForm';
import { getTranslations } from 'next-intl/server';

export default async function NewBudgetPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('budget.new');

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t('title')}
      </h1>
      <BudgetCreateForm />
    </div>
  );
}
