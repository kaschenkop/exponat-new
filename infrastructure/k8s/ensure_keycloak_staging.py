#!/usr/bin/env python3
"""Готовит БД keycloak в существующем Postgres (Bitnami exponat-postgresql) и Secret keycloak-db.

Запуск после helm exponat (PostgreSQL в ns staging). Идемпотентно.
Секрет keycloak-admin создаётся в workflow из KEYCLOAK_STAGING_ADMIN_PASSWORD.
"""
from __future__ import annotations

import base64
import json
import secrets
import shlex
import string
import subprocess
import sys


def kubectl(*args: str) -> str:
    out = subprocess.check_output(["kubectl", *args], text=True)
    return out.strip()


def kubectl_exec_sql(ns: str, sql: str, admin_password: str) -> str:
    """psql -U postgres в поде Bitnami: нужен пароль суперпользователя (секрет postgres-password)."""
    pw_q = shlex.quote(admin_password)
    # -h 127.0.0.1 — md5/scram в pg_hba; без PGPASSWORD psql запрашивает пароль и в CI падает.
    inner = (
        f"export PGPASSWORD={pw_q}; "
        "exec psql -U postgres -h 127.0.0.1 -v ON_ERROR_STOP=1 -f -"
    )
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
        "sh",
        "-c",
        inner,
    ]
    return subprocess.check_output(
        cmd, input=sql, text=True, encoding="utf-8"
    )


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

    admin_b64 = kubectl(
        "get",
        "secret",
        "exponat-postgres-auth",
        "-n",
        ns,
        "-o",
        "jsonpath={.data.postgres-password}",
    )
    if not admin_b64:
        print(
            f"В Secret exponat-postgres-auth нет ключа data.postgres-password "
            f"(Bitnami adminPasswordKey). См. values-staging-gcp-incluster.yaml.",
            file=sys.stderr,
        )
        return 1
    admin_pw = base64.b64decode(admin_b64).decode("utf-8")

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
        admin_pw,
    )

    chk = kubectl_exec_sql(
        ns, "SELECT 1 FROM pg_database WHERE datname = 'keycloak';", admin_pw
    ).strip()
    if "1" not in chk.split():
        kubectl_exec_sql(
            ns, "CREATE DATABASE keycloak OWNER keycloak;", admin_pw
        )

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
