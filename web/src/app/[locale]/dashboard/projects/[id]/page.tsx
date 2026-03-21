import { initPageLocale } from '@/i18n/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function DashboardProjectDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('dashboard.home.projectDetail');

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{t('eyebrow')}</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
          {t('title', { id: params.id })}
        </h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard/projects">{t('back')}</Link>
      </Button>
    </div>
  );
}
