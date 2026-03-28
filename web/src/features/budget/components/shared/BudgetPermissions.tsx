'use client';

/**
 * Заглушка: при появлении claims в сессии — проверять budget:read / budget:write / budget:approve.
 */
export function BudgetPermissions({
  permission: _permission,
  children,
}: {
  permission: 'budget:read' | 'budget:write' | 'budget:approve';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
