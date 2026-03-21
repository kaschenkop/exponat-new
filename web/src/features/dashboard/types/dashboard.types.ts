export interface DashboardStats {
  activeProjects: {
    count: number;
    change: number;
  };
  totalBudget: {
    amount: number;
    currency: 'RUB';
    change: number;
  };
  exhibits: {
    count: number;
    change: number;
  };
  participants: {
    count: number;
    change: number;
  };
}

export interface BudgetTrendData {
  month: string;
  planned: number;
  actual: number;
}

export type DashboardEventType =
  | 'installation'
  | 'opening'
  | 'closing'
  | 'dismantling';

export interface DashboardEvent {
  id: string;
  type: DashboardEventType;
  title: string;
  date: string;
  location: string;
  projectId: string;
}

export type ActivityEntityType =
  | 'project'
  | 'budget'
  | 'exhibit'
  | 'participant';

export interface DashboardActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entityType: ActivityEntityType;
  entityId: string;
  timestamp: string;
}

export type DashboardProjectStatus = 'draft' | 'active' | 'archived';

export interface DashboardProject {
  id: string;
  name: string;
  status: DashboardProjectStatus;
  startDate: string;
  endDate: string;
  totalBudget: number;
  teamSize: number;
}
