'use client';

import { useProjectCollaborationStore } from '@/features/projects/store/projectCollaborationStore';
import { API_BASE_URL } from '@/shared/lib/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

function wsBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const u = new URL(API_BASE_URL);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  return u.origin;
}

function devOrgId(): string {
  return (
    process.env.NEXT_PUBLIC_DEV_ORGANIZATION_ID ??
    '11111111-1111-1111-1111-111111111111'
  );
}

export function useProjectCollaboration(enabled = true): void {
  const qc = useQueryClient();
  const setConnected = useProjectCollaborationStore((s) => s.setConnected);
  const pushEvent = useProjectCollaborationStore((s) => s.pushEvent);
  const ref = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const url = `${wsBaseUrl()}/api/projects/ws?organizationId=${encodeURIComponent(devOrgId())}`;
    const ws = new WebSocket(url);
    ref.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (ev) => {
      const raw = String(ev.data);
      pushEvent(raw);
      try {
        const j = JSON.parse(raw) as { type?: string; projectId?: string };
        if (j.type?.startsWith('project.')) {
          void qc.invalidateQueries({ queryKey: ['projects'] });
          if (j.projectId) {
            void qc.invalidateQueries({
              queryKey: ['projects', 'detail', j.projectId],
            });
          }
        }
      } catch {
        /* ignore */
      }
    };

    return () => {
      ws.close();
      ref.current = null;
      setConnected(false);
    };
  }, [enabled, qc, pushEvent, setConnected]);
}
