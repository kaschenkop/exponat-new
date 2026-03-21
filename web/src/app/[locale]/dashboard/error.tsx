'use client';

import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  const t = useTranslations('dashboard.home');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
      <h1 className="font-display text-xl font-semibold">{t('boundaryTitle')}</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button type="button" onClick={() => reset()}>
        {t('boundaryRetry')}
      </Button>
    </div>
  );
}
