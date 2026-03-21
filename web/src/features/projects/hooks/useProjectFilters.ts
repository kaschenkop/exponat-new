'use client';

import { useProjectStore } from '@/features/projects/store/projectStore';
import type { ProjectFilters } from '@/features/projects/types/project.types';
import { useCallback, useMemo } from 'react';

export function useProjectFilters(): {
  filters: ProjectFilters;
  setFilters: (f: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  setSearch: (search: string) => void;
} {
  const filters = useProjectStore((s) => s.filters);
  const setFilters = useProjectStore((s) => s.setFilters);
  const resetFilters = useProjectStore((s) => s.resetFilters);

  const setSearch = useCallback(
    (search: string) => {
      setFilters({ search: search || undefined });
    },
    [setFilters],
  );

  return useMemo(
    () => ({
      filters,
      setFilters,
      resetFilters,
      setSearch,
    }),
    [filters, setFilters, resetFilters, setSearch],
  );
}
