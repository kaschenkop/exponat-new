import { initPageLocale } from '@/i18n/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function LandingPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('landing');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard">{t('ctaDashboard')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">{t('ctaLogin')}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
