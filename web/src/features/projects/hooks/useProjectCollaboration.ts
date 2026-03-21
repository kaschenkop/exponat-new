'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { projectsWebSocketUrl } from '@/features/projects/api/projectsApi';
import { useProjectCollaborationStore } from '@/features/projects/store/projectCollaborationStore';

export function useProjectCollaboration(projectId: string | undefined) {
  const qc = useQueryClient();
  const setConnected = useProjectCollaborationStore((s) => s.setConnected);
  const pushEvent = useProjectCollaborationStore((s) => s.pushEvent);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    const url = projectsWebSocketUrl(projectId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as {
          type: string;
          data: unknown;
        };
        pushEvent(msg.type, msg.data);
        if (
          msg.type === 'project.updated' ||
          msg.type === 'team.member_added' ||
          msg.type === 'team.member_removed'
        ) {
          void qc.invalidateQueries({ queryKey: ['projects', projectId] });
          void qc.invalidateQueries({ queryKey: ['projects'] });
        }
        if (msg.type === 'project.deleted') {
          void qc.invalidateQueries({ queryKey: ['projects'] });
        }
      } catch {
        /* ignore */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [projectId, qc, pushEvent, setConnected]);

  return { socket: wsRef.current };
}
