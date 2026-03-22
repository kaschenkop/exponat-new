import { create } from 'zustand';
import type { TaskFilters, TaskViewType } from '@/features/projects/types/task.types';

interface TaskUIState {
  activeView: TaskViewType
  filters: TaskFilters
  selectedTaskId: string | null
  setActiveView: (view: TaskViewType) => void
  setFilters: (f: Partial<TaskFilters>) => void
  resetFilters: () => void
  setSelectedTaskId: (id: string | null) => void
}

const defaultFilters: TaskFilters = {
  page: 1,
  limit: 200,
  sortBy: 'orderNum',
  sortOrder: 'asc',
};

export const useTaskStore = create<TaskUIState>((set) => ({
  activeView: 'kanban',
  filters: defaultFilters,
  selectedTaskId: null,
  setActiveView: (view) => set({ activeView: view }),
  setFilters: (f) =>
    set((s) => ({
      filters: { ...s.filters, ...f },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
}));
