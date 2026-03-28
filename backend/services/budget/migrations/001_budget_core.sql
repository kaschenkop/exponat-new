-- Схема для будущего PostgreSQL-бэкенда (упрощённо, без cross-table GENERATED).
-- In-memory сервис в Go пока не использует эти таблицы.

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    period VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'RUB',
    start_date DATE,
    end_date DATE,
    total_planned NUMERIC(15, 2) DEFAULT 0,
    warning_threshold INTEGER DEFAULT 80,
    critical_threshold INTEGER DEFAULT 90,
    manager_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_org ON budgets(organization_id);
