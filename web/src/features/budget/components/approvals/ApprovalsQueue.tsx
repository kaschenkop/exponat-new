'use client';

import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useApprovalActions } from '../../hooks/useApprovalActions';
import { useApprovals } from '../../hooks/useApprovals';
import { useBudget } from '../../hooks/useBudget';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalHistory } from './ApprovalHistory';
import { ApprovalNotifications } from './ApprovalNotifications';
import { ApprovalRules } from './ApprovalRules';
import { ApprovalWorkflow } from './ApprovalWorkflow';

type Tab = 'pending' | 'approved' | 'rejected' | 'all';

export function ApprovalsQueue({ budgetId }: { budgetId: string }): React.ReactElement {
  const t = useTranslations('budget.approvals');
  const { data: budget } = useBudget(budgetId);
  const { data: approvals = [], isLoading } = useApprovals(budgetId);
  const { approve, reject } = useApprovalActions(budgetId);
  const [tab, setTab] = useState<Tab>('pending');

  const filtered = useMemo(() => {
    if (tab === 'all') return approvals;
    return approvals.filter((a) => a.status === tab);
  }, [approvals, tab]);

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;

  const currency = budget?.currency ?? 'RUB';

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">{t('stats.pending')}</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{pendingCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{t('stats.approved')}</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{approvedCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{t('stats.rejected')}</span>
          </div>
          <div className="text-3xl font-bold tabular-nums">{rejectedCount}</div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v: string) => setTab(v as Tab)}>
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="pending">
            {t('tabPending')} ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved">
            {t('tabApproved')} ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {t('tabRejected')} ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="all">{t('tabAll')}</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              {t('empty')}
            </div>
          ) : (
            filtered.map((a) => (
              <div key={a.id} className="space-y-2">
                <ApprovalCard
                  approval={a}
                  currency={currency}
                  onApprove={(comment) =>
                    approve.mutate({ approvalId: a.id, comment })
                  }
                  onReject={(reason) =>
                    reject.mutate({ approvalId: a.id, reason })
                  }
                />
                {a.history.length > 0 ? (
                  <ApprovalHistory items={a.history} />
                ) : null}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        <ApprovalWorkflow />
        <ApprovalRules />
      </div>
      <ApprovalNotifications />
    </div>
  );
}
