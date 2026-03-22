'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ProjectsShell({
  title,
  children,
  showCreate,
}: {
  title: string;
  children: React.ReactNode;
  showCreate?: boolean;
}): React.ReactElement {
  const t = useTranslations('projects');
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {showCreate ? (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              {t('create')}
            </Link>
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
