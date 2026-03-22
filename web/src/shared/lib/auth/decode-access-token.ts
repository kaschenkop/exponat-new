/** Decode JWT payload (no signature verification — only for extracting claims after NextAuth). */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  const payload = parts[1];
  if (!payload) {
    return {};
  }
  const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLen);
  if (typeof Buffer !== 'undefined') {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) as Record<string, unknown>;
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as Record<string, unknown>;
}

export function readOrganizationId(claims: Record<string, unknown>): string | undefined {
  const raw = claims.organization_id;
  if (typeof raw === 'string') {
    return raw;
  }
  if (Array.isArray(raw) && typeof raw[0] === 'string') {
    return raw[0];
  }
  return undefined;
}

export function readRealmRoles(claims: Record<string, unknown>): string[] {
  const ra = claims.realm_access as { roles?: string[] } | undefined;
  return ra?.roles ?? [];
}

export function readClientPermissions(
  claims: Record<string, unknown>,
  clientId: string,
): string[] {
  const ra = claims.resource_access as
    | Record<string, { roles?: string[] } | undefined>
    | undefined;
  return ra?.[clientId]?.roles ?? [];
}
