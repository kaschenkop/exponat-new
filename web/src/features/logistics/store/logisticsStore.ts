'use client';

import { create } from 'zustand';

type ExhibitView = 'grid' | 'list';

interface LogisticsStore {
  exhibitView: ExhibitView;
  setExhibitView: (v: ExhibitView) => void;
}

export const useLogisticsStore = create<LogisticsStore>((set) => ({
  exhibitView: 'grid',
  setExhibitView: (exhibitView) => set({ exhibitView }),
}));
