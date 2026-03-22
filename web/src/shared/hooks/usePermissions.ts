'use client';

import { useSession } from 'next-auth/react';

export function usePermissions(): {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  permissions: string[];
  roles: string[];
} {
  const { data: session } = useSession();

  const hasPermission = (permission: string): boolean =>
    session?.user.permissions.includes(permission) ?? false;

  const hasAnyPermission = (permissions: string[]): boolean =>
    permissions.some((perm) => hasPermission(perm));

  const hasAllPermissions = (permissions: string[]): boolean =>
    permissions.every((perm) => hasPermission(perm));

  const hasRole = (role: string): boolean => session?.user.roles.includes(role) ?? false;

  const hasAnyRole = (roles: string[]): boolean => roles.some((role) => hasRole(role));

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions: session?.user.permissions ?? [],
    roles: session?.user.roles ?? [],
  };
}
