#!/usr/bin/env python3
"""Готовит kong.yml для GKE: Kong в namespace kong → бэкенды в staging (*.staging.svc.cluster.local)."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("source", type=Path, help="Исходный kong.yml (docker / общий)")
    p.add_argument("-o", "--output", type=Path, required=True)
    p.add_argument(
        "--namespace",
        default="staging",
        help="Namespace сервисов exponat (по умолчанию staging)",
    )
    args = p.parse_args()
    src = args.source.read_text(encoding="utf-8")

    # Upstreams (targets) — в K8s Service чарта exponat везде port: 80 → targetPort (8081/8080/8082).
    # Ходить на containerPort (:8081/:8080/:8082) или выдуманный :8083 с FQDN нельзя: на ClusterIP
    # слушает только порт сервиса (80). Иначе Kong логирует таймаут на <ClusterIP>:8083.
    repl = [
        ("target: projects:8081", f"target: projects.{args.namespace}.svc.cluster.local:80"),
        ("target: dashboard:8080", f"target: dashboard.{args.namespace}.svc.cluster.local:80"),
        ("target: budget:8082", f"target: budget.{args.namespace}.svc.cluster.local:80"),
    ]
    for a, b in repl:
        if a not in src:
            print(f"warn: pattern not found: {a!r}", file=sys.stderr)
        src = src.replace(a, b)
    # Опционально: старый kong.yml / ручные правки с неверным портом dashboard.
    src = src.replace(
        "target: dashboard:8083",
        f"target: dashboard.{args.namespace}.svc.cluster.local:80",
    )

    ns = args.namespace

    def url_fqdn(m: re.Match[str]) -> str:
        indent, host, port = m.group(1), m.group(2), m.group(3)
        if "svc.cluster.local" in host:
            return m.group(0)
        # У exponat-сервисов в K8s внешний порт Service всегда 80, не containerPort.
        if host in ("projects", "dashboard", "budget"):
            port = "80"
        return f"{indent}url: http://{host}.{ns}.svc.cluster.local:{port}"

    src = re.sub(
        r"^(\s*)url: http://([a-z0-9-]+):(\d+)\s*$",
        url_fqdn,
        src,
        flags=re.MULTILINE,
    )
    # Порт сервиса в Helm — 8090, не 8000
    src = src.replace(
        f"ai-document-gen.{ns}.svc.cluster.local:8000",
        f"ai-document-gen.{ns}.svc.cluster.local:8090",
    )

    # После всех подстановок: снять containerPort с FQDN (старые CM, url_fqdn и т.д.).
    for svc in ("projects", "dashboard", "budget"):
        fq = f"{svc}.{args.namespace}.svc.cluster.local"
        for bad in ("8080", "8081", "8082", "8083"):
            src = src.replace(f"{fq}:{bad}", f"{fq}:80")

    args.output.write_text(src, encoding="utf-8")
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
