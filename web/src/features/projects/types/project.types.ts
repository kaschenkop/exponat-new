export type ProjectStatus = 'draft' | 'active' | 'archived';

export type ProjectType = {
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
};
