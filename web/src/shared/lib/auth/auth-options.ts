import type { JWT } from 'next-auth/jwt';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KeycloakProvider from 'next-auth/providers/keycloak';
import {
  decodeJwtPayload,
  readClientPermissions,
  readOrganizationId,
  readRealmRoles,
} from '@/shared/lib/auth/decode-access-token';

/**
 * Keycloak по публичному HTTPS с LE staging / неполной цепочкой → openid-client и fetch падают с
 * «unable to get local issuer certificate». Правильное решение — prod LE + полный chain на Ingress.
 * Временный обход только для staging: добавьте в секрет exponat-web-env KEYCLOAK_TLS_INSECURE=true.
 */
const keycloakTlsInsecure = process.env.KEYCLOAK_TLS_INSECURE === 'true';
if (keycloakTlsInsecure) {
  console.warn(
    '[auth] KEYCLOAK_TLS_INSECURE=true: отключена проверка TLS для исходящего HTTPS процесса Node. Уберите после исправления сертификатов.',
  );
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'exponat-web';
const keycloakApiClientId = process.env.KEYCLOAK_API_CLIENT_ID ?? 'exponat-api';

/** Issuer в ответе Keycloak (query `iss`) и в well-known без завершающего `/` — иначе openid-client даёт OAuthCallback. */
function normalizeKeycloakIssuer(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

const keycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET?.trim();

/**
 * Без секрета NextAuth отдаёт 500 на /api/auth/session (CLIENT_FETCH_ERROR).
 * Всегда задаём строку; для реального production обязательно выставьте NEXTAUTH_SECRET в окружении.
 */
function resolveNextAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'dev-only-nextauth-secret-min-32-characters-long!!';
  }
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[next-auth] NEXTAUTH_SECRET is missing; using insecure built-in placeholder. Set NEXTAUTH_SECRET in production.',
    );
  }
  return 'insecure-placeholder-set-NEXTAUTH_SECRET-in-env-min-32chars!!';
}

const nextAuthSecret = resolveNextAuthSecret();

/**
 * Issuer Keycloak (well-known OpenID). В development — локальный Keycloak (см. docs/keycloak-setup.md).
 * В production без этого значения подключается заглушка, чтобы не было 500 (вход не сработает, пока не зададите KEYCLOAK_ISSUER).
 */
const keycloakIssuerUrlRaw =
  process.env.KEYCLOAK_ISSUER ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8090/realms/exponat-development'
    : undefined);
const keycloakIssuerUrl = keycloakIssuerUrlRaw
  ? normalizeKeycloakIssuer(keycloakIssuerUrlRaw)
  : undefined;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const issuer = keycloakIssuerUrl;
  if (!issuer || !token.refreshToken) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
  try {
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    });
    const secret = process.env.KEYCLOAK_CLIENT_SECRET;
    if (secret) {
      body.set('client_secret', secret);
    }

    const res = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }
    const accessToken = json.access_token as string | undefined;
    const refreshToken = (json.refresh_token as string | undefined) ?? token.refreshToken;
    const expiresIn = json.expires_in as number | undefined;
    if (!accessToken) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }
    const claims = decodeJwtPayload(accessToken);
    return {
      ...token,
      accessToken,
      refreshToken,
      expiresAt: Math.floor(Date.now() / 1000 + (expiresIn ?? 300)),
      idToken: (json.id_token as string | undefined) ?? token.idToken,
      organizationId: readOrganizationId(claims),
      roles: readRealmRoles(claims),
      permissions: readClientPermissions(claims, keycloakApiClientId),
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

/**
 * Провайдер Keycloak в NextAuth v4 уже задаёт `checks: ["pkce", "state"]` (authorization code + PKCE).
 * Публичный клиент `exponat-web` в Keycloak без client secret.
 */
const keycloakProvider = keycloakIssuerUrl
  ? KeycloakProvider({
      clientId,
      issuer: keycloakIssuerUrl,
      // Публичный клиент (PKCE): без секрета — явно token_endpoint_auth_method: none, иначе пустой client_secret ломает обмен code (OAuthCallback).
      clientSecret: keycloakClientSecret ?? '',
      ...(keycloakClientSecret
        ? {}
        : {
            client: { token_endpoint_auth_method: 'none' as const },
          }),
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    })
  : null;

const stubKeycloakProvider = CredentialsProvider({
  id: 'keycloak',
  name: 'Keycloak',
  credentials: {},
  async authorize() {
    return null;
  },
});

export const authOptions: NextAuthOptions = {
  providers: [...(keycloakProvider ? [keycloakProvider] : [stubKeycloakProvider])],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        const accessToken = account.access_token;
        const claims = decodeJwtPayload(accessToken);
        token.accessToken = accessToken;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.idToken = account.id_token;
        token.organizationId = readOrganizationId(claims);
        token.roles = readRealmRoles(claims);
        token.permissions = readClientPermissions(claims, keycloakApiClientId);
        const sub = typeof claims.sub === 'string' ? claims.sub : undefined;
        if (sub) {
          token.sub = sub;
        } else if (profile && typeof profile.sub === 'string') {
          token.sub = profile.sub;
        }
        if (typeof claims.email === 'string') {
          token.email = claims.email;
        }
        return token;
      }

      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000 - 10_000) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.idToken = token.idToken as string | undefined;
      session.error = token.error as string | undefined;
      if (session.user) {
        session.user.id = (token.sub as string) ?? session.user.id;
        session.user.organizationId = token.organizationId as string | undefined;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.permissions = (token.permissions as string[]) ?? [];
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const idToken = message.token?.idToken as string | undefined;
      const issuer = keycloakIssuerUrl;
      const baseUrl = process.env.NEXTAUTH_URL;
      if (idToken && issuer && baseUrl) {
        const params = new URLSearchParams({
          id_token_hint: idToken,
          post_logout_redirect_uri: baseUrl,
        });
        try {
          await fetch(`${issuer}/protocol/openid-connect/logout?${params}`, { method: 'GET' });
        } catch {
          /* ignore */
        }
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: nextAuthSecret,
  debug:
    process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
};
