'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
  className?: string;
}): React.ReactElement {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-primary" aria-hidden />
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
          <div
            className={cn(
              'mt-2 flex items-center gap-1 text-xs font-medium',
              trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden />
            <span>{change}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
