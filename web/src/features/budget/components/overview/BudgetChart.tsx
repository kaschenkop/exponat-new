'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTranslations } from 'next-intl';
import type { Category } from '../../types/category.types';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#64748b'];

export function BudgetChart({
  categories,
}: {
  categories: Category[];
}): React.ReactElement {
  const t = useTranslations('budget.overview');
  const roots = categories.filter((c) => !c.parentId);
  const data = roots.map((c) => ({
    name: c.name,
    value: Math.max(0, c.spentAmount),
    color: c.color || undefined,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('distribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noChart')}</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color ?? COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString('ru-RU')} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
