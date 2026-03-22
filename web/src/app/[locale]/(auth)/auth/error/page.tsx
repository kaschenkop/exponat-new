import { initPageLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AuthErrorPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { error?: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('auth');
  const code = searchParams.error;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">{t('errorTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {code ? t('errors.generic', { code }) : t('errors.unknown')}
        </p>
        <Link
          className="mt-6 inline-block text-sm font-medium text-primary underline"
          href={`/${params.locale}/login`}
        >
          {t('backToLogin')}
        </Link>
      </div>
    </main>
  );
}
