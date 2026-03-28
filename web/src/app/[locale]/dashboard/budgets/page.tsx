import { initPageLocale } from '@/i18n/server';
import { BudgetList } from '@/features/budget/components/BudgetList';
import { Button } from '@/shared/ui/button';
import { Link } from '@/i18n/navigation';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function BudgetsPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('budget');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <Button asChild>
          <Link href="/dashboard/budgets/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            {t('create')}
          </Link>
        </Button>
      </div>
      <BudgetList />
    </div>
  );
}
