'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import { Boxes, Truck, Users, Wallet, type LucideIcon } from 'lucide-react';

const metricIcons = {
  projects: Boxes,
  budget: Wallet,
  logistics: Truck,
  participants: Users,
} satisfies Record<string, LucideIcon>;

export type MetricIconKey = keyof typeof metricIcons;

export function StatsCard({
  title,
  value,
  hint,
  iconKey,
  className,
}: {
  title: string;
  value: string;
  hint?: string;
  iconKey: MetricIconKey;
  className?: string;
}): React.ReactElement {
  const Icon = metricIcons[iconKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-primary" aria-hidden />
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-bold tracking-tight">
            {value}
          </div>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
