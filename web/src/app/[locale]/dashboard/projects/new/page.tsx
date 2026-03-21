import { initPageLocale } from '@/i18n/server';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { getTranslations } from 'next-intl/server';

export default async function NewProjectPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('projects');

  return (
    <ProjectsShell title={t('create')}>
      <ProjectForm />
    </ProjectsShell>
  );
}
