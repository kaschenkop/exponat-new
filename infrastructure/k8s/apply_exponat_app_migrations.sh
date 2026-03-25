#!/usr/bin/env bash
# Применяет SQL-миграции приложения к БД exponat_staging (не трогает keycloak).
# Использование: bash infrastructure/k8s/apply_exponat_app_migrations.sh [namespace]
# Требуется: kubectl, секрет exponat-postgres-auth (ключ postgres-password), под Bitnami PostgreSQL.
set -euo pipefail

NS="${1:-staging}"
POSTGRES_SECRET="${POSTGRES_SECRET:-exponat-postgres-auth}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
APP_DB="${APP_DB:-exponat_staging}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

resolve_postgres_pod() {
  if [[ -n "${POSTGRES_POD:-}" ]]; then
    echo "$POSTGRES_POD"
    return
  fi
  local pod
  pod="$(kubectl get pods -n "$NS" -l app.kubernetes.io/name=postgresql -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"
  if [[ -n "$pod" ]]; then
    echo "$pod"
    return
  fi
  kubectl get pods -n "$NS" -o jsonpath='{range .items[?(@.status.phase=="Running")]}{.metadata.name}{"\n"}{end}' \
    | grep -E 'postgresql' | head -1 || true
}

POD="$(resolve_postgres_pod)"
if [[ -z "$POD" ]]; then
  echo "error: не найден Running-под PostgreSQL в namespace $NS (ожидался label app.kubernetes.io/name=postgresql или имя *postgresql*)" >&2
  exit 1
fi

kubectl wait --for=condition=Ready "pod/$POD" -n "$NS" --timeout=300s

PW="$(kubectl get secret "$POSTGRES_SECRET" -n "$NS" -o jsonpath='{.data.postgres-password}' | base64 -d)"

FILES=(
  "$REPO_ROOT/migrations/001_dashboard_tables.sql"
  "$REPO_ROOT/migrations/002_seed_demo.sql"
  "$REPO_ROOT/migrations/003_projects_module.sql"
  "$REPO_ROOT/migrations/004_project_tasks.sql"
)

for f in "${FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "error: файл не найден: $f" >&2
    exit 1
  fi
  echo "Applying $(basename "$f") -> $APP_DB ..."
  kubectl exec -i -n "$NS" "$POD" -- env PGPASSWORD="$PW" \
    psql -U "$POSTGRES_USER" -d "$APP_DB" -v ON_ERROR_STOP=1 <"$f"
done

echo "Migrations applied successfully."
