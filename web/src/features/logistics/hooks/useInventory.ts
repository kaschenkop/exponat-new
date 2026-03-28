'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';

export function useLocations() {
  return useQuery({
    queryKey: ['logistics', 'locations'],
    queryFn: () => inventoryApi.locations(),
    staleTime: 60_000,
    enabled: typeof window !== 'undefined',
  });
}

export function useInventoryAudits() {
  return useQuery({
    queryKey: ['logistics', 'inventory', 'audits'],
    queryFn: () => inventoryApi.audits(),
    staleTime: 30_000,
    enabled: typeof window !== 'undefined',
  });
}

export function useMovements() {
  return useQuery({
    queryKey: ['logistics', 'movements'],
    queryFn: () => inventoryApi.movements(),
    staleTime: 30_000,
    enabled: typeof window !== 'undefined',
  });
}
