'use client';

import { Badge } from '@/shared/ui/badge';

export function CategoryBadge({
  name,
  color,
}: {
  name: string;
  color?: string;
}): React.ReactElement {
  return (
    <Badge
      variant="outline"
      className="font-normal"
      style={color ? { borderColor: color, color } : undefined}
    >
      {name}
    </Badge>
  );
}
