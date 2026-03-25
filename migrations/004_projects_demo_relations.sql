-- Демо: команда и фазы (после 003_seed_demo — нужны строки projects).
INSERT INTO project_team (project_id, user_id, role, permissions, joined_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'manager', '["edit","delete","manage_team"]'::jsonb, NOW() - INTERVAL '15 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'designer', '["edit"]'::jsonb, NOW() - INTERVAL '12 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'manager', '["edit","manage_team"]'::jsonb, NOW() - INTERVAL '8 days')
ON CONFLICT (project_id, user_id) DO NOTHING;

UPDATE projects SET team_size = (
  SELECT COUNT(*)::int FROM project_team t WHERE t.project_id = projects.id
) WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

INSERT INTO project_phases (id, project_id, name, description, start_date, end_date, status, progress, dependencies, order_num) VALUES
  ('faaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Подготовка', 'Сбор требований', '2026-04-01', '2026-04-15', 'completed', 100, '{}', 1),
  ('faaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Монтаж', 'Установка экспонатов', '2026-04-16', '2026-05-20', 'in_progress', 45, ARRAY['faaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa']::uuid[], 2),
  ('fbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Проектирование', 'Макеты и согласование', '2026-03-15', '2026-04-10', 'completed', 100, '{}', 1)
ON CONFLICT (id) DO NOTHING;

SELECT refresh_dashboard_stats();

REFRESH MATERIALIZED VIEW project_statistics;
