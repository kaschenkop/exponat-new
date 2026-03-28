import {
  Folder,
  Megaphone,
  Radio,
  Tag,
  Truck,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  Folder,
  Megaphone,
  Radio,
  Truck,
  Tag,
};

export function CategoryIcon({
  name,
  color,
}: {
  name: string;
  color: string;
}): React.ReactElement {
  const Icon = MAP[name] ?? Tag;
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
      style={{ backgroundColor: color }}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </div>
  );
}
