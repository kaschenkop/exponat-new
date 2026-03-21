-- Экспонат: схема для дашборда (PostgreSQL 14+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Базовые сущности
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget NUMERIC(18, 2) NOT NULL DEFAULT 0,
    team_size INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_org_created ON projects(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status);

CREATE TABLE IF NOT EXISTS exhibits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exhibits_project ON exhibits(project_id);

CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_project ON participants(project_id);

CREATE TABLE IF NOT EXISTS budget_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    planned_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    actual_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    UNIQUE (organization_id, month)
);

CREATE INDEX IF NOT EXISTS idx_budget_monthly_org_month ON budget_monthly(organization_id, month);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('installation', 'opening', 'closing', 'dismantling')),
    title TEXT NOT NULL,
    location TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_org_date ON events(organization_id, event_date);

-- Лог активности (партиции по году)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS activity_log_2025 PARTITION OF activity_log
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE IF NOT EXISTS activity_log_2026 PARTITION OF activity_log
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS activity_log_2027 PARTITION OF activity_log
    FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE IF NOT EXISTS activity_log_2028 PARTITION OF activity_log
    FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');
CREATE TABLE IF NOT EXISTS activity_log_default PARTITION OF activity_log DEFAULT;

CREATE INDEX IF NOT EXISTS idx_activity_org_created ON activity_log(organization_id, created_at DESC);

-- Материализованное представление статистики
DROP MATERIALIZED VIEW IF EXISTS dashboard_stats CASCADE;
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
    o.id AS organization_id,
    (SELECT COUNT(*)::bigint
     FROM projects p
     WHERE p.organization_id = o.id AND p.status = 'active') AS active_projects_count,
    (SELECT COALESCE(SUM(p.total_budget), 0)::numeric
     FROM projects p
     WHERE p.organization_id = o.id AND p.status = 'active') AS total_budget_sum,
    (SELECT COUNT(*)::bigint
     FROM exhibits e
     JOIN projects p ON e.project_id = p.id
     WHERE p.organization_id = o.id) AS exhibits_count,
    (SELECT COUNT(*)::bigint
     FROM participants pt
     JOIN projects p ON pt.project_id = p.id
     WHERE p.organization_id = o.id) AS participants_count
FROM organizations o;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_org ON dashboard_stats(organization_id);

CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Триггер автологирования для проектов
CREATE OR REPLACE FUNCTION log_project_activity()
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

    INSERT INTO activity_log (organization_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
        NEW.organization_id,
        uid,
        CASE WHEN TG_OP = 'INSERT' THEN 'создан проект' ELSE 'обновлён проект' END,
        'project',
        NEW.id,
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_activity_log ON projects;
CREATE TRIGGER projects_activity_log
    AFTER INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_activity();
