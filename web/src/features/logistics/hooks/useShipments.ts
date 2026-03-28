'use client';

import { useQuery } from '@tanstack/react-query';
import { shipmentsApi } from '../api/shipmentsApi';

export function useShipments() {
  return useQuery({
    queryKey: ['logistics', 'shipments'],
    queryFn: () => shipmentsApi.list(),
    staleTime: 20_000,
    enabled: typeof window !== 'undefined',
  });
}

export function useShipment(id: string | undefined) {
  return useQuery({
    queryKey: ['logistics', 'shipments', id],
    queryFn: () => shipmentsApi.get(id!),
    enabled: Boolean(id) && typeof window !== 'undefined',
    staleTime: 20_000,
  });
}
