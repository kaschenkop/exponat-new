'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const STORAGE_KEY = 'access_token';

/** Пишет access token из NextAuth в localStorage — используют существующие API-клиенты (projects, dashboard). */
export function AccessTokenSync(): null {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (session?.accessToken) {
      try {
        window.localStorage.setItem(STORAGE_KEY, session.accessToken);
      } catch {
        /* ignore quota / private mode */
      }
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [session?.accessToken, status]);

  return null;
}
