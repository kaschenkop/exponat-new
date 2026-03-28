'use client';

import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import type { Exhibit } from '../../types/exhibit.types';
import { ExhibitStatusBadge } from '../shared/ExhibitStatusBadge';

export function ExhibitCard({
  exhibit,
  onOpen,
}: {
  exhibit: Exhibit;
  onOpen: () => void;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.exhibits.status');

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring rounded-lg"
    >
      <Card className="h-full overflow-hidden">
        <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
          <Package className="h-12 w-12 text-muted-foreground/50" aria-hidden />
        </div>
        <CardHeader className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <ExhibitStatusBadge status={exhibit.status} label={t(exhibit.status)} />
          </div>
          <h3 className="font-display text-lg font-semibold leading-tight">
            {exhibit.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            {exhibit.inventoryNumber}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {exhibit.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {exhibit.currentLocation.name}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}
