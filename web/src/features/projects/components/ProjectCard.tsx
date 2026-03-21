import type { ProjectType } from '@/features/projects/types/project.types';
import { Card, CardHeader, CardTitle } from '@/shared/ui/card';

export function ProjectCard({ project }: { project: ProjectType }): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}
