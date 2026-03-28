'use client';

import { useState } from 'react';
import { Grid, List, Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useExhibits } from '../../hooks/useExhibits';
import { useExhibitMutations } from '../../hooks/useExhibitMutations';
import { useLogisticsStore } from '../../store/logisticsStore';
import { ExhibitCard } from './ExhibitCard';
import { ExhibitForm } from './ExhibitForm';
import { ExhibitList } from './ExhibitList';

export function ExhibitsCatalog({
  locale,
}: {
  locale: string;
}): React.ReactElement {
  const t = useTranslations('logisticsModule.exhibits');
  const router = useRouter();
  const exhibitView = useLogisticsStore((s) => s.exhibitView);
  const setExhibitView = useLogisticsStore((s) => s.setExhibitView);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useExhibits({ search: search || undefined });
  const { remove } = useExhibitMutations();
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={exhibitView}
            onValueChange={(v) => setExhibitView(v as 'grid' | 'list')}
          >
            <TabsList>
              <TabsTrigger value="grid" aria-label={t('viewGrid')}>
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" aria-label={t('viewList')}>
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-lg" />
          ))}
        </div>
      ) : exhibitView === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((exhibit) => (
            <ExhibitCard
              key={exhibit.id}
              exhibit={exhibit}
              onOpen={() =>
                router.push(`/${locale}/dashboard/logistics/exhibits/${exhibit.id}`)
              }
            />
          ))}
        </div>
      ) : (
        <ExhibitList
          exhibits={items}
          onOpen={(id) =>
            router.push(`/${locale}/dashboard/logistics/exhibits/${id}`)
          }
          onDelete={(id) => void remove.mutateAsync(id)}
        />
      )}

      <ExhibitForm
        exhibitId={null}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
