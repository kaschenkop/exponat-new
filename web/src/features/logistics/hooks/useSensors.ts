'use client';

import { useQuery } from '@tanstack/react-query';
import { sensorsApi } from '../api/sensorsApi';

export function useSensors() {
  return useQuery({
    queryKey: ['logistics', 'sensors'],
    queryFn: () => sensorsApi.list(),
    staleTime: 10_000,
    refetchInterval: 20_000,
    enabled: typeof window !== 'undefined',
  });
}
