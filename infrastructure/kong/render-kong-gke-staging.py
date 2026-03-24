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

    # Upstreams (targets)
    repl = [
        ("target: projects:8081", f"target: projects.{args.namespace}.svc.cluster.local:8081"),
        ("target: dashboard:8080", f"target: dashboard.{args.namespace}.svc.cluster.local:8083"),
        ("target: budget:8082", f"target: budget.{args.namespace}.svc.cluster.local:8082"),
    ]
    for a, b in repl:
        if a not in src:
            print(f"warn: pattern not found: {a!r}", file=sys.stderr)
        src = src.replace(a, b)

    ns = args.namespace

    def url_fqdn(m: re.Match[str]) -> str:
        indent, host, port = m.group(1), m.group(2), m.group(3)
        if "svc.cluster.local" in host:
            return m.group(0)
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

    args.output.write_text(src, encoding="utf-8")
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
