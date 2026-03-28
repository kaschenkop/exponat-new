'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi } from '../api/shipmentsApi';
import type { Shipment } from '../types/shipment.types';

export function useShipmentMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['logistics', 'shipments'] });
    void qc.invalidateQueries({ queryKey: ['logistics', 'summary'] });
  };

  const create = useMutation({
    mutationFn: (body: Partial<Shipment>) => shipmentsApi.create(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Shipment> }) =>
      shipmentsApi.update(id, body),
    onSuccess: invalidate,
  });

  return { create, update };
}
