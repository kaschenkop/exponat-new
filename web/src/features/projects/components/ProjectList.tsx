'use client';

import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectFilters } from '@/features/projects/hooks/useProjectFilters';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectFilters } from '@/features/projects/components/ProjectFilters';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function ProjectList(): React.ReactElement {
  const t = useTranslations('projects');
  const { filters, setFilters, resetFilters } = useProjectFilters();
  const { data, isLoading, isError, error, refetch } = useProjects(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        role="alert"
      >
        <p className="font-medium">{t('loadError')}</p>
        <p className="mt-1">{error?.message}</p>
        <Button className="mt-3" type="button" variant="outline" onClick={() => refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="space-y-6">
        <ProjectFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />
        <div className="rounded-lg border border-dashed py-16 text-center">
          <h3 className="text-lg font-semibold">{t('emptyTitle')}</h3>
          <p className="mt-2 text-muted-foreground">{t('emptyDescription')}</p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/projects/new">{t('create')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(data.meta.total / (data.meta.limit || 1)),
  );

  return (
    <div className="space-y-6">
      <ProjectFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.06 },
          },
        }}
      >
        {data.data.map((project) => (
          <motion.div
            key={project.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={(filters.page ?? 1) <= 1}
            onClick={() =>
              setFilters({ page: Math.max(1, (filters.page ?? 1) - 1) })
            }
          >
            {t('prev')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {filters.page ?? 1} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() =>
              setFilters({
                page: Math.min(totalPages, (filters.page ?? 1) + 1),
              })
            }
          >
            {t('next')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
