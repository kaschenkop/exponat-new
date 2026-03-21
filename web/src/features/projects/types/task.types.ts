export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done' | 'cancelled'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskViewType = 'kanban' | 'gantt' | 'list' | 'calendar'

export interface TaskTag {
  label: string
  color: string
}

export interface SubtaskSummary {
  completed: number
  total: number
}

export interface Task {
  id: string
  projectId: string
  taskKey: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  assigneeName: string
  groupName: string
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  progress: number
  tags: TaskTag[]
  dependencies: string[]
  orderNum: number
  isAtRisk: boolean
  subtasks: SubtaskSummary | null
  commentsCount: number
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  isCompleted: boolean
  orderNum: number
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  userName: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  date: string
  description: string
}

export interface TaskCreateInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  groupName?: string
  startDate?: string
  dueDate?: string
  tags?: TaskTag[]
  dependencies?: string[]
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string | null
  groupName?: string
  startDate?: string | null
  dueDate?: string | null
  progress?: number
  tags?: TaskTag[]
  dependencies?: string[]
  orderNum?: number
  isAtRisk?: boolean
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignee?: string[]
  group?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface TasksListResponse {
  data: Task[]
  meta: { total: number; page: number; limit: number }
}

export interface TaskReorderInput {
  taskId: string
  status: TaskStatus
  orderNum: number
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: '#6B7280',
  in_progress: '#1A73E8',
  review: '#9C27B0',
  done: '#34A853',
  cancelled: '#9E9E9E',
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#EA4335',
  medium: '#FBBC04',
  low: '#34A853',
}

export const TASK_STATUSES: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done']

export const BOARD_BG = '#F8F9FA'
export const BORDER_COLOR = '#E0E0E0'
export const MILESTONE_COLOR = '#FBBC04'
