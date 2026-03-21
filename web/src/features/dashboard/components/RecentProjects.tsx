'use client';

import { useRecentProjects } from '@/features/dashboard/hooks/useRecentProjects';
import { formatCurrencyRub } from '@/features/dashboard/utils/dashboardHelpers';
import type { DashboardProjectStatus } from '@/features/dashboard/types/dashboard.types';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

function statusBadgeClass(status: DashboardProjectStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
    case 'draft':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-400';
    case 'archived':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function RecentProjects(): React.ReactElement {
  const t = useTranslations('dashboard.home.projects');
  const locale = useLocale();
  const router = useRouter();
  const { data, isPending, isError, refetch } = useRecentProjects();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">{t('error')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('columns.status')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('columns.dates')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('columns.budget')}</TableHead>
              <TableHead className="text-right">{t('columns.team')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(project.status)}`}
                  >
                    {t(`status.${project.status}`)}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {format(parseISO(project.startDate), 'd MMM yyyy', {
                    locale: locale === 'ru' ? ru : undefined,
                  })}{' '}
                  —{' '}
                  {format(parseISO(project.endDate), 'd MMM yyyy', {
                    locale: locale === 'ru' ? ru : undefined,
                  })}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatCurrencyRub(project.totalBudget)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{project.teamSize}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
