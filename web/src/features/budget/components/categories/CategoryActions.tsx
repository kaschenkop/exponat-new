'use client';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CategoryActions({
  onEdit,
  onAddChild,
  onDelete,
}: {
  onEdit: () => void;
  onAddChild: () => void;
  onDelete: () => void;
}): React.ReactElement {
  const t = useTranslations('budget.categories');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={t('actions')}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          {t('edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddChild}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addChild')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
