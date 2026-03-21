import { create } from 'zustand';
import type { ProjectFilters } from '@/features/projects/types/project.types';

type ProjectUIState = {
  filters: ProjectFilters;
  setFilters: (f: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
};

const defaultFilters: ProjectFilters = {
  page: 1,
  limit: 12,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

export const useProjectStore = create<ProjectUIState>((set) => ({
  filters: defaultFilters,
  setFilters: (f) =>
    set((s) => ({
      filters: {
        ...s.filters,
        ...f,
        page: f.page !== undefined ? f.page : (s.filters.page ?? 1),
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
