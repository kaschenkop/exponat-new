import { create } from 'zustand';

import type { ProjectFilters } from '@/features/projects/types/project.types';

type ProjectUIState = {
  filters: ProjectFilters;
  wizardStep: number;
  setFilters: (f: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  setWizardStep: (n: number) => void;
};

const defaultFilters: ProjectFilters = {
  sortBy: 'updatedAt',
  sortDir: 'desc',
};

export const useProjectStore = create<ProjectUIState>((set) => ({
  filters: defaultFilters,
  wizardStep: 0,
  setFilters: (f) =>
    set((s) => ({
      filters: { ...s.filters, ...f },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  setWizardStep: (n) => set({ wizardStep: n }),
}));
