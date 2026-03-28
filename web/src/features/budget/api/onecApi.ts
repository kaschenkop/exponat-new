import { budgetGet, budgetPost } from './budgetClient';

export interface SyncLogEntry {
  id: string;
  level: string;
  message: string;
  timestamp: string;
}

export interface IntegrationState {
  connected: boolean;
  lastSyncAt: string | null;
  mappingCount: number;
  baseUrl: string;
  logs: SyncLogEntry[];
}

export const onecApi = {
  getState: (budgetId: string) =>
    budgetGet<IntegrationState>(`/${budgetId}/integration`),

  sync: (budgetId: string) =>
    budgetPost<IntegrationState>(`/${budgetId}/integration/sync`),
};
