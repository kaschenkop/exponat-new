import type { JWT } from 'next-auth/jwt';
import type { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import {
  decodeJwtPayload,
  readClientPermissions,
  readOrganizationId,
  readRealmRoles,
} from '@/shared/lib/auth/decode-access-token';

const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'exponat-web';
const keycloakApiClientId = process.env.KEYCLOAK_API_CLIENT_ID ?? 'exponat-api';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const issuer = process.env.KEYCLOAK_ISSUER;
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

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
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
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const idToken = message.token?.idToken as string | undefined;
      const issuer = process.env.KEYCLOAK_ISSUER;
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
