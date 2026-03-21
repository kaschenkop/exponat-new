export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type ProjectType = 'museum' | 'corporate' | 'expo_forum' | 'other';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  totalBudget: number;
  spentBudget: number;
  currency: 'RUB';
  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
  };
  team: ProjectTeamMember[];
  managerId: string;
  progress: number;
  exhibitsCount: number;
  participantsCount: number;
  tags: string[];
  customFields: Record<string, unknown>;
  phases?: ProjectPhase[];
  files?: ProjectFile[];
  activity?: ProjectActivityItem[];
}

export interface ProjectTeamMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'manager' | 'coordinator' | 'designer' | 'logistics' | 'other';
  permissions: string[];
  joinedAt: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  dependencies: string[];
  sortOrder: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
  createdAt: string;
}

export interface ProjectActivityItem {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
}

export interface ProjectCreateInput {
  name: string;
  description: string;
  type: ProjectType;
  startDate: string;
  endDate: string;
  totalBudget: number;
  location: Project['location'];
  managerId: string;
  teamMemberIds: string[];
}

export interface ProjectUpdateInput extends Partial<ProjectCreateInput> {
  status?: ProjectStatus;
  spentBudget?: number;
  progress?: number;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus[];
  type?: ProjectType[];
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  managerId?: string;
  sortBy?: 'createdAt' | 'name' | 'totalBudget' | 'endDate' | 'startDate' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
}
