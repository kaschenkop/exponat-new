'use client';

import { useQuery } from '@tanstack/react-query';
import { exhibitsApi } from '../api/exhibitsApi';

export function useExhibits(filters?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['logistics', 'exhibits', filters],
    queryFn: () => exhibitsApi.list(filters),
    staleTime: 20_000,
  });
}

export function useExhibit(id: string | undefined) {
  return useQuery({
    queryKey: ['logistics', 'exhibits', id],
    queryFn: () => exhibitsApi.get(id!),
    enabled: Boolean(id),
    staleTime: 20_000,
  });
}
