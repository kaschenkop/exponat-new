import { create } from 'zustand';

type CollaborationState = {
  connected: boolean;
  lastMessage: string | null;
  lastProjectId: string | null;
  setConnected: (v: boolean) => void;
  pushEvent: (raw: string) => void;
};

export const useProjectCollaborationStore = create<CollaborationState>((set) => ({
  connected: false,
  lastMessage: null,
  lastProjectId: null,
  setConnected: (v) => set({ connected: v }),
  pushEvent: (raw) => {
    let projectId: string | null = null;
    try {
      const j = JSON.parse(raw) as { projectId?: string };
      projectId = j.projectId ?? null;
    } catch {
      projectId = null;
    }
    set({ lastMessage: raw, lastProjectId: projectId });
  },
}));
