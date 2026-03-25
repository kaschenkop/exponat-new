-- Экспонат: задачи проекта (Kanban, Gantt, List, Calendar)
-- Выполняется после 004_projects_demo_relations.sql

-- 1) Задачи
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_key VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'backlog'
        CHECK (status IN ('backlog', 'in_progress', 'review', 'done', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('high', 'medium', 'low')),

    assignee_id UUID REFERENCES users(id),
    group_name VARCHAR(100),

    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,

    progress INTEGER NOT NULL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),

    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    dependencies UUID[] NOT NULL DEFAULT '{}',
    order_num INTEGER NOT NULL DEFAULT 0,

    is_at_risk BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON project_tasks(project_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_group ON project_tasks(project_id, group_name);

-- 2) Подзадачи
CREATE TABLE IF NOT EXISTS project_subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON project_subtasks(task_id);

-- 3) Комментарии к задачам
CREATE TABLE IF NOT EXISTS project_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON project_task_comments(task_id, created_at);

-- 4) Milestone-ы проекта
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    milestone_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id, milestone_date);

-- 5) Sequence для task_key (per-project counter stored via nextval)
CREATE SEQUENCE IF NOT EXISTS task_key_seq;

-- 6) Trigger: auto updated_at
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_comments_updated_at ON project_task_comments;
CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON project_task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7) Seed demo задачи для проекта aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
INSERT INTO project_tasks (project_id, task_key, title, description, status, priority, assignee_id, group_name, start_date, due_date, progress, tags, order_num)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-101', 'Согласование плана зала Б', 'Проверить и утвердить планировку с координатором площадки', 'backlog', 'high', '22222222-2222-2222-2222-222222222222', 'Логистика', '2026-03-20', '2026-03-28', 0, '[{"label":"Логистика","color":"#1A73E8"},{"label":"Срочно","color":"#EA4335"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-102', 'Дизайн стендов для спонсоров', 'Создать 3D макеты и техническую документацию', 'in_progress', 'high', '33333333-3333-3333-3333-333333333333', 'Дизайн', '2026-03-15', '2026-03-24', 65, '[{"label":"Дизайн","color":"#34A853"},{"label":"Срочно","color":"#EA4335"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-103', 'Проверка страховой документации вендоров', 'Проверить актуальность сертификатов', 'review', 'high', '22222222-2222-2222-2222-222222222222', 'Юридическое', '2026-03-10', '2026-03-22', 90, '[{"label":"Юридическое","color":"#F57C00"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-104', 'Подписание договора аренды', '', 'done', 'high', '22222222-2222-2222-2222-222222222222', 'Юридическое', '2026-03-01', '2026-03-15', 100, '[{"label":"Юридическое","color":"#F57C00"}]'::jsonb, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-105', 'Рассылка приглашений VIP-спикерам', 'Подготовить и отправить персональные приглашения', 'backlog', 'medium', '33333333-3333-3333-3333-333333333333', 'Маркетинг', '2026-03-25', '2026-03-30', 0, '[{"label":"Маркетинг","color":"#9C27B0"}]'::jsonb, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-106', 'Установка Wi-Fi инфраструктуры', '', 'in_progress', 'high', '33333333-3333-3333-3333-333333333333', 'Техническое', '2026-03-18', '2026-03-25', 55, '[{"label":"Техническое","color":"#00BCD4"}]'::jsonb, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-107', 'Запуск сайта мероприятия', '', 'done', 'high', '33333333-3333-3333-3333-333333333333', 'Маркетинг', '2026-03-05', '2026-03-12', 100, '[{"label":"Техническое","color":"#00BCD4"},{"label":"Маркетинг","color":"#9C27B0"}]'::jsonb, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-108', 'Согласование кейтеринга', 'Утвердить договор с выбранной компанией', 'backlog', 'high', '22222222-2222-2222-2222-222222222222', 'Логистика', '2026-03-20', '2026-03-25', 0, '[{"label":"Логистика","color":"#1A73E8"},{"label":"Юридическое","color":"#F57C00"}]'::jsonb, 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-109', 'Подготовка протоколов безопасности', 'Координация со службой безопасности площадки', 'in_progress', 'high', '22222222-2222-2222-2222-222222222222', 'Логистика', '2026-03-12', '2026-03-23', 50, '[{"label":"Юридическое","color":"#F57C00"},{"label":"Логистика","color":"#1A73E8"}]'::jsonb, 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-110', 'Утверждение бюджета зала С', '', 'review', 'medium', '33333333-3333-3333-3333-333333333333', 'Бюджет', '2026-03-15', '2026-03-23', 80, '[{"label":"Бюджет","color":"#FF9800"},{"label":"Логистика","color":"#1A73E8"}]'::jsonb, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXP-111', 'Создание таймлайна проекта', '', 'done', 'medium', '22222222-2222-2222-2222-222222222222', 'Планирование', '2026-03-01', '2026-03-10', 100, '[{"label":"Планирование","color":"#607D8B"}]'::jsonb, 3)
ON CONFLICT DO NOTHING;

-- Подзадачи
INSERT INTO project_subtasks (task_id, title, is_completed, order_num)
SELECT t.id, s.title, s.done, s.ord
FROM project_tasks t
CROSS JOIN (VALUES
  ('EXP-101', 'Получить план от площадки', true, 1),
  ('EXP-101', 'Согласовать с пожарной инспекцией', false, 2),
  ('EXP-101', 'Утвердить финальный вариант', false, 3),
  ('EXP-102', '3D модель зоны A', true, 1),
  ('EXP-102', '3D модель зоны B', true, 2),
  ('EXP-102', 'Техническая документация', true, 3),
  ('EXP-102', 'Согласование с заказчиком', true, 4),
  ('EXP-102', 'Финальные правки', false, 5),
  ('EXP-102', 'Подготовка к печати', false, 6)
) AS s(tkey, title, done, ord)
WHERE t.task_key = s.tkey
ON CONFLICT DO NOTHING;

-- Milestone-ы
INSERT INTO project_milestones (project_id, title, milestone_date) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Старт проекта', '2026-03-01'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Площадка утверждена', '2026-03-20'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Запуск сайта', '2026-04-02'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Монтаж завершён', '2026-05-23'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Открытие выставки', '2026-05-25')
ON CONFLICT DO NOTHING;
