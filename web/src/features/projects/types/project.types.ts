export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type ProjectKind = 'museum' | 'corporate' | 'expo_forum' | 'other';

export interface ProjectLocation {
  venue: string;
  address: string;
  city: string;
  country: string;
}

export interface ProjectTeamMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role:
    | 'manager'
    | 'coordinator'
    | 'designer'
    | 'logistics'
    | 'other'
    | string;
  permissions: string[];
  joinedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: ProjectKind;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  totalBudget: number;
  spentBudget: number;
  currency: 'RUB';
  location: ProjectLocation;
  /** API may send JSON null when Go slice is nil */
  team: ProjectTeamMember[] | null;
  managerId: string;
  managerName?: string;
  progress: number;
  exhibitsCount: number;
  participantsCount: number;
  tags: string[] | null;
  customFields?: Record<string, unknown>;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  dependencies: string[];
  orderNum: number;
}

export interface ProjectCreateInput {
  name: string;
  description: string;
  type: ProjectKind;
  startDate: string;
  endDate: string;
  totalBudget: number;
  location: ProjectLocation;
  managerId: string;
  teamMemberIds: string[];
}

export interface ProjectUpdateInput extends Partial<ProjectCreateInput> {
  status?: ProjectStatus;
  spentBudget?: number;
  progress?: number;
  tags?: string[];
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus[];
  type?: ProjectKind[];
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  managerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProjectsListResponse {
  data: Project[];
  meta: { total: number; page: number; limit: number };
}

export interface ProjectChange {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  changeType: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}
