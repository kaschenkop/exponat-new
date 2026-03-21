import { create } from 'zustand';

type CollaborationState = {
  connected: boolean;
  lastType: string | null;
  lastPayload: unknown;
  setConnected: (v: boolean) => void;
  pushEvent: (type: string, payload: unknown) => void;
};

export const useProjectCollaborationStore = create<CollaborationState>(
  (set) => ({
    connected: false,
    lastType: null,
    lastPayload: null,
    setConnected: (v) => set({ connected: v }),
    pushEvent: (type, payload) =>
      set({ lastType: type, lastPayload: payload }),
  }),
);
