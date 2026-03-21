'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type VisitDatum = {
  name: string;
  v: number;
};

export function VisitSparkline({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: VisitDatum[];
}): React.ReactElement {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))' }}
              wrapperClassName="rounded-md border border-border bg-popover text-popover-foreground text-xs shadow-md"
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
