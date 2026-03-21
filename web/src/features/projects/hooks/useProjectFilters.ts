'use client';

import { useProjectStore } from '@/features/projects/store/projectStore';

export function useProjectFilters() {
  const filters = useProjectStore((s) => s.filters);
  const setFilters = useProjectStore((s) => s.setFilters);
  const resetFilters = useProjectStore((s) => s.resetFilters);
  return { filters, setFilters, resetFilters };
}
