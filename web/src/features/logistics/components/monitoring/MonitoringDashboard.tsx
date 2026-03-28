'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useSensors } from '../../hooks/useSensors';

export function MonitoringDashboard(): React.ReactElement {
  const t = useTranslations('logisticsModule.monitoring');
  const { data, isLoading, isPending } = useSensors();
  const items = data?.items ?? [];
  const first = items[0];
  const chartData =
    first?.readings.map((r) => ({
      t: r.timestamp.slice(11, 19),
      value: r.value,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || isPending ? (
          <>
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </>
        ) : (
          items.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{s.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {s.currentReading.value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {s.currentReading.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.currentReading.status} · {s.currentReading.timestamp}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {first ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('chartTitle', { name: first.name })}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="t" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ fill: '#6366F1', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
