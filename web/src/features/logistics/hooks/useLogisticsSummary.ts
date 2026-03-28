'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reportsApi';

export function useLogisticsSummary() {
  return useQuery({
    queryKey: ['logistics', 'summary'],
    queryFn: () => reportsApi.summary(),
    staleTime: 30_000,
  });
}
