'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exhibitsApi } from '../api/exhibitsApi';
import type { Exhibit } from '../types/exhibit.types';

export function useExhibitMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['logistics', 'exhibits'] });
    void qc.invalidateQueries({ queryKey: ['logistics', 'summary'] });
  };

  const create = useMutation({
    mutationFn: (body: Partial<Exhibit>) => exhibitsApi.create(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Exhibit> }) =>
      exhibitsApi.update(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => exhibitsApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
