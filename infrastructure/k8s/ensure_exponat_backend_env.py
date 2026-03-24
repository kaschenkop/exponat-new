#!/usr/bin/env python3
"""Создаёт Secret exponat-backend-env из exponat-postgres-auth и exponat-redis-auth, если его ещё нет."""
from __future__ import annotations

import base64
import json
import subprocess
import sys
import urllib.parse


def kubectl(*args: str) -> str:
    out = subprocess.check_output(["kubectl", *args], text=True)
    return out.strip()


def main() -> int:
    ns = sys.argv[1] if len(sys.argv) > 1 else "staging"
    try:
        kubectl("get", "secret", "exponat-backend-env", "-n", ns)
    except subprocess.CalledProcessError:
        pass
    else:
        print(f"Secret exponat-backend-env уже есть в ns/{ns} — пропуск.")
        return 0

    for name in ("exponat-postgres-auth", "exponat-redis-auth"):
        try:
            kubectl("get", "secret", name, "-n", ns)
        except subprocess.CalledProcessError:
            print(
                f"Нет Secret {name} в ns/{ns} — создайте пароли БД/Redis "
                "(docs/deployment/staging-gcp-k8s-db.md). exponat-backend-env не создан."
            )
            return 0

    pw_b64 = kubectl(
        "get", "secret", "exponat-postgres-auth", "-n", ns, "-o", "jsonpath={.data.password}"
    )
    rpw_b64 = kubectl(
        "get", "secret", "exponat-redis-auth", "-n", ns, "-o", "jsonpath={.data.redis-password}"
    )
    pw = base64.b64decode(pw_b64).decode("utf-8")
    rpw = base64.b64decode(rpw_b64).decode("utf-8")
    enc = urllib.parse.quote(pw, safe="")
    db_url = (
        f"postgres://exponat:{enc}@exponat-postgresql:5432/exponat_staging?sslmode=disable"
    )

    secret = {
        "apiVersion": "v1",
        "kind": "Secret",
        "metadata": {"name": "exponat-backend-env", "namespace": ns},
        "type": "Opaque",
        "stringData": {
            "DATABASE_URL": db_url,
            "REDIS_ADDR": "exponat-redis-master:6379",
            "REDIS_PASSWORD": rpw,
            "SKIP_AUTH": "true",
            "DEFAULT_ORGANIZATION_ID": "11111111-1111-1111-1111-111111111111",
        },
    }
    subprocess.run(
        ["kubectl", "apply", "-f", "-"],
        input=json.dumps(secret).encode(),
        check=True,
    )
    print(f"Secret exponat-backend-env применён в ns/{ns}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
