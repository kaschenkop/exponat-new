import type { Currency } from './budget.types';

export type ApprovalAction = 'approve' | 'reject' | 'request_changes';
export type ApprovalLevel = 1 | 2 | 3;

export interface ApprovalHistoryItem {
  id: string;
  action: ApprovalAction;
  userId: string;
  userName: string;
  userAvatar: string | null;
  comment: string;
  timestamp: string;
}

export interface ApprovalRequest {
  id: string;
  expenseId: string;
  budgetId: string;
  expenseTitle: string;
  expenseAmount: number;
  expenseCurrency: Currency;
  categoryName: string;
  vendor: string;
  level: ApprovalLevel;
  requiredApprovers: string[];
  currentApprover: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  dueDate: string;
  respondedAt: string | null;
  history: ApprovalHistoryItem[];
}

export interface ApprovalRule {
  id: string;
  condition: 'amount_above' | 'category_is' | 'vendor_is';
  value: string | number;
  approvers: string[];
  level: ApprovalLevel;
}

export interface ApprovalWorkflow {
  id: string;
  budgetId: string;
  name: string;
  rules: ApprovalRule[];
  requireSequentialApproval: boolean;
  autoApproveBelow: number;
  slaHours: number;
  enabled: boolean;
}
