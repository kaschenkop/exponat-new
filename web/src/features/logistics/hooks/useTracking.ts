'use client';

import { useQuery } from '@tanstack/react-query';
import { trackingApi } from '../api/trackingApi';

export function useTrackingDevices() {
  return useQuery({
    queryKey: ['logistics', 'tracking', 'devices'],
    queryFn: () => trackingApi.devices(),
    staleTime: 10_000,
    refetchInterval: 15_000,
    enabled: typeof window !== 'undefined',
  });
}

export function useTrackingHistory(deviceId: string | undefined) {
  return useQuery({
    queryKey: ['logistics', 'tracking', 'history', deviceId],
    queryFn: () => trackingApi.deviceHistory(deviceId!),
    enabled: Boolean(deviceId) && typeof window !== 'undefined',
    staleTime: 30_000,
  });
}
