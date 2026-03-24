#!/usr/bin/env python3
"""Готовит БД keycloak в существующем Postgres (Bitnami exponat-postgresql) и Secret keycloak-db.

Запуск после helm exponat (PostgreSQL в ns staging). Идемпотентно.
Секрет keycloak-admin создаётся в workflow из KEYCLOAK_STAGING_ADMIN_PASSWORD.
"""
from __future__ import annotations

import base64
import json
import secrets
import string
import subprocess
import sys


def kubectl(*args: str) -> str:
    out = subprocess.check_output(["kubectl", *args], text=True)
    return out.strip()


def kubectl_exec_sql(ns: str, sql: str) -> str:
    """psql -U postgres внутри пода Bitnami (локальное подключение без PGPASSWORD)."""
    cmd = [
        "kubectl",
        "exec",
        "-i",
        "-n",
        ns,
        "sts/exponat-postgresql",
        "-c",
        "postgresql",
        "--",
        "psql",
        "-U",
        "postgres",
        "-v",
        "ON_ERROR_STOP=1",
        "-f",
        "-",
    ]
    return subprocess.check_output(cmd, input=sql.encode("utf-8"), text=True)


def main() -> int:
    ns = sys.argv[1] if len(sys.argv) > 1 else "staging"
    try:
        kubectl("get", "sts", "exponat-postgresql", "-n", ns)
    except subprocess.CalledProcessError:
        print(
            f"StatefulSet exponat-postgresql не найден в ns/{ns}. Сначала разверните Helm exponat.",
            file=sys.stderr,
        )
        return 1

    try:
        kubectl("get", "secret", "exponat-postgres-auth", "-n", ns)
    except subprocess.CalledProcessError:
        print(f"Нет Secret exponat-postgres-auth в ns/{ns}.", file=sys.stderr)
        return 1

    # Пароль для роли keycloak в БД
    try:
        kubectl("get", "secret", "keycloak-db", "-n", ns)
    except subprocess.CalledProcessError:
        alphabet = string.ascii_letters + string.digits
        db_pw = "".join(secrets.choice(alphabet) for _ in range(32))
    else:
        b64 = kubectl(
            "get",
            "secret",
            "keycloak-db",
            "-n",
            ns,
            "-o",
            "jsonpath={.data.password}",
        )
        db_pw = base64.b64decode(b64).decode("utf-8")
        print(f"Secret keycloak-db уже есть в ns/{ns} — повторное создание роли/БД (идемпотентно).")

    # Экранирование одинарных кавычек для SQL в одинарных кавычках psql -c
    esc = db_pw.replace("'", "''")
    kubectl_exec_sql(
        ns,
        f"DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'keycloak') THEN "
        f"CREATE ROLE keycloak LOGIN PASSWORD '{esc}'; "
        f"ELSE ALTER ROLE keycloak WITH PASSWORD '{esc}'; END IF; END $$;",
    )

    chk = kubectl_exec_sql(ns, "SELECT 1 FROM pg_database WHERE datname = 'keycloak';").strip()
    if "1" not in chk.split():
        kubectl_exec_sql(ns, "CREATE DATABASE keycloak OWNER keycloak;")

    secret = {
        "apiVersion": "v1",
        "kind": "Secret",
        "metadata": {"name": "keycloak-db", "namespace": ns},
        "type": "Opaque",
        "stringData": {"password": db_pw},
    }
    subprocess.run(
        ["kubectl", "apply", "-f", "-"],
        input=json.dumps(secret).encode(),
        check=True,
    )
    print(f"Secret keycloak-db применён в ns/{ns} (роль/БД keycloak готовы).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
