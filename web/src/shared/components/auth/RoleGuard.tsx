'use client';

import { useSession } from 'next-auth/react';
import type { ReactNode } from 'react';

type RoleGuardProps = {
  roles: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps): ReactNode {
  const { data: session } = useSession();

  if (!session) {
    return fallback;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasRole = roleArray.some((role) => session.user.roles.includes(role));

  if (!hasRole) {
    return fallback;
  }

  return <>{children}</>;
}
