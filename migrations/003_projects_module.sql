-- Расширение проектов: статусы, типы, фазы, команда, файлы, WebSocket-friendly updated_at

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

UPDATE projects SET status = 'cancelled' WHERE status = 'archived';

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS project_type VARCHAR(32) NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS spent_budget NUMERIC(18, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  ADD COLUMN IF NOT EXISTS location JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS progress INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS kanban_position INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE projects SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (
  status IN ('draft', 'planning', 'active', 'on_hold', 'completed', 'cancelled')
);

ALTER TABLE projects ADD CONSTRAINT projects_type_check CHECK (
  project_type IN ('museum', 'corporate', 'expo_forum', 'other')
);

ALTER TABLE projects ADD CONSTRAINT projects_progress_check CHECK (progress >= 0 AND progress <= 100);

CREATE OR REPLACE FUNCTION set_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_set_updated_at ON projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_projects_updated_at();

CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  dependencies UUID[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_project_phases_project ON project_phases(project_id, sort_order);

CREATE TABLE IF NOT EXISTS project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('manager', 'coordinator', 'designer', 'logistics', 'other')),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_team_project ON project_team_members(project_id);

CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);

-- Демо: менеджеры и команда (идемпотентно)
UPDATE projects SET
  manager_id = '22222222-2222-2222-2222-222222222222',
  description = 'Крупная выставка современного искусства.',
  project_type = 'museum',
  spent_budget = 1200000,
  progress = 42,
  tags = ARRAY['музей', 'премьера'],
  location = '{"venue":"Главный музей","address":"ул. Примерная, 1","city":"Москва","country":"Россия"}'::jsonb
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE projects SET
  manager_id = '33333333-3333-3333-3333-333333333333',
  description = 'Корпоративная экспозиция для партнёров.',
  project_type = 'corporate',
  spent_budget = 800000,
  progress = 65,
  tags = ARRAY['корпоратив'],
  location = '{"venue":"Офис-парк","address":"пр. Технологий, 10","city":"Москва","country":"Россия"}'::jsonb
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

UPDATE projects SET
  manager_id = '22222222-2222-2222-2222-222222222222',
  description = 'Завершённый проект.',
  project_type = 'other',
  spent_budget = 1000000,
  progress = 100,
  tags = ARRAY['архив'],
  location = '{"venue":"—","address":"","city":"Москва","country":"Россия"}'::jsonb
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

INSERT INTO project_phases (id, project_id, name, description, start_date, end_date, status, progress, dependencies, sort_order) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Концепция', 'Разработка концепции', '2026-04-01', '2026-04-15', 'completed', 100, ARRAY[]::uuid[], 0),
  ('f2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Монтаж', 'Монтаж экспозиции', '2026-04-16', '2026-05-20', 'in_progress', 45, ARRAY['f1111111-1111-1111-1111-111111111111']::uuid[], 1),
  ('f3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Открытие', 'Финальные работы', '2026-05-21', '2026-06-30', 'pending', 0, ARRAY['f2222222-2222-2222-2222-222222222222']::uuid[], 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_team_members (project_id, user_id, role, permissions, joined_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'manager', ARRAY['*'], NOW() - INTERVAL '30 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'designer', ARRAY['read','write'], NOW() - INTERVAL '25 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'manager', ARRAY['*'], NOW() - INTERVAL '20 days')
ON CONFLICT (project_id, user_id) DO NOTHING;

INSERT INTO project_files (id, project_id, name, url, mime_type, size_bytes, uploaded_by, created_at) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Бриф.pdf', 'https://example.com/brief.pdf', 'application/pdf', 240000, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

SELECT refresh_dashboard_stats();
