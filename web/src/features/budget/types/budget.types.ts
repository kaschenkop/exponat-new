export type BudgetStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type Currency = 'RUB' | 'USD' | 'EUR';

export interface BudgetSettings {
  requireApproval: boolean;
  approvalThreshold: number;
  autoSyncWith1C: boolean;
  notifyOnThreshold: boolean;
}

export interface Budget {
  id: string;
  projectId: string;
  organizationId: string;
  name: string;
  description: string;
  status: BudgetStatus;
  period: BudgetPeriod;
  currency: Currency;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  totalPlanned: number;
  totalSpent: number;
  totalApproved: number;
  totalPending: number;
  totalRemaining: number;
  progressPercent: number;
  warningThreshold: number;
  criticalThreshold: number;
  isOverBudget: boolean;
  managerId: string;
  managerName: string;
  settings: BudgetSettings;
}

export interface BudgetSummary {
  totalBudgets: number;
  totalPlanned: number;
  totalSpent: number;
  totalRemaining: number;
  averageProgress: number;
  overBudgetCount: number;
  activeCount: number;
}

export type BudgetView =
  | 'overview'
  | 'categories'
  | 'expenses'
  | 'approvals'
  | 'analytics'
  | 'integration';
