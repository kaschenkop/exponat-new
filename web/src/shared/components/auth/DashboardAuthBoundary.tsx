'use client';

import type { ReactNode } from 'react';

import { ProtectedRoute } from './ProtectedRoute';

export function DashboardAuthBoundary({ children }: { children: ReactNode }): React.ReactElement | null {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
