import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    idToken?: string;
    error?: string;
    user: {
      id: string;
      organizationId?: string;
      roles: string[];
      permissions: string[];
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    idToken?: string;
    organizationId?: string;
    roles?: string[];
    permissions?: string[];
    error?: string;
  }
}
