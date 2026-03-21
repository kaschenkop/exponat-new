'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

export default function NotFoundPage(): React.ReactElement {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-display text-2xl font-semibold">404</h1>
      <p className="text-muted-foreground">{t('notFoundTitle')}</p>
      <Button asChild>
        <Link href="/dashboard">{t('backToDashboard')}</Link>
      </Button>
    </main>
  );
}
