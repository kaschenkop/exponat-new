'use client';

import type { ProjectFilters as PF } from '@/features/projects/types/project.types';
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

const STATUS_LIST = [
  'draft',
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
] as const;

const TYPES = ['museum', 'corporate', 'expo_forum', 'other'] as const;

export function ProjectFilters({
  filters,
  onFiltersChange,
  onReset,
}: {
  filters: PF;
  onFiltersChange: (f: Partial<PF>) => void;
  onReset: () => void;
}): React.ReactElement {
  const t = useTranslations('projects');

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="project-search">{t('search')}</Label>
          <Input
            id="project-search"
            placeholder={t('searchPlaceholder')}
            value={filters.search ?? ''}
            onChange={(e) => onFiltersChange({ search: e.target.value, page: 1 })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('sortBy')}</Label>
          <Select
            value={filters.sortBy ?? 'updatedAt'}
            onValueChange={(v) => onFiltersChange({ sortBy: v, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">{t('sort.updatedAt')}</SelectItem>
              <SelectItem value="name">{t('sort.name')}</SelectItem>
              <SelectItem value="startDate">{t('sort.startDate')}</SelectItem>
              <SelectItem value="totalBudget">{t('sort.budget')}</SelectItem>
              <SelectItem value="progress">{t('sort.progress')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('sortOrder')}</Label>
          <Select
            value={filters.sortOrder ?? 'desc'}
            onValueChange={(v) =>
              onFiltersChange({ sortOrder: v as 'asc' | 'desc', page: 1 })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t('sort.desc')}</SelectItem>
              <SelectItem value="asc">{t('sort.asc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>{t('filterStatus')}</Label>
          <Select
            value={(filters.status?.[0] as string) ?? 'all'}
            onValueChange={(v) =>
              onFiltersChange({
                status: v === 'all' ? undefined : [v as (typeof STATUS_LIST)[number]],
                page: 1,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {STATUS_LIST.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('filterType')}</Label>
          <Select
            value={(filters.type?.[0] as string) ?? 'all'}
            onValueChange={(v) =>
              onFiltersChange({
                type: v === 'all' ? undefined : [v as (typeof TYPES)[number]],
                page: 1,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {TYPES.map((ty) => (
                <SelectItem key={ty} value={ty}>
                  {t(`type.${ty}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateFrom">{t('dateFrom')}</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) =>
              onFiltersChange({ dateFrom: e.target.value || undefined, page: 1 })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTo">{t('dateTo')}</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) =>
              onFiltersChange({ dateTo: e.target.value || undefined, page: 1 })
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onReset}>
          {t('resetFilters')}
        </Button>
      </div>
    </div>
  );
}
