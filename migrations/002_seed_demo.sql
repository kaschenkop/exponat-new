-- Демо-данные (идемпотентно по id)
INSERT INTO organizations (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Демо-организация')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, avatar) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Анна Петрова', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Иван Смирнов', NULL)
ON CONFLICT (id) DO NOTHING;

-- Совпадает с fallback в log_project_activity / log_project_changes (FK activity_log.user_id → users)
INSERT INTO users (id, name, avatar) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Система', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, organization_id, name, status, start_date, end_date, total_budget, team_size, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'Выставка «Искусство будущего»', 'active', '2026-04-01', '2026-06-30', 5000000, 8, NOW() - INTERVAL '20 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111',
   'Корпоративная экспозиция «Технологии»', 'active', '2026-03-15', '2026-05-15', 3000000, 5, NOW() - INTERVAL '10 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111',
   'Архивный проект', 'archived', '2025-01-01', '2025-06-01', 1000000, 3, NOW() - INTERVAL '400 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exhibits (id, project_id, created_at) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '5 days'),
  ('e2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '4 days'),
  ('e3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO participants (id, project_id, created_at) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '8 days'),
  ('d2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '7 days'),
  ('d3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '6 days'),
  ('d4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO budget_monthly (organization_id, month, planned_amount, actual_amount) VALUES
  ('11111111-1111-1111-1111-111111111111', date_trunc('month', NOW()) - INTERVAL '5 months', 400000, 380000),
  ('11111111-1111-1111-1111-111111111111', date_trunc('month', NOW()) - INTERVAL '4 months', 420000, 410000),
  ('11111111-1111-1111-1111-111111111111', date_trunc('month', NOW()) - INTERVAL '3 months', 450000, 455000),
  ('11111111-1111-1111-1111-111111111111', date_trunc('month', NOW()) - INTERVAL '2 months', 480000, 470000),
  ('11111111-1111-1111-1111-111111111111', date_trunc('month', NOW()) - INTERVAL '1 month', 500000, 520000),
  ('11111111-1111-1111-1111-111111111111', date_trunc('month', NOW()), 510000, 495000)
ON CONFLICT (organization_id, month) DO UPDATE SET
  planned_amount = EXCLUDED.planned_amount,
  actual_amount = EXCLUDED.actual_amount;

INSERT INTO events (id, project_id, organization_id, type, title, location, event_date) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'installation', 'Монтаж основной экспозиции', 'Главный зал', '2026-03-25T10:00:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'opening', 'Торжественное открытие', 'Центральный павильон', '2026-04-01T18:00:00Z'),
  ('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111',
   'dismantling', 'Демонтаж зоны B', 'Павильон B', '2026-05-20T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activity_log (id, organization_id, user_id, action, entity_type, entity_id, metadata, created_at) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   'обновила статус проекта', 'project', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{}'::jsonb, '2026-03-22T10:00:00Z'),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
   'создал бюджет по статье «Монтаж»', 'budget', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{}'::jsonb, '2026-03-21T14:00:00Z'),
  ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   'добавила экспонат в каталог', 'exhibit', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{}'::jsonb, '2026-03-20T09:00:00Z')
ON CONFLICT (id, created_at) DO NOTHING;

SELECT refresh_dashboard_stats();
