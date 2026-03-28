'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTranslations } from 'next-intl';
import type { SyncLogEntry } from '../../api/onecApi';

export function OneCLogs({ logs }: { logs: SyncLogEntry[] }): React.ReactElement {
  const t = useTranslations('budget.integration');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('logs')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
          {logs.length === 0 ? (
            <li className="text-muted-foreground">{t('noLogs')}</li>
          ) : (
            logs.map((log) => (
              <li key={log.id} className="border-b border-border/60 pb-2 font-mono text-xs last:border-0">
                <span className="text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString('ru-RU')}
                </span>{' '}
                <span className={log.level === 'error' ? 'text-destructive' : ''}>
                  [{log.level}]
                </span>{' '}
                {log.message}
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
