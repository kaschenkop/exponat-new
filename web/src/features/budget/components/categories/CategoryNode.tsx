'use client';

import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CategoryNode as CategoryNodeType } from '../../types/category.types';
import { AmountDisplay } from '../shared/AmountDisplay';
import { CategoryActions } from './CategoryActions';
import { CategoryIcon } from './categoryIcons';

export function CategoryNode({
  node,
  level,
  currency,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: CategoryNodeType;
  level: number;
  currency: string;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
}): React.ReactElement {
  const children = (node.children ?? []) as CategoryNodeType[];
  const hasChildren = children.length > 0;
  const isExpanded = node.expanded;
  const isOver = node.progressPercent > 100;

  return (
    <div>
      <div
        className={cn(
          'grid grid-cols-12 gap-2 border-b p-3 transition-colors hover:bg-muted/50 md:gap-4 md:p-4',
          node.selected && 'bg-muted/80',
          isOver && 'bg-destructive/5',
        )}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(node.id);
          }
        }}
        role="row"
        tabIndex={0}
      >
        <div
          className="col-span-12 flex items-center gap-2 md:col-span-5"
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 shrink-0 p-0"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <span className="inline-block w-7 shrink-0" />
          )}
          <CategoryIcon name={node.icon} color={node.color} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{node.name}</div>
            {node.code ? (
              <div className="truncate text-xs text-muted-foreground">{node.code}</div>
            ) : null}
          </div>
          {hasChildren ? (
            <span className="text-xs text-muted-foreground">
              ({node.childrenCount})
            </span>
          ) : null}
        </div>
        <div className="col-span-4 text-right tabular-nums md:col-span-2">
          <AmountDisplay amount={node.plannedAmount} currency={currency} />
        </div>
        <div className="col-span-4 md:col-span-2">
          <div className="text-right">
            <AmountDisplay amount={node.spentAmount} currency={currency} />
          </div>
          <Progress
            value={Math.min(node.progressPercent, 100)}
            className={cn('mt-1 h-1', isOver && '[&>div]:bg-destructive')}
          />
          <div
            className={cn(
              'mt-0.5 text-right text-xs',
              isOver ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {Math.round(node.progressPercent)}%
          </div>
        </div>
        <div className="col-span-3 text-right tabular-nums md:col-span-2">
          <AmountDisplay
            amount={node.remainingAmount}
            currency={currency}
            className={node.remainingAmount < 0 ? 'text-destructive' : undefined}
          />
        </div>
        <div
          className="col-span-1 flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <CategoryActions
            onEdit={() => onEdit(node.id)}
            onAddChild={() => onAddChild(node.id)}
            onDelete={() => onDelete(node.id)}
          />
        </div>
      </div>
      {isExpanded && hasChildren ? (
        <div>
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              level={level + 1}
              currency={currency}
              onToggle={onToggle}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
