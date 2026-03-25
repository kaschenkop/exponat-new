#!/usr/bin/env python3
"""Готовит kong.yml для GKE: Kong в namespace kong → бэкенды в staging (*.staging.svc.cluster.local).

Опционально --keycloak-issuer: подставляет iss и RSA public key из JWKS (RS256) для consumer keycloak-realm.
"""
from __future__ import annotations

import argparse
import base64
import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path


def _b64url_to_int(s: str) -> int:
    pad = "=" * ((4 - len(s) % 4) % 4)
    return int.from_bytes(base64.urlsafe_b64decode(s + pad), "big")


def jwk_rsa_to_pem(jwk: dict) -> str:
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import rsa

    if jwk.get("kty") != "RSA":
        raise ValueError("JWK is not RSA")
    n = _b64url_to_int(jwk["n"])
    e = _b64url_to_int(jwk["e"])
    pub = rsa.RSAPublicNumbers(e, n).public_key(default_backend())
    return (
        pub.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        .decode("ascii")
        .strip()
    )


def fetch_first_rsa_pem_from_issuer(issuer: str, timeout: float = 15.0) -> str:
    issuer = issuer.rstrip("/")
    url = issuer + "/protocol/openid-connect/certs"
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
        data = json.load(resp)
    keys = data.get("keys") or []
    for jwk in keys:
        if jwk.get("kty") != "RSA":
            continue
        use = jwk.get("use")
        if use is not None and use != "sig":
            continue
        alg = jwk.get("alg")
        if alg is not None and alg not in ("RS256", "RS384", "RS512", "PS256", "PS384", "PS512"):
            continue
        return jwk_rsa_to_pem(jwk)
    raise RuntimeError(f"no signing RSA key in JWKS at {url}")


def patch_keycloak_consumer(src: str, issuer: str) -> str:
    issuer = issuer.rstrip("/")
    src = src.replace("https://placeholder.invalid/realms/placeholder", issuer)
    pem = fetch_first_rsa_pem_from_issuer(issuer)
    pem_body = "\n".join("          " + line for line in pem.splitlines())
    pat = (
        r"(  - username: keycloak-realm\n"
        r"    custom_id: keycloak-realm\n"
        r"    jwt_secrets:\n"
        r"      - key: [^\n]+\n"
        r"        algorithm: RS256\n"
        r"        secret: [^\n]+\n"
        r"        rsa_public_key: \|)\n"
        r"(?:          [^\n]+\n)+"
    )

    def repl(m: re.Match[str]) -> str:
        return m.group(1) + "\n" + pem_body + "\n"

    out, n = re.subn(pat, repl, src, count=1, flags=re.MULTILINE)
    if n != 1:
        raise RuntimeError("failed to patch keycloak-realm consumer block in kong.yml")
    return out


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("source", type=Path, help="Исходный kong.yml (docker / общий)")
    p.add_argument("-o", "--output", type=Path, required=True)
    p.add_argument(
        "--namespace",
        default="staging",
        help="Namespace сервисов exponat (по умолчанию staging)",
    )
    p.add_argument(
        "--keycloak-issuer",
        default="",
        help="Напр. https://auth.staging.exponat.site/realms/exponat-development — подставить JWKS (RS256)",
    )
    args = p.parse_args()
    src = args.source.read_text(encoding="utf-8")

    # Upstreams (targets) — в K8s Service чарта exponat везде port: 80 → targetPort (8081/8080/8082).
    repl = [
        ("target: projects:8081", f"target: projects.{args.namespace}.svc.cluster.local:80"),
        ("target: dashboard:8080", f"target: dashboard.{args.namespace}.svc.cluster.local:80"),
        ("target: budget:8082", f"target: budget.{args.namespace}.svc.cluster.local:80"),
    ]
    for a, b in repl:
        if a not in src:
            print(f"warn: pattern not found: {a!r}", file=sys.stderr)
        src = src.replace(a, b)
    src = src.replace(
        "target: dashboard:8083",
        f"target: dashboard.{args.namespace}.svc.cluster.local:80",
    )

    ns = args.namespace

    def url_fqdn(m: re.Match[str]) -> str:
        indent, host, port = m.group(1), m.group(2), m.group(3)
        if "svc.cluster.local" in host:
            return m.group(0)
        if host in ("projects", "dashboard", "budget"):
            port = "80"
        return f"{indent}url: http://{host}.{ns}.svc.cluster.local:{port}"

    src = re.sub(
        r"^(\s*)url: http://([a-z0-9-]+):(\d+)\s*$",
        url_fqdn,
        src,
        flags=re.MULTILINE,
    )
    src = src.replace(
        f"ai-document-gen.{ns}.svc.cluster.local:8000",
        f"ai-document-gen.{ns}.svc.cluster.local:8090",
    )

    for svc in ("projects", "dashboard", "budget"):
        fq = f"{svc}.{args.namespace}.svc.cluster.local"
        for bad in ("8080", "8081", "8082", "8083"):
            src = src.replace(f"{fq}:{bad}", f"{fq}:80")

    if args.keycloak_issuer.strip():
        try:
            src = patch_keycloak_consumer(src, args.keycloak_issuer.strip())
        except Exception as e:
            print(f"error: Keycloak JWKS: {e}", file=sys.stderr)
            return 1

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(src, encoding="utf-8")
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
