'use client';

import { useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Download, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Task, Milestone } from '@/features/projects/types/task.types';
import { cn } from '@/shared/lib/utils';

type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';

interface TaskGanttProps {
  tasks: Task[]
  milestones: Milestone[]
  onTaskClick: (taskId: string) => void
}

const ROW_H = 40;

const PIXELS_PER_DAY: Record<ZoomLevel, number> = {
  day: 40,
  week: 8,
  month: 2,
  quarter: 0.5,
};

const GANTT_COLORS: Record<string, string> = {
  in_progress: '#1A73E8',
  done: '#34A853',
  backlog: '#9E9E9E',
  review: '#9C27B0',
  cancelled: '#9E9E9E',
};

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / 86400000);
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

type GanttRow =
  | { kind: 'group'; name: string; count: number; isCollapsed: boolean }
  | { kind: 'task'; task: Task };

export function TaskGantt({ tasks, milestones, onTaskClick }: TaskGanttProps): React.ReactElement {
  const t = useTranslations('tasks');
  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
      const g = task.groupName || '—';
      if (!map[g]) map[g] = [];
      map[g].push(task);
    }
    return Object.entries(map).map(([name, items]) => ({ name, tasks: items }));
  }, [tasks]);

  const rows = useMemo<GanttRow[]>(() => {
    const result: GanttRow[] = [];
    for (const g of groups) {
      const isCollapsed = !!collapsed[g.name];
      result.push({ kind: 'group', name: g.name, count: g.tasks.length, isCollapsed });
      if (!isCollapsed) {
        for (const task of g.tasks) {
          result.push({ kind: 'task', task });
        }
      }
    }
    return result;
  }, [groups, collapsed]);

  const datedTasks = useMemo(() => {
    return tasks.filter(
      (t): t is Task & { startDate: string; dueDate: string } =>
        t.startDate !== null && t.dueDate !== null,
    );
  }, [tasks]);

  const { startDate, endDate, totalDays } = useMemo(() => {
    if (datedTasks.length === 0) {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 3);
      return { startDate: now, endDate: end, totalDays: 90 };
    }
    const first = datedTasks[0];
    if (!first) {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 3);
      return { startDate: now, endDate: end, totalDays: 90 };
    }
    let minD = new Date(first.startDate);
    let maxD = new Date(first.dueDate);
    for (const dt of datedTasks) {
      const s = new Date(dt.startDate);
      const e = new Date(dt.dueDate);
      if (s < minD) minD = s;
      if (e > maxD) maxD = e;
    }
    minD.setDate(minD.getDate() - 7);
    maxD.setDate(maxD.getDate() + 14);
    return { startDate: minD, endDate: maxD, totalDays: daysBetween(minD, maxD) };
  }, [datedTasks]);

  const ppd = PIXELS_PER_DAY[zoom];
  const timelineWidth = totalDays * ppd;

  const today = new Date();
  const todayOffset = daysBetween(startDate, today) * ppd;

  const monthHeaders = useMemo(() => {
    const headers: { label: string; width: number }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const end = monthEnd > endDate ? endDate : monthEnd;
      const days = daysBetween(monthStart, end) + 1;
      headers.push({
        label: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        width: days * ppd,
      });
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    return headers;
  }, [startDate, endDate, ppd]);

  const toggleGroup = (name: string) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const syncScroll = (source: 'left' | 'right') => {
    const from = source === 'left' ? leftRef.current : rightRef.current;
    const to = source === 'left' ? rightRef.current : leftRef.current;
    if (from && to) {
      to.scrollTop = from.scrollTop;
    }
  };

  const ganttStatusStyle = (task: Task) => {
    const statusKey =
      task.status === 'done' ? 'done' :
      task.status === 'in_progress' || task.status === 'review' ? 'in_progress' :
      'backlog';
    const fallback = { bg: '#F5F5F5', text: '#757575', label: t('status.backlog') };
    const map: Record<string, { bg: string; text: string; label: string }> = {
      done: { bg: '#E8F5E9', text: '#34A853', label: t('status.done') },
      in_progress: { bg: '#E3F2FD', text: '#1A73E8', label: t('status.in_progress') },
      backlog: fallback,
    };
    return map[statusKey] ?? fallback;
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div
          ref={leftRef}
          onScroll={() => syncScroll('left')}
          className="w-[300px] shrink-0 overflow-y-auto border-r bg-white"
          style={{ borderColor: '#E0E0E0' }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 border-b bg-gray-50"
            style={{ borderColor: '#E0E0E0' }}
          >
            <div className="flex text-xs font-semibold text-gray-700" style={{ height: ROW_H }}>
              <div className="flex flex-1 items-center px-3">{t('gantt.taskName')}</div>
              <div className="flex w-20 items-center justify-center">{t('gantt.status')}</div>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => {
            if (row.kind === 'group') {
              return (
                <button
                  key={`g-${row.name}`}
                  onClick={() => toggleGroup(row.name)}
                  className="flex w-full items-center gap-2 border-b px-3 hover:bg-gray-50"
                  style={{ height: ROW_H, borderColor: '#E0E0E0' }}
                >
                  {row.isCollapsed ? (
                    <ChevronRight size={16} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-600" />
                  )}
                  <span className="text-sm font-semibold text-gray-900">{row.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{row.count}</span>
                </button>
              );
            }
            const sc = ganttStatusStyle(row.task);
            return (
              <div
                key={row.task.id}
                className="flex cursor-pointer items-center border-b pl-10 pr-3 hover:bg-gray-50"
                style={{ height: ROW_H, borderColor: '#E0E0E0' }}
                onClick={() => onTaskClick(row.task.id)}
              >
                <span className="flex-1 truncate text-sm text-gray-700">
                  {row.task.title}
                </span>
                <span
                  className="rounded px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: sc.bg, color: sc.text }}
                >
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Panel — Timeline */}
        <div
          ref={rightRef}
          onScroll={() => syncScroll('right')}
          className="flex-1 overflow-auto"
        >
          <div className="relative bg-white" style={{ minWidth: `${timelineWidth}px` }}>
            {/* Month headers */}
            <div
              className="sticky top-0 z-10 flex border-b bg-white"
              style={{ height: ROW_H, borderColor: '#E0E0E0' }}
            >
              {monthHeaders.map((mh, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center border-r text-sm font-semibold"
                  style={{ width: `${mh.width}px`, borderColor: '#E0E0E0' }}
                >
                  {mh.label}
                </div>
              ))}
            </div>

            {/* Today line */}
            {todayOffset >= 0 && todayOffset <= timelineWidth && (
              <div
                className="pointer-events-none absolute bottom-0 z-20"
                style={{ left: `${todayOffset}px`, top: ROW_H, borderLeft: '2px dashed #EA4335' }}
              >
                <div
                  className="absolute -left-8 -top-1 rounded px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: '#EA4335' }}
                >
                  {t('gantt.today')}
                </div>
              </div>
            )}

            {/* Rows — same order as left panel */}
            {rows.map((row) => {
              if (row.kind === 'group') {
                return (
                  <div
                    key={`g-${row.name}`}
                    className="border-b bg-gray-50/50"
                    style={{ height: ROW_H, borderColor: '#E0E0E0' }}
                  />
                );
              }
              const task = row.task;
              const s = parseDate(task.startDate);
              const e = parseDate(task.dueDate);
              if (!s || !e) {
                return (
                  <div
                    key={task.id}
                    className="border-b"
                    style={{ height: ROW_H, borderColor: '#E0E0E0' }}
                  />
                );
              }
              const left = daysBetween(startDate, s) * ppd;
              const width = Math.max(daysBetween(s, e) * ppd, 4);
              const color = GANTT_COLORS[task.status] ?? '#9E9E9E';
              const isUpcoming = task.status === 'backlog';

              return (
                <div
                  key={task.id}
                  className="relative border-b"
                  style={{ height: ROW_H, borderColor: '#E0E0E0' }}
                >
                  <div
                    className="group absolute h-6 cursor-pointer rounded transition-all hover:shadow-md"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      top: (ROW_H - 24) / 2,
                      backgroundColor: color,
                      opacity: isUpcoming ? 0.5 : 1,
                    }}
                    onClick={() => onTaskClick(task.id)}
                  >
                    {task.progress > 0 && task.status !== 'done' && (
                      <div
                        className="absolute inset-0 rounded"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: task.status === 'in_progress' ? '#0D47A1' : color,
                        }}
                      />
                    )}
                    <div className="pointer-events-none absolute bottom-full left-0 mb-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {task.startDate} — {task.dueDate}
                      {task.progress > 0 && ` (${task.progress}%)`}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Milestones */}
            {milestones.map((ms) => {
              const d = parseDate(ms.date);
              if (!d) return null;
              const pos = daysBetween(startDate, d) * ppd;
              return (
                <div
                  key={ms.id}
                  className="pointer-events-none absolute bottom-0 z-10"
                  style={{ left: `${pos}px`, top: ROW_H }}
                >
                  <div className="relative">
                    <div
                      className="absolute -left-2 top-4 h-4 w-4 rotate-45"
                      style={{
                        backgroundColor: '#FBBC04',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    <div
                      className="absolute left-2 top-10 whitespace-nowrap rounded px-2 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: '#FBBC04' }}
                    >
                      {ms.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="flex h-14 shrink-0 items-center justify-between border-t bg-white px-6"
        style={{ borderColor: '#E0E0E0' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{t('gantt.zoom')}:</span>
          <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1">
            {(['day', 'week', 'month', 'quarter'] as ZoomLevel[]).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={cn(
                  'rounded px-3 py-1 text-sm transition-colors',
                  zoom === z
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                {t(`gantt.${z}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <div className="relative">
              <input
                type="checkbox"
                checked={showCriticalPath}
                onChange={() => setShowCriticalPath(!showCriticalPath)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={16} className="text-gray-600" />
              <span className="text-sm text-gray-700">{t('gantt.criticalPath')}</span>
            </div>
          </label>

          <button
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors hover:bg-gray-50"
            style={{ borderColor: '#E0E0E0' }}
          >
            <Download size={16} />
            <span>{t('gantt.exportPdf')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
