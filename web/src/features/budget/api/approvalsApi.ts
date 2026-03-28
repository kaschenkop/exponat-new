import { budgetGet, budgetPost } from './budgetClient';
import type { ApprovalRequest } from '../types/approval.types';

export interface ApprovalsResponse {
  items: ApprovalRequest[];
}

export const approvalsApi = {
  list: (budgetId: string, status?: string) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return budgetGet<ApprovalsResponse>(`/${budgetId}/approvals${q}`);
  },

  approve: (budgetId: string, approvalId: string, comment: string) =>
    budgetPost(`/${budgetId}/approvals/${approvalId}/approve`, { comment }),

  reject: (budgetId: string, approvalId: string, reason: string) =>
    budgetPost(`/${budgetId}/approvals/${approvalId}/reject`, { reason }),
};
