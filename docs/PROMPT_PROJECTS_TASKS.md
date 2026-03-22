# Промпт: Модуль «Задачи проекта» — Kanban / Gantt / Список / Календарь

## Контекст

Проект **Экспонат** — SaaS-платформа управления выставками. Сейчас в модуле «Проекты» реализовано управление проектами (CRUD, список, детальная страница с фазами, командой, бюджетом, активностью). Есть упрощённый Kanban (перетаскивание проектов между статусами) и простой Gantt (фазы проекта в виде полос).

**Но по прототипу Figma** (https://www.figma.com/make/L1VGQ0EGt8zhTaVzinZpJU/SaaS-Dashboard-Design) внутри каждого проекта должна быть полноценная система **управления задачами** с 4 представлениями и переключением между ними.

**Прототип содержит исходный код компонентов** — доступен через Figma MCP:
- `src/app/pages/ProjectsKanban.tsx` — страница Kanban с задачами
- `src/app/pages/ProjectsGantt.tsx` — страница Gantt с группами задач, milestone-ами
- `src/app/components/ProjectsTopBar.tsx` — переключатель Kanban/Gantt/List/Calendar + фильтры
- `src/app/components/TaskCard.tsx` — карточка задачи
- `src/app/components/KanbanColumn.tsx` — колонка Kanban
- `src/app/components/GanttTaskRow.tsx` — строка задачи в панели Gantt
- `src/app/components/GanttTimeline.tsx` — визуализация timeline Gantt
- `src/app/components/GanttBottomBar.tsx` — нижняя панель Gantt (зум, critical path, экспорт)

---

## Что нужно реализовать

### Общая идея

Внутри каждого проекта (по маршруту `/dashboard/projects/:id/tasks`) — полноценная доска задач с 4 представлениями:

1. **Kanban** — колонки по статусу задачи (Backlog → In Progress → Review → Done), drag-and-drop
2. **Gantt** — диаграмма с группами задач, зум (Day/Week/Month/Quarter), milestone-ы, линия «сегодня», зависимости, critical path
3. **Список (List)** — таблица задач с сортировкой и фильтрацией
4. **Календарь (Calendar)** — задачи по датам в календарной сетке (месяц/неделя)

Переключение между ними через **Tab Bar** (Kanban | Gantt | List | Calendar) в верхней панели.

---

## 1. База данных — миграция `004_project_tasks.sql`

```sql
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_key VARCHAR(20) NOT NULL,              -- "EXP-142" (автоинкремент по проекту)
    title VARCHAR(500) NOT NULL,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'backlog'
        CHECK (status IN ('backlog', 'in_progress', 'review', 'done', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('high', 'medium', 'low')),

    assignee_id UUID REFERENCES users(id),
    group_name VARCHAR(100),                    -- "Planning", "Logistics", "Marketing", etc.

    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,

    progress INTEGER NOT NULL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),

    tags JSONB NOT NULL DEFAULT '[]'::jsonb,    -- [{"label":"Logistics","color":"#1A73E8"}]
    dependencies UUID[] NOT NULL DEFAULT '{}',   -- task IDs
    order_num INTEGER NOT NULL DEFAULT 0,        -- сортировка внутри колонки/группы

    is_at_risk BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_tasks_status ON project_tasks(project_id, status);
CREATE INDEX idx_tasks_assignee ON project_tasks(assignee_id);
CREATE INDEX idx_tasks_due ON project_tasks(project_id, due_date);
CREATE INDEX idx_tasks_group ON project_tasks(project_id, group_name);

-- Подзадачи
CREATE TABLE IF NOT EXISTS project_subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subtasks_task ON project_subtasks(task_id);

-- Комментарии к задачам
CREATE TABLE IF NOT EXISTS project_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task ON project_task_comments(task_id, created_at);

-- Milestone-ы проекта
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    milestone_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON project_milestones(project_id, milestone_date);

-- Sequence для task_key
CREATE SEQUENCE IF NOT EXISTS task_key_seq;

-- Trigger: auto updated_at
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed demo задачи для проекта aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
INSERT INTO project_tasks (project_id, task_key, title, description, status, priority, assignee_id, group_name, start_date, due_date, progress, tags, order_num)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-101', 'Согласование плана зала Б', 'Проверить и утвердить планировку с координатором площадки', 'backlog', 'high', '22222222-2222-2222-2222-222222222222', 'Логистика', '2026-03-20', '2026-03-28', 0, '[{"label":"Логистика","color":"#1A73E8"},{"label":"Срочно","color":"#EA4335"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-102', 'Дизайн стендов для спонсоров', 'Создать 3D макеты и техническую документацию', 'in_progress', 'high', '33333333-3333-3333-3333-333333333333', 'Дизайн', '2026-03-15', '2026-03-24', 65, '[{"label":"Дизайн","color":"#34A853"},{"label":"Срочно","color":"#EA4335"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-103', 'Проверка страховой документации вендоров', 'Проверить актуальность сертификатов', 'review', 'high', '22222222-2222-2222-2222-222222222222', 'Юридическое', '2026-03-10', '2026-03-22', 90, '[{"label":"Юридическое","color":"#F57C00"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-104', 'Подписание договора аренды', '', 'done', 'high', '22222222-2222-2222-2222-222222222222', 'Юридическое', '2026-03-01', '2026-03-15', 100, '[{"label":"Юридическое","color":"#F57C00"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-105', 'Рассылка приглашений VIP-спикерам', 'Подготовить и отправить персональные приглашения', 'backlog', 'medium', '33333333-3333-3333-3333-333333333333', 'Маркетинг', '2026-03-25', '2026-03-30', 0, '[{"label":"Маркетинг","color":"#9C27B0"}]'::jsonb, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-106', 'Установка Wi-Fi инфраструктуры', '', 'in_progress', 'high', '33333333-3333-3333-3333-333333333333', 'Техническое', '2026-03-18', '2026-03-25', 55, '[{"label":"Техническое","color":"#00BCD4"}]'::jsonb, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-107', 'Запуск сайта мероприятия', '', 'done', 'high', '33333333-3333-3333-3333-333333333333', 'Маркетинг', '2026-03-05', '2026-03-12', 100, '[{"label":"Техническое","color":"#00BCD4"},{"label":"Маркетинг","color":"#9C27B0"}]'::jsonb, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-108', 'Согласование кейтеринга', 'Утвердить договор с выбранной компанией', 'backlog', 'high', '22222222-2222-2222-2222-222222222222', 'Логистика', '2026-03-20', '2026-03-25', 0, '[{"label":"Логистика","color":"#1A73E8"},{"label":"Юридическое","color":"#F57C00"}]'::jsonb, 3)
ON CONFLICT DO NOTHING;

INSERT INTO project_milestones (project_id, title, milestone_date) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Старт проекта', '2026-03-01'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Площадка утверждена', '2026-03-20'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Запуск сайта', '2026-04-02'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Монтаж завершён', '2026-05-23'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Открытие выставки', '2026-05-25')
ON CONFLICT DO NOTHING;
```

---

## 2. Backend (Go / Gin) — `backend/services/projects/`

### 2.1 Модели — `internal/models/task.go`

```go
type TaskStatus string
const (
    TaskStatusBacklog    TaskStatus = "backlog"
    TaskStatusInProgress TaskStatus = "in_progress"
    TaskStatusReview     TaskStatus = "review"
    TaskStatusDone       TaskStatus = "done"
    TaskStatusCancelled  TaskStatus = "cancelled"
)

type TaskPriority string
const (
    TaskPriorityHigh   TaskPriority = "high"
    TaskPriorityMedium TaskPriority = "medium"
    TaskPriorityLow    TaskPriority = "low"
)

type TaskTag struct {
    Label string `json:"label"`
    Color string `json:"color"`
}

type Task struct {
    ID           string       `json:"id"`
    ProjectID    string       `json:"projectId"`
    TaskKey      string       `json:"taskKey"`
    Title        string       `json:"title"`
    Description  string       `json:"description"`
    Status       TaskStatus   `json:"status"`
    Priority     TaskPriority `json:"priority"`
    AssigneeID   *string      `json:"assigneeId"`
    AssigneeName string       `json:"assigneeName,omitempty"`
    GroupName    string       `json:"groupName"`
    StartDate    *string      `json:"startDate"`
    DueDate      *string      `json:"dueDate"`
    CompletedAt  *string      `json:"completedAt"`
    Progress     int          `json:"progress"`
    Tags         []TaskTag    `json:"tags"`
    Dependencies []string     `json:"dependencies"`
    OrderNum     int          `json:"orderNum"`
    IsAtRisk     bool         `json:"isAtRisk"`
    Subtasks     *SubtaskSummary `json:"subtasks,omitempty"`
    CommentsCount int         `json:"commentsCount"`
    CreatedAt    string       `json:"createdAt"`
    UpdatedAt    string       `json:"updatedAt"`
}

type SubtaskSummary struct {
    Completed int `json:"completed"`
    Total     int `json:"total"`
}

type Subtask struct {
    ID          string `json:"id"`
    TaskID      string `json:"taskId"`
    Title       string `json:"title"`
    IsCompleted bool   `json:"isCompleted"`
    OrderNum    int    `json:"orderNum"`
}

type TaskComment struct {
    ID        string `json:"id"`
    TaskID    string `json:"taskId"`
    UserID    string `json:"userId"`
    UserName  string `json:"userName,omitempty"`
    Content   string `json:"content"`
    CreatedAt string `json:"createdAt"`
    UpdatedAt string `json:"updatedAt"`
}

type Milestone struct {
    ID          string `json:"id"`
    ProjectID   string `json:"projectId"`
    Title       string `json:"title"`
    Date        string `json:"date"`
    Description string `json:"description,omitempty"`
}

type TaskCreateInput struct {
    Title       string       `json:"title" binding:"required"`
    Description string       `json:"description"`
    Status      TaskStatus   `json:"status"`
    Priority    TaskPriority `json:"priority"`
    AssigneeID  *string      `json:"assigneeId"`
    GroupName   string       `json:"groupName"`
    StartDate   *string      `json:"startDate"`
    DueDate     *string      `json:"dueDate"`
    Tags        []TaskTag    `json:"tags"`
    Dependencies []string    `json:"dependencies"`
}

type TaskUpdateInput struct {
    Title        *string      `json:"title"`
    Description  *string      `json:"description"`
    Status       *TaskStatus  `json:"status"`
    Priority     *TaskPriority `json:"priority"`
    AssigneeID   *string      `json:"assigneeId"`
    GroupName    *string      `json:"groupName"`
    StartDate    *string      `json:"startDate"`
    DueDate      *string      `json:"dueDate"`
    Progress     *int         `json:"progress"`
    Tags         *[]TaskTag   `json:"tags"`
    Dependencies *[]string    `json:"dependencies"`
    OrderNum     *int         `json:"orderNum"`
    IsAtRisk     *bool        `json:"isAtRisk"`
}

type TaskFilters struct {
    Status    []TaskStatus   `form:"status"`
    Priority  []TaskPriority `form:"priority"`
    Assignee  []string       `form:"assignee"`
    GroupName string         `form:"group"`
    Search    string         `form:"search"`
    DateFrom  string         `form:"dateFrom"`
    DateTo    string         `form:"dateTo"`
    SortBy    string         `form:"sortBy"`
    SortOrder string         `form:"sortOrder"`
    Page      int            `form:"page"`
    Limit     int            `form:"limit"`
}

type TaskReorderInput struct {
    TaskID    string     `json:"taskId" binding:"required"`
    Status    TaskStatus `json:"status" binding:"required"`
    OrderNum  int        `json:"orderNum"`
}
```

### 2.2 API Endpoints — добавить в `register.go`

```
// Задачи проекта
GET    /api/projects/:id/tasks          — список задач (с фильтрами)
POST   /api/projects/:id/tasks          — создать задачу
GET    /api/projects/:id/tasks/:taskId  — получить задачу
PATCH  /api/projects/:id/tasks/:taskId  — обновить задачу
DELETE /api/projects/:id/tasks/:taskId  — удалить задачу
PATCH  /api/projects/:id/tasks/reorder  — перетасовать (drag-and-drop)

// Подзадачи
GET    /api/projects/:id/tasks/:taskId/subtasks          — список подзадач
POST   /api/projects/:id/tasks/:taskId/subtasks          — создать подзадачу
PATCH  /api/projects/:id/tasks/:taskId/subtasks/:subId   — обновить подзадачу
DELETE /api/projects/:id/tasks/:taskId/subtasks/:subId   — удалить подзадачу

// Комментарии
GET    /api/projects/:id/tasks/:taskId/comments          — список комментариев
POST   /api/projects/:id/tasks/:taskId/comments          — добавить комментарий

// Milestone-ы
GET    /api/projects/:id/milestones     — список milestone-ов
POST   /api/projects/:id/milestones     — создать milestone
PATCH  /api/projects/:id/milestones/:msId — обновить milestone
DELETE /api/projects/:id/milestones/:msId — удалить milestone
```

### 2.3 Файлы backend (создать)

| Файл | Назначение |
|------|------------|
| `internal/models/task.go` | Модели Task, Subtask, TaskComment, Milestone, DTOs |
| `internal/repository/task_repo.go` | Доступ к БД: CRUD задач, подзадач, комментариев, milestone-ов |
| `internal/services/task_service.go` | Бизнес-логика: создание задач (генерация task_key), валидация, WS-уведомления |
| `internal/handlers/task_handlers.go` | HTTP-хендлеры для всех task endpoints |

### 2.4 WebSocket — расширить `hub.go`

Новые типы событий:
- `task.created` — создана новая задача
- `task.updated` — обновлена задача (статус, поля)
- `task.deleted` — удалена задача
- `task.reordered` — изменён порядок задач

---

## 3. Frontend — `web/src/features/projects/`

### 3.1 Типы — `types/task.types.ts`

```typescript
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
```

### 3.2 API — `api/tasksApi.ts`

Аналогично `projectsApi.ts`, но для задач:
- `getTasks(projectId, filters)` → `GET /api/projects/:id/tasks`
- `getTask(projectId, taskId)` → `GET /api/projects/:id/tasks/:taskId`
- `createTask(projectId, input)` → `POST /api/projects/:id/tasks`
- `updateTask(projectId, taskId, input)` → `PATCH /api/projects/:id/tasks/:taskId`
- `deleteTask(projectId, taskId)` → `DELETE /api/projects/:id/tasks/:taskId`
- `reorderTasks(projectId, items)` → `PATCH /api/projects/:id/tasks/reorder`
- `getMilestones(projectId)` → `GET /api/projects/:id/milestones`

### 3.3 Hooks

| Hook | Файл | Описание |
|------|------|----------|
| `useTasks` | `hooks/useTasks.ts` | TanStack Query: список задач по projectId + фильтры |
| `useTask` | `hooks/useTasks.ts` | TanStack Query: одна задача по id |
| `useTaskMutations` | `hooks/useTaskMutations.ts` | Mutations: create, update, delete, reorder |
| `useMilestones` | `hooks/useMilestones.ts` | TanStack Query: milestone-ы проекта |
| `useTaskFilters` | `hooks/useTaskFilters.ts` | Zustand store: фильтры и текущий view |

### 3.4 Store — `store/taskStore.ts`

```typescript
interface TaskStore {
  activeView: TaskViewType
  filters: TaskFilters
  setActiveView: (view: TaskViewType) => void
  setFilters: (filters: Partial<TaskFilters>) => void
  resetFilters: () => void
}
```

### 3.5 Компоненты (НОВЫЕ файлы)

#### a) `components/TasksTopBar.tsx` — Переключатель представлений + фильтры

**Дизайн из Figma (ProjectsTopBar):**
- Верхняя строка: хлебные крошки (Projects > название проекта) + таб-переключатель (Kanban | Gantt | List | Calendar) + кнопка «Добавить задачу»
- Нижняя строка: фильтры (Статус, Исполнитель, Приоритет, Период)
- Таб-переключатель: иконки + текст, выделение активного таба белым фоном на сером
- Иконки из lucide-react: `Kanban`, `BarChart2`, `List`, `Calendar`
- Кнопка «Добавить задачу»: синий фон (#1A73E8), иконка Plus
- Фильтры: select-ы с серой рамкой, аватарки исполнителей в кружках -space-x-2

**ВАЖНО: все тексты через next-intl!** Не хардкодить.

#### b) `components/TaskCard.tsx` — Карточка задачи

**Дизайн из Figma (TaskCard):**
- Белый фон, rounded-lg, shadow, border
- Верхняя строка: цветная точка приоритета + task_key (EXP-142)
- Заголовок: font-semibold, text-sm, line-clamp-2
- Описание: text-xs, text-gray-600, line-clamp-2
- Прогресс-бар (если есть): h-1.5, bg-gray-200, заполнение синим
- Теги: цветные бейджи (backgroundColor tag.color + "15", color: tag.color)
- Нижняя строка: аватар исполнителя + дата + подзадачи (X/Y) + комментарии
- При isDone — opacity-60
- При isAtRisk — жёлтая рамка (2px solid #FBBC04)
- Drag handle: появляется при hover (GripVertical)

#### c) `components/TaskKanban.tsx` — Kanban-доска задач

**Дизайн из Figma:**
- 4 колонки: Backlog (серый #6B7280), In Progress (синий #1A73E8), Review (фиолетовый #9C27B0), Done (зелёный #34A853)
- Каждая колонка: заголовок + счётчик + кнопка «+» в цветной шапке, прокручиваемый список TaskCard
- Drag-and-drop между колонками (использовать @dnd-kit/core как в существующем ProjectKanban)
- Фон: #F8F9FA
- Минимальная ширина колонки: 320px
- Высота: calc(100vh - 200px)

#### d) `components/TaskGantt.tsx` — Диаграмма Ганта

**Дизайн из Figma (ProjectsGantt):**

Состоит из трёх частей:

1. **Левая панель (300px)** — список задач по группам:
   - Заголовки групп (Planning, Logistics, Marketing, Installation, Event Day) — collapse/expand с ChevronDown/Right
   - Строки задач: имя задачи + аватар исполнителя + бейдж статуса (Done/In Progress/Upcoming/Overdue)
   - Используется компонент GanttTaskRow (recursive)

2. **Правая панель (flex-1)** — визуализация timeline:
   - Шапка: месяцы (Mar 2025, Apr 2025...) + недели (W1, W2...)
   - Горизонтальные полосы задач, цвет по статусу:
     - done: #34A853
     - in-progress: #1A73E8 (с прогрессом — более тёмная часть #0D47A1)
     - upcoming: #9E9E9E (opacity 0.5)
     - overdue: #EA4335
   - Линия «Сегодня»: красная пунктирная (2px dashed #EA4335), бейдж "Today"
   - Milestone-ы: ромб (#FBBC04, rotate-45) + подпись
   - Dependency arrows: кривые Безье (#757575, 2px), показываются при toggle critical path
   - Зум по pixelsPerDay: day=40, week=8, month=2, quarter=0.5
   - Tooltip при hover на полосе: даты + прогресс

3. **Нижняя панель** — GanttBottomBar:
   - Зум: Day | Week | Month | Quarter (таб-переключатель)
   - Toggle Critical Path: switch + иконка TrendingUp
   - Кнопка Export to PDF

#### e) `components/TaskList.tsx` — Табличный список задач

**Не было в Figma прототипе, но нужно реализовать:**
- Таблица с колонками: Task Key, Title, Status, Priority, Assignee, Due Date, Progress, Tags
- Сортировка по всем колонкам
- Inline status change (dropdown)
- Пагинация
- Чекбоксы для массовых операций
- Использовать shadcn/ui Table

#### f) `components/TaskCalendar.tsx` — Календарь задач

**Не было в Figma прототипе, но нужно реализовать:**
- Месячный вид с переключением месяцев
- Задачи отображаются на ячейках дат по due_date
- Цветовая индикация приоритета
- Клик на задачу — открытие деталей
- Можно переключать: месяц / неделя
- Использовать существующий shadcn/ui Calendar как основу или react-big-calendar

#### g) `components/TaskDetail.tsx` (или модальное окно) — Детали задачи

- Открывается при клике на TaskCard (в любом представлении)
- Показывает: все поля задачи, подзадачи с чекбоксами, комментарии
- Возможность редактирования inline
- Sheet (shadcn/ui) справа или Dialog

### 3.6 Страница — `web/src/app/[locale]/dashboard/projects/[id]/tasks/page.tsx`

```typescript
// Основная страница задач проекта
// Содержит TasksTopBar + переключение между:
//   activeView === 'kanban'   → <TaskKanban />
//   activeView === 'gantt'    → <TaskGantt />
//   activeView === 'list'     → <TaskList />
//   activeView === 'calendar' → <TaskCalendar />
```

Это 'use client' компонент, потому что нужна интерактивность.

---

## 4. Навигация

### 4.1 Добавить ссылку «Задачи» в ProjectHeader или ProjectInfo

На странице `/dashboard/projects/:id` добавить кнопку/ссылку «Задачи проекта» или таб-навигацию:
- Обзор (текущая страница)
- Задачи → `/dashboard/projects/:id/tasks`

### 4.2 Sidebar

Пункт «Проекты» в sidebar уже есть. Можно добавить подпункт при открытом проекте.

---

## 5. Визуальные константы (из Figma прототипа)

```typescript
// Цвета статусов задач (Kanban колонки)
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: '#6B7280',
  in_progress: '#1A73E8',
  review: '#9C27B0',
  done: '#34A853',
  cancelled: '#9E9E9E',
}

// Цвета приоритетов
export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#EA4335',
  medium: '#FBBC04',
  low: '#34A853',
}

// Цвета статусов на Gantt
export const GANTT_STATUS_COLORS = {
  'in-progress': '#1A73E8',
  'in-progress-fill': '#0D47A1',
  done: '#34A853',
  upcoming: '#9E9E9E',
  overdue: '#EA4335',
}

// Milestone цвет
export const MILESTONE_COLOR = '#FBBC04'

// Фон
export const BOARD_BG = '#F8F9FA'
export const BORDER_COLOR = '#E0E0E0'
```

---

## 6. i18n — дополнить `ru.json` и `en.json`

```json
{
  "tasks": {
    "title": "Задачи",
    "addTask": "Добавить задачу",
    "editTask": "Редактировать задачу",
    "deleteTask": "Удалить задачу",
    "view": {
      "kanban": "Канбан",
      "gantt": "Ганта",
      "list": "Список",
      "calendar": "Календарь"
    },
    "status": {
      "backlog": "Бэклог",
      "in_progress": "В работе",
      "review": "На проверке",
      "done": "Готово",
      "cancelled": "Отменено"
    },
    "priority": {
      "high": "Высокий",
      "medium": "Средний",
      "low": "Низкий"
    },
    "filters": {
      "allStatus": "Все статусы",
      "allPriorities": "Все приоритеты",
      "allTime": "Всё время",
      "thisWeek": "Эта неделя",
      "thisMonth": "Этот месяц",
      "thisQuarter": "Этот квартал",
      "assignee": "Исполнитель"
    },
    "gantt": {
      "zoom": "Масштаб",
      "day": "День",
      "week": "Неделя",
      "month": "Месяц",
      "quarter": "Квартал",
      "criticalPath": "Критический путь",
      "exportPdf": "Экспорт в PDF",
      "taskName": "Задача",
      "assignee": "Исполнитель",
      "status": "Статус",
      "today": "Сегодня"
    },
    "list": {
      "columns": {
        "key": "Код",
        "title": "Название",
        "status": "Статус",
        "priority": "Приоритет",
        "assignee": "Исполнитель",
        "dueDate": "Срок",
        "progress": "Прогресс",
        "tags": "Метки"
      }
    },
    "detail": {
      "subtasks": "Подзадачи",
      "comments": "Комментарии",
      "addComment": "Добавить комментарий",
      "addSubtask": "Добавить подзадачу",
      "noComments": "Нет комментариев",
      "noSubtasks": "Нет подзадач"
    },
    "empty": "Нет задач",
    "dragHint": "Перетащите задачи между колонками для смены статуса"
  }
}
```

---

## 7. Порядок реализации (рекомендуемый)

### Этап 1: Backend — модели и API
1. Создать миграцию `004_project_tasks.sql`
2. Создать `internal/models/task.go`
3. Создать `internal/repository/task_repo.go` (CRUD + фильтры + reorder)
4. Создать `internal/services/task_service.go` (логика + WS events)
5. Создать `internal/handlers/task_handlers.go`
6. Зарегистрировать routes в `register.go`
7. Проверить через curl / Postman

### Этап 2: Frontend — типы, API, hooks
1. Создать `types/task.types.ts`
2. Создать `api/tasksApi.ts`
3. Создать `hooks/useTasks.ts`, `hooks/useTaskMutations.ts`, `hooks/useMilestones.ts`
4. Создать `store/taskStore.ts`
5. Дополнить i18n файлы

### Этап 3: Frontend — компоненты и представления
1. `TasksTopBar.tsx` — переключатель видов + фильтры
2. `TaskCard.tsx` — карточка задачи
3. `TaskKanban.tsx` — Kanban-доска
4. `TaskGantt.tsx` — диаграмма Ганта (самый сложный)
5. `TaskList.tsx` — табличный список
6. `TaskCalendar.tsx` — календарный вид
7. `TaskDetail.tsx` — детальный просмотр/редактирование задачи

### Этап 4: Frontend — страница и навигация
1. Создать `app/[locale]/dashboard/projects/[id]/tasks/page.tsx`
2. Добавить ссылку «Задачи» в детальную страницу проекта
3. Проверить переключение видов

---

## 8. Технические требования

- **Строго следовать `.cursorrules`** — TypeScript strict, Tailwind only, shadcn/ui, named exports, no `any`
- **Все тексты через `useTranslations('tasks')`** — ноль хардкода
- **TanStack Query** для всех API-вызовов с правильными queryKey
- **@dnd-kit/core** для drag-and-drop в Kanban
- **Framer Motion** для анимаций (переключение видов, появление карточек)
- **Responsive**: все представления должны работать на планшете (≥768px)
- **Accessibility**: семантический HTML, aria-labels, keyboard navigation
- **WebSocket**: подписка на изменения задач для real-time обновлений
- **Lazy loading**: `React.lazy` для тяжёлых компонентов (Gantt, Calendar)
- **Virtualization**: рассмотреть `react-window` для длинных списков задач (>100)

---

## 9. Зависимости (если нужно доустановить)

Frontend (проверить наличие в `package.json`):
- `@dnd-kit/core` — уже есть (для Kanban)
- `date-fns` — для работы с датами в Gantt/Calendar
- `react-big-calendar` или построить свой — для Calendar view
- Все остальные должны быть в проекте (shadcn/ui, lucide-react, framer-motion, zustand, tanstack/react-query)

---

## 10. Справочник: соответствие Figma → код

| Figma компонент | Наш компонент | Путь |
|----------------|---------------|------|
| `ProjectsTopBar` | `TasksTopBar` | `features/projects/components/TasksTopBar.tsx` |
| `TaskCard` | `TaskCard` | `features/projects/components/TaskCard.tsx` |
| `KanbanColumn` | `TaskKanbanColumn` | Внутри `TaskKanban.tsx` |
| `ProjectsKanban` (page) | `TaskKanban` | `features/projects/components/TaskKanban.tsx` |
| `ProjectsGantt` (page) | `TaskGantt` | `features/projects/components/TaskGantt.tsx` |
| `GanttTaskRow` | `GanttTaskRow` | Внутри `TaskGantt.tsx` |
| `GanttTimeline` | `GanttTimeline` | Внутри `TaskGantt.tsx` или отдельный файл |
| `GanttBottomBar` | `GanttBottomBar` | Внутри `TaskGantt.tsx` или отдельный файл |
| — (нет в Figma) | `TaskList` | `features/projects/components/TaskList.tsx` |
| — (нет в Figma) | `TaskCalendar` | `features/projects/components/TaskCalendar.tsx` |
| — (нет в Figma) | `TaskDetail` | `features/projects/components/TaskDetail.tsx` |
