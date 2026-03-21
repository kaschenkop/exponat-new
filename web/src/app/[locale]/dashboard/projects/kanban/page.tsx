import { initPageLocale } from '@/i18n/server';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { ProjectKanban } from '@/features/projects/components/ProjectKanban';
import { getTranslations } from 'next-intl/server';

export default async function ProjectsKanbanPage({
  params,
}: {
  params: { locale: string };
}): Promise<React.ReactElement> {
  initPageLocale(params.locale);
  const t = await getTranslations('projects');

  return (
    <ProjectsShell title={t('kanban.title')} showCreate>
      <ProjectKanban />
    </ProjectsShell>
  );
}
