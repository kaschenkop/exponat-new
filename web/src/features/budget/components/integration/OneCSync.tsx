'use client';

import { Button } from '@/shared/ui/button';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function OneCSync({
  onSync,
  pending,
}: {
  onSync: () => void;
  pending: boolean;
}): React.ReactElement {
  const t = useTranslations('budget.integration');
  return (
    <Button type="button" onClick={onSync} disabled={pending}>
      <RefreshCw className={`mr-2 h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
      {t('sync')}
    </Button>
  );
}
