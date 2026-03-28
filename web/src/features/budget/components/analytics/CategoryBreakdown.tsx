'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#94a3b8'];

export function CategoryBreakdown({
  data,
}: {
  data: { name: string; value: number }[];
}): React.ReactElement {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => v.toLocaleString('ru-RU')} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
