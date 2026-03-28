'use client';

import { useTranslations } from 'next-intl';

export function BudgetForecast({
  data,
}: {
  data: { projectedTotal: number; confidence: number; message: string };
}): React.ReactElement {
  const t = useTranslations('budget.analytics');
  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="text-muted-foreground">{t('projected')}:</span>{' '}
        <span className="font-semibold tabular-nums">
          {data.projectedTotal.toLocaleString('ru-RU')} ₽
        </span>
      </p>
      <p>
        <span className="text-muted-foreground">{t('confidence')}:</span>{' '}
        {Math.round(data.confidence * 100)}%
      </p>
      <p className="text-muted-foreground">{data.message}</p>
    </div>
  );
}
