'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ApprovalRequest } from '../../types/approval.types';
import { AmountDisplay } from '../shared/AmountDisplay';

export function ApprovalCard({
  approval,
  currency,
  onApprove,
  onReject,
}: {
  approval: ApprovalRequest;
  currency: string;
  onApprove: (comment: string) => void;
  onReject: (reason: string) => void;
}): React.ReactElement {
  const t = useTranslations('budget.approvals');
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold">{approval.expenseTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {approval.vendor} · {approval.categoryName}
            </p>
          </div>
          <AmountDisplay
            amount={approval.expenseAmount}
            currency={currency}
            className="text-lg font-semibold"
          />
        </div>
        {approval.status === 'pending' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`c-${approval.id}`}>
                {t('comment')}
              </label>
              <textarea
                id={`c-${approval.id}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className={cn(
                  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              />
              <Button type="button" onClick={() => onApprove(comment)}>
                {t('approve')}
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`r-${approval.id}`}>
                {t('rejectReason')}
              </label>
              <textarea
                id={`r-${approval.id}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className={cn(
                  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => onReject(reason)}
              >
                {t('reject')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t(`status.${approval.status}`)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
