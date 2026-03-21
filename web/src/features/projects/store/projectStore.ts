import type { ProjectType } from '@/features/projects/types/project.types';
import { create } from 'zustand';

type ProjectState = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  projects: ProjectType[];
  setProjects: (projects: ProjectType[]) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  projects: [],
  setProjects: (projects) => set({ projects }),
}));
