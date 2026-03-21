'use client';

import { useProjectFilters } from '@/features/projects/hooks/useProjectFilters';
import type { ProjectStatus, ProjectType } from '@/features/projects/types/project.types';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const STATUSES: ProjectStatus[] = [
  'draft',
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
];

const TYPES: ProjectType[] = ['museum', 'corporate', 'expo_forum', 'other'];

export function ProjectFilters(): React.ReactElement {
  const t = useTranslations('projects');
  const { filters, setFilters, resetFilters, setSearch } = useProjectFilters();
  const [q, setQ] = useState(filters.search ?? '');
  const debounced = useDebounce(q, 300);

  useEffect(() => {
    setQ(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    setSearch(debounced);
  }, [debounced, setSearch]);

  const toggleStatus = (s: ProjectStatus) => {
    const cur = filters.status ?? [];
    const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
    setFilters({ status: next.length ? next : undefined });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="project-search">{t('filters.search')}</Label>
          <Input
            id="project-search"
            value={q}
            placeholder={t('filters.searchPlaceholder')}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('filters.sortBy')}</Label>
          <Select
            value={filters.sortBy ?? 'updatedAt'}
            onValueChange={(v) =>
              setFilters({
                sortBy: v as typeof filters.sortBy,
              })
            }
          >
            <SelectTrigger className="w-full min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">{t('filters.sort.updatedAt')}</SelectItem>
              <SelectItem value="name">{t('filters.sort.name')}</SelectItem>
              <SelectItem value="totalBudget">{t('filters.sort.budget')}</SelectItem>
              <SelectItem value="endDate">{t('filters.sort.endDate')}</SelectItem>
              <SelectItem value="startDate">{t('filters.sort.startDate')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('filters.sortDir')}</Label>
          <Select
            value={filters.sortDir ?? 'desc'}
            onValueChange={(v) => setFilters({ sortDir: v as 'asc' | 'desc' })}
          >
            <SelectTrigger className="w-full min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t('filters.dir.desc')}</SelectItem>
              <SelectItem value="asc">{t('filters.dir.asc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('filters.status')}</Label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const active = filters.status?.includes(s);
            return (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                onClick={() => toggleStatus(s)}
              >
                {t(`status.${s}`)}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>{t('filters.type')}</Label>
          <Select
            value={filters.type?.[0] ?? 'all'}
            onValueChange={(v) =>
              setFilters({
                type: v === 'all' ? undefined : ([v] as ProjectType[]),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
              {TYPES.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {t(`type.${tp}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="df">{t('filters.dateFrom')}</Label>
          <Input
            id="df"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dt">{t('filters.dateTo')}</Label>
          <Input
            id="dt"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="bmin">{t('filters.budgetMin')}</Label>
            <Input
              id="bmin"
              type="number"
              min={0}
              value={filters.budgetMin ?? ''}
              onChange={(e) =>
                setFilters({
                  budgetMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmax">{t('filters.budgetMax')}</Label>
            <Input
              id="bmax"
              type="number"
              min={0}
              value={filters.budgetMax ?? ''}
              onChange={(e) =>
                setFilters({
                  budgetMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
          {t('filters.reset')}
        </Button>
      </div>
    </div>
  );
}
