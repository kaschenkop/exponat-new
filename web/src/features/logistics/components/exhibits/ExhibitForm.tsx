'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useExhibit } from '../../hooks/useExhibits';
import { useExhibitMutations } from '../../hooks/useExhibitMutations';
import type {
  Exhibit,
  ExhibitCategory,
  ExhibitCondition,
  ExhibitStatus,
} from '../../types/exhibit.types';

const emptyDraft = (): Partial<Exhibit> => ({
  name: '',
  inventoryNumber: '',
  description: '',
  category: 'other',
  status: 'in_storage',
  condition: 'good',
  tags: [],
  dimensions: { width: 0, height: 0, depth: 0, weight: 0 },
  estimatedValue: 0,
  insuranceValue: 0,
  isInsured: false,
  requirements: {
    temperatureMin: 18,
    temperatureMax: 22,
    humidityMin: 45,
    humidityMax: 55,
    fragile: false,
    requiresClimateControl: false,
    requiresSpecialHandling: false,
    handlingNotes: '',
  },
  images: [],
  primaryImageUrl: '',
  documents: [],
  locationHistory: [],
  currentShipmentId: null,
  projectId: null,
  qrCode: '',
  barcode: '',
  rfidTag: null,
  author: null,
  yearCreated: null,
  origin: null,
  acquisitionDate: new Date().toISOString().slice(0, 10),
  acquisitionSource: '',
});

export function ExhibitForm({
  exhibitId,
  open,
  onClose,
}: {
  exhibitId: string | null;
  open: boolean;
  onClose: () => void;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.exhibits.form');
  const { data: existing } = useExhibit(exhibitId ?? undefined);
  const { create, update } = useExhibitMutations();
  const [draft, setDraft] = useState<Partial<Exhibit>>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    if (exhibitId && existing) {
      setDraft({ ...existing });
    } else if (!exhibitId) {
      setDraft(emptyDraft());
    }
  }, [open, exhibitId, existing]);

  const handleSave = async () => {
    if (!draft.name?.trim()) return;
    if (exhibitId) {
      await update.mutateAsync({ id: exhibitId, body: draft });
    } else {
      await create.mutateAsync(draft);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {exhibitId ? t('editTitle') : t('createTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="ex-name">{t('name')}</Label>
            <Input
              id="ex-name"
              value={draft.name ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ex-inv">{t('inventoryNumber')}</Label>
            <Input
              id="ex-inv"
              value={draft.inventoryNumber ?? ''}
              onChange={(e) =>
                setDraft((d) => ({ ...d, inventoryNumber: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ex-desc">{t('description')}</Label>
            <textarea
              id="ex-desc"
              rows={3}
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={draft.description ?? ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('category')}</Label>
              <Select
                value={draft.category ?? 'other'}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, category: v as ExhibitCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      'painting',
                      'sculpture',
                      'artifact',
                      'document',
                      'photo',
                      'video',
                      'interactive',
                      'other',
                    ] as const
                  ).map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`categories.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('status')}</Label>
              <Select
                value={draft.status ?? 'in_storage'}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, status: v as ExhibitStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      'in_storage',
                      'on_display',
                      'in_transit',
                      'in_restoration',
                      'decommissioned',
                    ] as const
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`statuses.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t('condition')}</Label>
            <Select
              value={draft.condition ?? 'good'}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, condition: v as ExhibitCondition }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  ['excellent', 'good', 'fair', 'poor', 'damaged'] as const
                ).map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`conditions.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={create.isPending || update.isPending}
          >
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
