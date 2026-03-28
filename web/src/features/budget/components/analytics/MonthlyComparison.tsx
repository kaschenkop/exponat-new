'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function MonthlyComparison({
  data,
}: {
  data: { month: string; planned: number; actual: number }[];
}): React.ReactElement {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1_000_000}M`} />
          <Tooltip formatter={(v: number) => v.toLocaleString('ru-RU')} />
          <Legend />
          <Bar dataKey="planned" fill="#94a3b8" name="plan" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" fill="hsl(var(--primary))" name="fact" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
