'use client';

import { useTranslations } from 'next-intl';
import type { ApprovalHistoryItem as Item } from '../../types/approval.types';

export function ApprovalHistory({ items }: { items: Item[] }): React.ReactElement {
  const t = useTranslations('budget.approvals');
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{t('noHistory')}</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {items.map((h) => (
        <li key={h.id} className="border-b border-border pb-2 last:border-0">
          <span className="font-medium">{h.userName}</span>{' '}
          <span className="text-muted-foreground">
            {h.action} · {new Date(h.timestamp).toLocaleString('ru-RU')}
          </span>
          {h.comment ? <p className="mt-1">{h.comment}</p> : null}
        </li>
      ))}
    </ul>
  );
}
