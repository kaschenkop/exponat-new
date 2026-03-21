'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useProjectMutations(): {
  createMutation: ReturnType<
    typeof useMutation<
      unknown,
      Error,
      { name: string },
      unknown
    >
  >;
} {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string }) => payload,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return { createMutation };
}
