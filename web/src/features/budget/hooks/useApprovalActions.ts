'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '../api/approvalsApi';

export function useApprovalActions(budgetId: string) {
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: ({
      approvalId,
      comment,
    }: {
      approvalId: string;
      comment: string;
    }) => approvalsApi.approve(budgetId, approvalId, comment),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'approvals'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'expenses'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId] });
    },
  });

  const reject = useMutation({
    mutationFn: ({
      approvalId,
      reason,
    }: {
      approvalId: string;
      reason: string;
    }) => approvalsApi.reject(budgetId, approvalId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'approvals'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId, 'expenses'] });
      void qc.invalidateQueries({ queryKey: ['budget', budgetId] });
    },
  });

  return { approve, reject };
}
