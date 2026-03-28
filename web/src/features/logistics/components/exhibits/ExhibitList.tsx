'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import type { Exhibit } from '../../types/exhibit.types';
import { ExhibitStatusBadge } from '../shared/ExhibitStatusBadge';

export function ExhibitList({
  exhibits,
  onOpen,
  onDelete,
}: {
  exhibits: Exhibit[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.exhibits');
  const ts = useTranslations('logisticsModule.exhibits.status');

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
        <div>{t('columns.name')}</div>
        <div>{t('columns.inventory')}</div>
        <div>{t('columns.status')}</div>
        <div className="text-right">{t('columns.actions')}</div>
      </div>
      {exhibits.map((e) => (
        <div
          key={e.id}
          className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-4 border-b p-4 text-sm last:border-0 hover:bg-muted/40"
        >
          <button
            type="button"
            className="text-left font-medium hover:underline"
            onClick={() => onOpen(e.id)}
          >
            {e.name}
          </button>
          <span className="font-mono text-muted-foreground">{e.inventoryNumber}</span>
          <ExhibitStatusBadge status={e.status} label={ts(e.status)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpen(e.id)}>
              {t('open')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(e.id)}>
              {t('delete')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
