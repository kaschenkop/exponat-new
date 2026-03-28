import type { Category } from '../types/category.types';
import type { CategoryNode } from '../types/category.types';

export function buildCategoryTree(
  items: Category[],
  expanded: Set<string>,
  selectedId: string | null,
): CategoryNode[] {
  const map = new Map<string, CategoryNode>();

  for (const item of items) {
    map.set(item.id, {
      ...item,
      children: [],
      expanded: expanded.has(item.id),
      selected: selectedId === item.id,
    });
  }

  const roots: CategoryNode[] = [];
  for (const item of items) {
    const node = map.get(item.id);
    if (!node) continue;
    if (item.parentId) {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    for (const n of nodes) {
      if (n.children.length > 0) {
        sortNodes(n.children as CategoryNode[]);
      }
    }
  };
  sortNodes(roots);
  return roots;
}

export function filterCategoryTree(
  nodes: CategoryNode[],
  query: string,
): CategoryNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  const out: CategoryNode[] = [];
  for (const node of nodes) {
    const childFiltered = filterCategoryTree(node.children as CategoryNode[], query);
    const match =
      node.name.toLowerCase().includes(q) ||
      (node.code?.toLowerCase().includes(q) ?? false);
    if (match || childFiltered.length > 0) {
      out.push({
        ...node,
        children: childFiltered as Category[],
      });
    }
  }
  return out;
}
