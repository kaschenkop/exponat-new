'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Download, Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useCategoryMutations } from '../../hooks/useCategoryMutations';
import { useBudget } from '../../hooks/useBudget';
import { buildCategoryTree, filterCategoryTree } from '../../utils/categoryHelpers';
import { CategoryDragDrop } from './CategoryDragDrop';
import { CategoryForm } from './CategoryForm';
import { CategoryImport1C } from './CategoryImport1C';
import { CategoryNode } from './CategoryNode';

export function CategoriesTree({ budgetId }: { budgetId: string }): React.ReactElement {
  const t = useTranslations('budget.categories');
  const { data: budget } = useBudget(budgetId);
  const { data: flat, isLoading } = useCategories(budgetId);
  const { deleteCategory } = useCategoryMutations(budgetId);

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tree = useMemo(
    () => buildCategoryTree(flat ?? [], expanded, selected),
    [flat, expanded, selected],
  );

  const filtered = useMemo(
    () => filterCategoryTree(tree, search),
    [tree, search],
  );

  const handleDelete = async (nodeId: string) => {
    if (typeof window !== 'undefined' && !window.confirm(t('confirmDelete'))) {
      return;
    }
    await deleteCategory.mutateAsync(nodeId);
  };

  const currency = budget?.currency ?? 'RUB';

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label={t('searchPlaceholder')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              setCreateParentId(null);
              setCreating(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('addRoot')}
          </Button>
          <Button variant="outline" type="button" disabled>
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          <CategoryImport1C />
        </div>
      </div>

      <CategoryDragDrop />

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-3 text-sm font-medium md:gap-4 md:p-4">
          <div className="col-span-12 md:col-span-5">{t('colName')}</div>
          <div className="col-span-4 text-right md:col-span-2">{t('colPlanned')}</div>
          <div className="col-span-4 md:col-span-2">{t('colSpent')}</div>
          <div className="col-span-3 text-right md:col-span-2">{t('colRemaining')}</div>
          <div className="col-span-1" />
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search ? t('emptySearch') : t('empty')}
          </div>
        ) : (
          filtered.map((node) => (
            <CategoryNode
              key={node.id}
              node={node}
              level={0}
              currency={currency}
              onToggle={toggle}
              onSelect={setSelected}
              onEdit={() => {}}
              onDelete={handleDelete}
              onAddChild={(parentId) => {
                setCreateParentId(parentId);
                setCreating(true);
              }}
            />
          ))
        )}
      </div>

      {creating ? (
        <CategoryForm
          budgetId={budgetId}
          parentId={createParentId}
          onClose={() => {
            setCreating(false);
            setCreateParentId(null);
          }}
        />
      ) : null}
    </div>
  );
}
