#!/usr/bin/env bash
# Применяет SQL-миграции приложения к БД exponat_staging (не трогает keycloak).
# Использование: bash infrastructure/k8s/apply_exponat_app_migrations.sh [namespace]
# Требуется: kubectl, секрет exponat-postgres-auth (ключ postgres-password), под Bitnami PostgreSQL.
#
# Файлы подхватываются автоматически: migrations/NNN_*.sql (NNN — три цифры), порядок — лексикографический.
# Пропускается префикс 000_* (напр. 000_keycloak_database.sql — только для init-образа Postgres).
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

MIGRATIONS_DIR="$REPO_ROOT/migrations"
shopt -s nullglob
candidates=("$MIGRATIONS_DIR"/[0-9][0-9][0-9]_*.sql)
shopt -u nullglob

files=()
for f in "${candidates[@]}"; do
  [[ -f "$f" ]] || continue
  base=$(basename "$f")
  [[ "$base" == 000_* ]] && continue
  files+=("$f")
done

if [[ ${#files[@]} -eq 0 ]]; then
  echo "error: в $MIGRATIONS_DIR нет подходящих файлов [0-9][0-9][0-9]_*.sql (кроме 000_*)" >&2
  exit 1
fi

mapfile -t sorted < <(printf '%s\n' "${files[@]}" | LC_ALL=C sort)

for f in "${sorted[@]}"; do
  echo "Applying $(basename "$f") -> $APP_DB ..."
  kubectl exec -i -n "$NS" "$POD" -- env PGPASSWORD="$PW" \
    psql -U "$POSTGRES_USER" -d "$APP_DB" -v ON_ERROR_STOP=1 <"$f"
done

echo "Migrations applied successfully."
