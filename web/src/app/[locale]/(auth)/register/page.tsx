import { initPageLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';

export default async function RegisterPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('auth');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-display text-2xl font-semibold">{t('register')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('formPlaceholder')}</p>
    </main>
  );
}
