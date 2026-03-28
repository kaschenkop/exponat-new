'use client';

import { useTranslations } from 'next-intl';
import type { Expense } from '../../types/expense.types';
import { AmountDisplay } from '../shared/AmountDisplay';

export function TopExpenses({
  expenses,
  currency,
}: {
  expenses: Expense[];
  currency: string;
}): React.ReactElement {
  const t = useTranslations('budget.analytics');
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">{t('colTitle')}</th>
            <th className="pb-2 pr-4 font-medium">{t('colVendor')}</th>
            <th className="pb-2 text-right font-medium">{t('colAmount')}</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-b border-border/60">
              <td className="py-2 pr-4">{e.title}</td>
              <td className="py-2 pr-4 text-muted-foreground">{e.vendor}</td>
              <td className="py-2 text-right tabular-nums">
                <AmountDisplay amount={e.amount} currency={currency} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
