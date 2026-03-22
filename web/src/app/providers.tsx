'use client';

import { AccessTokenSync } from '@/shared/components/auth/AccessTokenSync';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import * as React from 'react';

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <AccessTokenSync />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
