'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useShipmentMutations } from '../../hooks/useShipmentMutations';
import { useLocations } from '../../hooks/useInventory';
import type { Location } from '../../types/exhibit.types';
import type { Shipment } from '../../types/shipment.types';

function emptyLoc(): Location {
  return {
    id: '',
    type: 'warehouse',
    name: '',
    address: '',
    building: null,
    floor: null,
    room: null,
    shelf: null,
    coordinates: { lat: 0, lng: 0 },
  };
}

export function ShipmentCreateForm({
  locale,
}: {
  locale: string;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.shipments.newForm');
  const router = useRouter();
  const { create } = useShipmentMutations();
  const { data: locs } = useLocations();
  const items = locs?.items ?? [];
  const [originId, setOriginId] = useState('');
  const [destId, setDestId] = useState('');
  const [transportType, setTransportType] = useState<Shipment['transportType']>(
    'van',
  );
  const [plate, setPlate] = useState('');

  const pick = (id: string) => items.find((l) => l.id === id) ?? emptyLoc();

  const submit = async () => {
    const origin = pick(originId);
    const dest = pick(destId);
    if (!origin.id || !dest.id) return;
    const body: Partial<Shipment> = {
      type: 'outgoing',
      status: 'planned',
      transportType,
      route: {
        origin,
        destination: dest,
        waypoints: [],
        distance: 0,
        estimatedDuration: 0,
      },
      plannedDepartureDate: new Date().toISOString(),
      plannedArrivalDate: new Date().toISOString(),
      vehicle: {
        type: 'Фургон',
        plateNumber: plate || '—',
        model: '',
        driverId: '',
        driverName: '',
        driverPhone: '',
        hasClimateControl: true,
        maxWeight: 1000,
      },
      exhibits: [],
      packaging: { cratesCount: 0, boxesCount: 0, packingListUrl: null },
      documents: [],
      cost: {
        amount: 0,
        currency: 'RUB',
        includedInBudget: false,
        budgetCategoryId: null,
      },
      trackingEnabled: false,
      currentLocation: null,
      monitoringEnabled: false,
      sensorIds: [],
      timeline: [],
      incidents: [],
      hasIncidents: false,
      projectId: null,
      completedAt: null,
    };
    const created = await create.mutateAsync(body);
    router.push(`/${locale}/dashboard/logistics/shipments/${created.id}`);
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>{t('origin')}</Label>
          <Select value={originId} onValueChange={setOriginId}>
            <SelectTrigger>
              <SelectValue placeholder={t('pick')} />
            </SelectTrigger>
            <SelectContent>
              {items.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('destination')}</Label>
          <Select value={destId} onValueChange={setDestId}>
            <SelectTrigger>
              <SelectValue placeholder={t('pick')} />
            </SelectTrigger>
            <SelectContent>
              {items.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('transport')}</Label>
          <Select
            value={transportType}
            onValueChange={(v) =>
              setTransportType(v as Shipment['transportType'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['truck', 'van', 'car', 'air', 'rail', 'sea'] as const).map(
                (x) => (
                  <SelectItem key={x} value={x}>
                    {t(`transportTypes.${x}`)}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plate">{t('plate')}</Label>
          <Input
            id="plate"
            placeholder="A000AA00"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            disabled={create.isPending || !originId || !destId}
            onClick={() => void submit()}
          >
            {t('submit')}
          </Button>
          <Button variant="outline" type="button" asChild>
            <Link href={`/${locale}/dashboard/logistics/shipments`}>
              {t('cancel')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
