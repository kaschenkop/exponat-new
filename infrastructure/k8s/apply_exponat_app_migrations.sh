#!/usr/bin/env bash
# Применяет миграции приложения к БД exponat_staging через golang-migrate (таблица schema_migrations).
# Повторные деплои не гоняют уже применённые версии — в отличие от сырого psql по всем файлам.
#
# Использование: bash infrastructure/k8s/apply_exponat_app_migrations.sh [namespace]
# Требуется: kubectl, curl, tar, python3; секрет exponat-postgres-auth (postgres-password).
#
# Локально: kubectl настроен на кластер. Скрипт делает port-forward на svc PostgreSQL и вызывает migrate.
#
# Переход со старого способа (только psql): если схема уже есть, а schema_migrations пуста — один раз:
#   migrate -path migrations/app -database "postgres://..." force 5
# (подставьте актуальный DSN и последнюю версию из migrations/app/*.up.sql)
set -euo pipefail

NS="${1:-staging}"
POSTGRES_SECRET="${POSTGRES_SECRET:-exponat-postgres-auth}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
APP_DB="${APP_DB:-exponat_staging}"
APP_DB_USER="${APP_DB_USER:-exponat}"
MIGRATE_VER="${MIGRATE_VER:-4.18.1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_MIGRATIONS="$REPO_ROOT/migrations/app"

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

resolve_postgres_svc() {
  local s
  s="$(kubectl get svc -n "$NS" -l app.kubernetes.io/name=postgresql -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"
  if [[ -n "$s" ]]; then
    echo "$s"
    return
  fi
  kubectl get svc -n "$NS" -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | grep -E 'postgresql' | head -1 || true
}

ensure_migrate_binary() {
  local os arch url name cache bin
  case "$(uname -s)" in
    Linux) os=linux ;;
    Darwin) os=darwin ;;
    *)
      echo "error: добавьте сборку migrate для ОС $(uname -s) или запускайте из Linux (CI) / macOS" >&2
      exit 1
      ;;
  esac
  case "$(uname -m)" in
    x86_64) arch=amd64 ;;
    aarch64 | arm64) arch=arm64 ;;
    *)
      echo "error: неподдерживаемая архитектура $(uname -m)" >&2
      exit 1
      ;;
  esac
  cache="${MIGRATE_CACHE:-${TMPDIR:-/tmp}/exponat-migrate}"
  mkdir -p "$cache"
  bin="$cache/migrate-v${MIGRATE_VER}-${os}-${arch}"
  if [[ -x "$bin" ]]; then
    echo "$bin"
    return
  fi
  url="https://github.com/golang-migrate/migrate/releases/download/v${MIGRATE_VER}/migrate.${os}-${arch}.tar.gz"
  echo "Downloading migrate v${MIGRATE_VER} (${os}-${arch})..."
  curl -fsSL "$url" | tar xz -C "$cache" migrate
  mv "$cache/migrate" "$bin"
  chmod +x "$bin"
  echo "$bin"
}

shopt -s nullglob
_up_sql=("$APP_MIGRATIONS"/*.up.sql)
shopt -u nullglob
if [[ ${#_up_sql[@]} -eq 0 ]]; then
  echo "error: нет файлов $APP_MIGRATIONS/*.up.sql" >&2
  exit 1
fi

POD="$(resolve_postgres_pod)"
if [[ -z "$POD" ]]; then
  echo "error: не найден под PostgreSQL в namespace $NS" >&2
  exit 1
fi

SVC="$(resolve_postgres_svc)"
if [[ -z "$SVC" ]]; then
  echo "error: не найден Service PostgreSQL в namespace $NS" >&2
  exit 1
fi

kubectl wait --for=condition=Ready "pod/$POD" -n "$NS" --timeout=300s

PW="$(kubectl get secret "$POSTGRES_SECRET" -n "$NS" -o jsonpath='{.data.postgres-password}' | base64 -d)"
ENC_PW="$(printf '%s' "$PW" | python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.stdin.read(), safe=''))")"
DATABASE_URL="postgres://${POSTGRES_USER}:${ENC_PW}@127.0.0.1:5432/${APP_DB}?sslmode=disable"

MIGRATE_BIN="$(ensure_migrate_binary)"

echo "Port-forward $NS svc/$SVC -> 127.0.0.1:5432"
kubectl port-forward -n "$NS" "svc/$SVC" 5432:5432 >/dev/null 2>&1 &
PF_PID=$!
cleanup() { kill "$PF_PID" 2>/dev/null || true; }
trap cleanup EXIT
sleep 2

echo "migrate up (path=$APP_MIGRATIONS)..."
"$MIGRATE_BIN" -path "$APP_MIGRATIONS" -database "$DATABASE_URL" up

cleanup
trap - EXIT

echo "Granting privileges on $APP_DB to role $APP_DB_USER ..."
kubectl exec -i -n "$NS" "$POD" -- env PGPASSWORD="$PW" \
  psql -U "$POSTGRES_USER" -d "$APP_DB" -v ON_ERROR_STOP=1 <<EOF
GRANT CONNECT ON DATABASE ${APP_DB} TO ${APP_DB_USER};
GRANT USAGE, CREATE ON SCHEMA public TO ${APP_DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${APP_DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${APP_DB_USER};
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${APP_DB_USER};
ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public GRANT ALL ON TABLES TO ${APP_DB_USER};
ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public GRANT ALL ON SEQUENCES TO ${APP_DB_USER};
ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public GRANT ALL ON FUNCTIONS TO ${APP_DB_USER};
EOF

echo "Migrations applied successfully."
