'use client';

import { useSession } from 'next-auth/react';
import type { ReactNode } from 'react';

type PermissionGuardProps = {
  permissions: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
};

export function PermissionGuard({
  permissions,
  children,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps): ReactNode {
  const { data: session } = useSession();

  if (!session) {
    return fallback;
  }

  const permArray = Array.isArray(permissions) ? permissions : [permissions];

  const hasPermission = requireAll
    ? permArray.every((perm) => session.user.permissions.includes(perm))
    : permArray.some((perm) => session.user.permissions.includes(perm));

  if (!hasPermission) {
    return fallback;
  }

  return <>{children}</>;
}
