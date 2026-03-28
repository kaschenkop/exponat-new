export interface Category {
  id: string;
  budgetId: string;
  parentId: string | null;
  path: string;
  level: number;
  order: number;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  plannedAmount: number;
  spentAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  remainingAmount: number;
  children: Category[];
  hasChildren: boolean;
  childrenCount: number;
  progressPercent: number;
  isOverBudget: boolean;
  onecId: string | null;
  onecSynced: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryNode extends Category {
  expanded: boolean;
  selected: boolean;
}
