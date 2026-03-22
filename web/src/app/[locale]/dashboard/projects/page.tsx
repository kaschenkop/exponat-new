import { initPageLocale } from '@/i18n/server';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { getTranslations } from 'next-intl/server';

export default async function ProjectsPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('projects');

  return (
    <ProjectsShell title={t('title')} showCreate>
      <ProjectList />
    </ProjectsShell>
  );
}
