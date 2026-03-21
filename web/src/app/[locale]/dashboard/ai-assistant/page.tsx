import { initPageLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';

export default async function AiAssistantPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('nav');

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('aiAssistant')}</h1>
    </div>
  );
}
