'use client';

import { useProjectCollaboration } from '@/features/projects/hooks/useProjectCollaboration';

export function ProjectsShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  useProjectCollaboration(true);
  return <>{children}</>;
}
