'use client';

import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { ProjectsShell } from '@/features/projects/components/ProjectsShell';
import { useProjectStore } from '@/features/projects/store/projectStore';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function NewProjectPage(): React.ReactElement {
  const t = useTranslations('projects');
  const setStep = useProjectStore((s) => s.setWizardStep);

  useEffect(() => {
    setStep(0);
  }, [setStep]);

  return (
    <ProjectsShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{t('newPage.title')}</h1>
            <p className="mt-1 text-muted-foreground">{t('newPage.subtitle')}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/projects">{t('detail.back')}</Link>
          </Button>
        </div>
        <ProjectForm />
      </div>
    </ProjectsShell>
  );
}
