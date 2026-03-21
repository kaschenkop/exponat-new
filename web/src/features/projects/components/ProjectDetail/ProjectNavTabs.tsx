'use client';

import { Link } from '@/i18n/navigation';
import type { Project } from '@/features/projects/types/project.types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, ClipboardList, ListTodo, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

export type ProjectTab = 'overview' | 'tasks';

interface ProjectNavTabsProps {
  project: Project
  activeTab: ProjectTab
  onDeleteClick?: () => void
}

export function ProjectNavTabs({
  project,
  activeTab,
  onDeleteClick,
}: ProjectNavTabsProps): React.ReactElement {
  const t = useTranslations('projects');
  const tt = useTranslations('tasks');

  const tabs: { key: ProjectTab; label: string; href: string; icon: typeof ClipboardList }[] = [
    {
      key: 'overview',
      label: t('detail.tabs.overview'),
      href: `/dashboard/projects/${project.id}`,
      icon: ClipboardList,
    },
    {
      key: 'tasks',
      label: tt('title'),
      href: `/dashboard/projects/${project.id}/tasks`,
      icon: ListTodo,
    },
  ];

  return (
    <div className="border-b bg-white">
      <div className="px-6 pt-4">
        {/* Top row: back + project name + actions */}
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1.5">
            <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                {t('detail.back')}
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <Badge variant="secondary">{t(`status.${project.status}`)}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/projects/${project.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden />
                {t('detail.edit')}
              </Link>
            </Button>
            {onDeleteClick && (
              <Button variant="destructive" size="sm" type="button" onClick={onDeleteClick}>
                {t('detail.delete')}
              </Button>
            )}
          </div>
        </div>

        {/* Tab row */}
        <nav className="-mb-px flex gap-1" aria-label="Project tabs">
          {tabs.map(({ key, label, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
