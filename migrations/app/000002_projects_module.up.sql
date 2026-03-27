-- Экспонат: расширение проектов (команда, фазы, аудит, статистика)
-- После 000001; перед 000003_seed_demo.

-- 1) Расширяем projects
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

UPDATE projects SET status = 'completed' WHERE status = 'archived';

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'museum',
  ADD COLUMN IF NOT EXISTS spent_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  ADD COLUMN IF NOT EXISTS location JSONB NOT NULL DEFAULT '{"venue":"","address":"","city":"","country":""}'::jsonb,
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exhibits_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS participants_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_fields JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE projects SET manager_id = '22222222-2222-2222-2222-222222222222' WHERE manager_id IS NULL;

ALTER TABLE projects ALTER COLUMN manager_id SET NOT NULL;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (
  status IN ('draft', 'planning', 'active', 'on_hold', 'completed', 'cancelled')
);

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_type_check;
ALTER TABLE projects ADD CONSTRAINT projects_type_check CHECK (
  type IN ('museum', 'corporate', 'expo_forum', 'other')
);

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_progress_check;
ALTER TABLE projects ADD CONSTRAINT projects_progress_check CHECK (progress >= 0 AND progress <= 100);

-- Синхронизация счётчиков с существующими таблицами
UPDATE projects p SET
  exhibits_count = (SELECT COUNT(*)::int FROM exhibits e WHERE e.project_id = p.id),
  participants_count = (SELECT COUNT(*)::int FROM participants pt WHERE pt.project_id = p.id);

-- 2) Команда проекта
CREATE TABLE IF NOT EXISTS project_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_project ON project_team(project_id);
CREATE INDEX IF NOT EXISTS idx_team_user ON project_team(user_id);

-- 3) Фазы
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'in_progress', 'completed', 'cancelled')
    ),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    dependencies UUID[] NOT NULL DEFAULT '{}',
    order_num INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phases_project ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_phases_status ON project_phases(status);
CREATE INDEX IF NOT EXISTS idx_phases_order ON project_phases(project_id, order_num);

-- 4) История изменений проекта
CREATE TABLE IF NOT EXISTS project_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_changes_project ON project_changes(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_changes_user ON project_changes(user_id);

-- 5) updated_at для projects / phases
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_phases_updated_at ON project_phases;
CREATE TRIGGER update_project_phases_updated_at
    BEFORE UPDATE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6) Аудит project_changes
CREATE OR REPLACE FUNCTION log_project_changes()
RETURNS TRIGGER AS $$
DECLARE
    uid UUID := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    BEGIN
        uid := NULLIF(current_setting('app.current_user_id', true), '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        uid := '00000000-0000-0000-0000-000000000001'::uuid;
    END;
    IF uid IS NULL THEN
        uid := '00000000-0000-0000-0000-000000000001'::uuid;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO project_changes (project_id, user_id, change_type, field_name, old_value, new_value)
            VALUES (NEW.id, uid, 'status_changed', 'status', OLD.status::text, NEW.status::text);
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO project_changes (project_id, user_id, change_type)
        VALUES (NEW.id, uid, 'created');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_changes_log ON projects;
CREATE TRIGGER project_changes_log
    AFTER INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_changes();

-- 7) Материализованное представление статистики по проектам
DROP MATERIALIZED VIEW IF EXISTS project_statistics CASCADE;
CREATE MATERIALIZED VIEW project_statistics AS
SELECT
    p.organization_id,
    p.status::text AS status,
    COUNT(*)::bigint AS project_count,
    COALESCE(SUM(p.total_budget), 0)::numeric AS total_budget,
    COALESCE(SUM(p.spent_budget), 0)::numeric AS spent_budget,
    COALESCE(AVG(p.progress), 0)::numeric AS avg_progress
FROM projects p
GROUP BY p.organization_id, p.status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_stats_org_status ON project_statistics(organization_id, status);
