# ПРОМПТ: МОДУЛЬ BUDGET (ПОЛНАЯ РЕАЛИЗАЦИЯ)

## КОНТЕКСТ

@Figma https://www.figma.com/make/L1VGQ0EGt8zhTaVzinZpJU/SaaS-Dashboard-Design?t=63OcE7VqmOunUdIs-1
@Codebase exponat/
@File exponat/.cursorrules
@File exponat/ARCHITECTURE.md
@File exponat/GITOPS_RULES.md

Создай **полностью работающий** модуль Budget для платформы Экспонат со всеми представлениями и функциями:
- 💰 **Overview** - общий обзор бюджета с прогрессом
- 📊 **Categories** - иерархические категории расходов (дерево)
- 📝 **Expenses** - список всех расходов с фильтрами
- ✅ **Approvals** - workflow согласования платежей
- 📈 **Analytics** - графики, тренды, прогнозы
- 🔗 **1C Integration** - синхронизация с 1С

---

## АРХИТЕКТУРА МОДУЛЯ

### Структура файлов

```
exponat/web/src/features/budget/
├── components/
│   ├── BudgetHeader.tsx                 # Header с tabs навигацией
│   ├── BudgetViewTabs.tsx               # Tabs для переключения views
│   │
│   ├── overview/                        # Overview view
│   │   ├── BudgetOverview.tsx           # Main component
│   │   ├── BudgetSummary.tsx            # Общая сводка (total, spent, remaining)
│   │   ├── BudgetProgress.tsx           # Progress bars по категориям
│   │   ├── BudgetAlerts.tsx             # Alerts при превышении
│   │   ├── RecentExpenses.tsx           # Последние расходы
│   │   └── BudgetChart.tsx              # Pie chart распределения
│   │
│   ├── categories/                      # Categories view (Tree)
│   │   ├── CategoriesTree.tsx           # Main Tree component
│   │   ├── CategoryNode.tsx             # Один узел дерева
│   │   ├── CategoryForm.tsx             # Форма создания/редактирования
│   │   ├── CategoryActions.tsx          # Actions (edit, delete, add child)
│   │   ├── CategoryDragDrop.tsx         # Drag & drop для перестановки
│   │   └── CategoryImport1C.tsx         # Импорт из 1С
│   │
│   ├── expenses/                        # Expenses view (List)
│   │   ├── ExpensesList.tsx             # Main List component
│   │   ├── ExpenseCard.tsx              # Карточка одного расхода
│   │   ├── ExpenseForm.tsx              # Форма создания расхода
│   │   ├── ExpenseFilters.tsx           # Фильтры (category, date, status)
│   │   ├── ExpenseSearch.tsx            # Поиск
│   │   ├── ExpenseBulkActions.tsx       # Массовые действия
│   │   └── ExpenseAttachments.tsx       # Вложения (чеки, счета)
│   │
│   ├── approvals/                       # Approvals workflow
│   │   ├── ApprovalsQueue.tsx           # Main component (очередь)
│   │   ├── ApprovalCard.tsx             # Карточка на согласование
│   │   ├── ApprovalHistory.tsx          # История согласований
│   │   ├── ApprovalWorkflow.tsx         # Настройка workflow
│   │   ├── ApprovalRules.tsx            # Правила (сумма, категория)
│   │   └── ApprovalNotifications.tsx    # Уведомления
│   │
│   ├── analytics/                       # Analytics view
│   │   ├── BudgetAnalytics.tsx          # Main component
│   │   ├── SpendingTrends.tsx           # График трендов по времени
│   │   ├── CategoryBreakdown.tsx        # Breakdown по категориям
│   │   ├── MonthlyComparison.tsx        # Сравнение месяцев
│   │   ├── BudgetForecast.tsx           # Прогноз расходов
│   │   ├── TopExpenses.tsx              # Топ расходов
│   │   └── ExportReports.tsx            # Export в Excel/PDF
│   │
│   ├── integration/                     # 1C Integration
│   │   ├── OneCIntegration.tsx          # Main component
│   │   ├── OneCSync.tsx                 # Синхронизация
│   │   ├── OneCMapping.tsx              # Mapping категорий
│   │   ├── OneCLogs.tsx                 # Логи синхронизации
│   │   └── OneCSettings.tsx             # Настройки подключения
│   │
│   ├── shared/                          # Общие компоненты
│   │   ├── BudgetStatusBadge.tsx        # Badge статуса бюджета
│   │   ├── ExpenseStatusBadge.tsx       # Badge статуса расхода
│   │   ├── CategoryBadge.tsx            # Badge категории
│   │   ├── AmountDisplay.tsx            # Форматирование сумм
│   │   ├── CurrencySelect.tsx           # Выбор валюты
│   │   ├── DateRangePicker.tsx          # Выбор периода
│   │   └── BudgetPermissions.tsx        # Проверка прав
│   │
│   └── BudgetList.tsx                   # Список бюджетов (главная)
│
├── hooks/
│   ├── useBudget.ts                     # Один бюджет
│   ├── useBudgets.ts                    # Список бюджетов
│   ├── useCategories.ts                 # Категории (tree structure)
│   ├── useCategoryMutations.ts          # CRUD категорий
│   ├── useExpenses.ts                   # Расходы с фильтрами
│   ├── useExpenseMutations.ts           # CRUD расходов
│   ├── useApprovals.ts                  # Очередь согласований
│   ├── useApprovalActions.ts            # Approve/Reject
│   ├── useBudgetAnalytics.ts            # Аналитика данных
│   ├── useOneC.ts                       # 1C интеграция
│   └── useBudgetView.ts                 # Текущий view (state)
│
├── api/
│   ├── budgetsApi.ts                    # API для бюджетов
│   ├── categoriesApi.ts                 # API для категорий
│   ├── expensesApi.ts                   # API для расходов
│   ├── approvalsApi.ts                  # API для согласований
│   └── onecApi.ts                       # API для 1С
│
├── store/
│   ├── budgetStore.ts                   # Zustand store (UI state)
│   └── expenseStore.ts                  # Расходы UI state
│
├── types/
│   ├── budget.types.ts                  # Типы бюджетов
│   ├── category.types.ts                # Типы категорий
│   ├── expense.types.ts                 # Типы расходов
│   └── approval.types.ts                # Типы согласований
│
└── utils/
    ├── budgetHelpers.ts
    ├── categoryHelpers.ts               # Работа с деревом
    ├── expenseHelpers.ts
    ├── amountFormatters.ts              # Форматирование валют
    ├── budgetCalculations.ts            # Вычисления
    └── budgetValidation.ts              # Zod schemas
```

### App Router Pages

```
exponat/web/src/app/[locale]/(dashboard)/budgets/
├── page.tsx                             # Список бюджетов
├── new/
│   └── page.tsx                         # Создание бюджета
└── [id]/
    ├── page.tsx                         # Redirect на overview
    ├── overview/
    │   └── page.tsx                     # Overview view
    ├── categories/
    │   └── page.tsx                     # Categories Tree view
    ├── expenses/
    │   └── page.tsx                     # Expenses List view
    ├── approvals/
    │   └── page.tsx                     # Approvals Queue view
    ├── analytics/
    │   └── page.tsx                     # Analytics view
    ├── integration/
    │   └── page.tsx                     # 1C Integration view
    └── layout.tsx                       # Layout с tabs навигацией
```

---

## TYPESCRIPT TYPES

### budget.types.ts

```typescript
export type BudgetStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type Currency = 'RUB' | 'USD' | 'EUR'

export interface Budget {
  id: string
  projectId: string
  organizationId: string
  
  // Основное
  name: string
  description: string
  status: BudgetStatus
  period: BudgetPeriod
  currency: Currency
  
  // Даты
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  
  // Суммы
  totalPlanned: number
  totalSpent: number
  totalApproved: number
  totalPending: number
  totalRemaining: number  // calculated
  
  // Прогресс
  progressPercent: number  // 0-100
  
  // Alerts
  warningThreshold: number  // % (например, 80)
  criticalThreshold: number  // % (например, 90)
  isOverBudget: boolean
  
  // Владелец
  managerId: string
  managerName: string
  
  // Настройки
  settings: {
    requireApproval: boolean
    approvalThreshold: number  // сумма выше которой нужно согласование
    autoSyncWith1C: boolean
    notifyOnThreshold: boolean
  }
}

export interface BudgetSummary {
  totalBudgets: number
  totalPlanned: number
  totalSpent: number
  totalRemaining: number
  averageProgress: number
  overBudgetCount: number
  activeCount: number
}
```

### category.types.ts

```typescript
export interface Category {
  id: string
  budgetId: string
  
  // Иерархия
  parentId: string | null
  path: string  // "1.2.3" для сортировки
  level: number  // 0 = root, 1 = child, etc.
  order: number  // порядок среди siblings
  
  // Основное
  name: string
  code: string  // для 1С
  description: string
  color: string  // hex color для визуализации
  icon: string  // lucide icon name
  
  // Бюджет категории
  plannedAmount: number
  spentAmount: number
  approvedAmount: number
  pendingAmount: number
  remainingAmount: number  // calculated
  
  // Дочерние категории
  children: Category[]
  hasChildren: boolean
  childrenCount: number
  
  // Прогресс
  progressPercent: number
  isOverBudget: boolean
  
  // 1С
  onecId: string | null
  onecSynced: boolean
  lastSyncAt: string | null
  
  createdAt: string
  updatedAt: string
}

export interface CategoryNode extends Category {
  expanded: boolean  // для UI дерева
  selected: boolean
}
```

### expense.types.ts

```typescript
export type ExpenseStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paid' | 'cancelled'
export type ExpenseType = 'invoice' | 'receipt' | 'contract' | 'other'
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other'

export interface Expense {
  id: string
  budgetId: string
  categoryId: string
  organizationId: string
  
  // Основное
  title: string
  description: string
  type: ExpenseType
  status: ExpenseStatus
  
  // Суммы
  amount: number
  currency: Currency
  amountRUB: number  // конвертированная сумма
  
  // Даты
  expenseDate: string  // дата расхода
  dueDate: string | null  // срок оплаты
  paidDate: string | null  // дата оплаты
  createdAt: string
  updatedAt: string
  
  // Платеж
  paymentMethod: PaymentMethod
  invoiceNumber: string | null
  contractNumber: string | null
  
  // Исполнители
  createdBy: string
  createdByName: string
  vendor: string  // поставщик
  vendorINN: string | null
  
  // Согласование
  requiresApproval: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected' | null
  approvedBy: string | null
  approvedByName: string | null
  approvedAt: string | null
  rejectionReason: string | null
  
  // Вложения
  attachments: ExpenseAttachment[]
  attachmentCount: number
  
  // Категория (denormalized для удобства)
  categoryName: string
  categoryPath: string  // "Категория 1 > Подкатегория 2"
  
  // 1С
  onecId: string | null
  onecSynced: boolean
  lastSyncAt: string | null
  
  // Метаданные
  tags: string[]
  notes: string
}

export interface ExpenseAttachment {
  id: string
  expenseId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
}

export interface ExpenseFilters {
  search: string
  categoryIds: string[]
  statuses: ExpenseStatus[]
  types: ExpenseType[]
  dateFrom: string
  dateTo: string
  amountMin: number
  amountMax: number
  vendors: string[]
  createdBy: string[]
}
```

### approval.types.ts

```typescript
export type ApprovalAction = 'approve' | 'reject' | 'request_changes'
export type ApprovalLevel = 1 | 2 | 3  // multi-level approval

export interface ApprovalRequest {
  id: string
  expenseId: string
  budgetId: string
  
  // Expense info (denormalized)
  expenseTitle: string
  expenseAmount: number
  expenseCurrency: Currency
  categoryName: string
  vendor: string
  
  // Approval info
  level: ApprovalLevel
  requiredApprovers: string[]  // user IDs
  currentApprover: string | null
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  
  // Timing
  createdAt: string
  dueDate: string  // SLA
  respondedAt: string | null
  
  // History
  history: ApprovalHistoryItem[]
}

export interface ApprovalHistoryItem {
  id: string
  action: ApprovalAction
  userId: string
  userName: string
  userAvatar: string | null
  comment: string
  timestamp: string
}

export interface ApprovalWorkflow {
  id: string
  budgetId: string
  name: string
  
  // Rules
  rules: ApprovalRule[]
  
  // Settings
  requireSequentialApproval: boolean  // последовательно или параллельно
  autoApproveBelow: number  // авто-approve ниже суммы
  slaHours: number  // SLA в часах
  
  enabled: boolean
}

export interface ApprovalRule {
  id: string
  condition: 'amount_above' | 'category_is' | 'vendor_is'
  value: string | number
  approvers: string[]  // user IDs
  level: ApprovalLevel
}
```

---

## КОМПОНЕНТЫ (ДЕТАЛЬНАЯ РЕАЛИЗАЦИЯ)

### 1. BudgetViewTabs.tsx - Навигация между views

```typescript
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { 
  LayoutGrid, 
  FolderTree, 
  Receipt, 
  CheckSquare, 
  TrendingUp,
  Link2
} from 'lucide-react'

interface BudgetViewTabsProps {
  budgetId: string
}

export function BudgetViewTabs({ budgetId }: BudgetViewTabsProps) {
  const t = useTranslations('budget.views')
  const router = useRouter()
  const pathname = usePathname()
  
  // Определить текущий view из URL
  const currentView = pathname.split('/').pop() as BudgetView
  
  const views = [
    { value: 'overview', label: t('overview'), icon: LayoutGrid },
    { value: 'categories', label: t('categories'), icon: FolderTree },
    { value: 'expenses', label: t('expenses'), icon: Receipt },
    { value: 'approvals', label: t('approvals'), icon: CheckSquare },
    { value: 'analytics', label: t('analytics'), icon: TrendingUp },
    { value: 'integration', label: t('integration'), icon: Link2 },
  ]
  
  const handleViewChange = (view: string) => {
    router.push(`/budgets/${budgetId}/${view}`)
  }
  
  return (
    <Tabs value={currentView} onValueChange={handleViewChange}>
      <TabsList className="grid w-full grid-cols-6">
        {views.map(({ value, label, icon: Icon }) => (
          <TabsTrigger 
            key={value} 
            value={value}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
```

### 2. CategoriesTree.tsx - Иерархическое дерево категорий

```typescript
'use client'

import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { useCategoryMutations } from '../../hooks/useCategoryMutations'
import { CategoryNode } from './CategoryNode'
import { CategoryForm } from './CategoryForm'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Plus, Search, Download, Upload } from 'lucide-react'
import type { Category, CategoryNode as CategoryNodeType } from '../../types/category.types'

interface CategoriesTreeProps {
  budgetId: string
}

export function CategoriesTree({ budgetId }: CategoriesTreeProps) {
  const { data: categories, isLoading } = useCategories(budgetId)
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations()
  
  const [search, setSearch] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  
  // Построить дерево из плоского списка
  const buildTree = (items: Category[]): CategoryNodeType[] => {
    const map = new Map<string, CategoryNodeType>()
    const roots: CategoryNodeType[] = []
    
    // Создать nodes
    items.forEach(item => {
      map.set(item.id, {
        ...item,
        children: [],
        expanded: expandedNodes.has(item.id),
        selected: selectedNode === item.id,
      })
    })
    
    // Построить иерархию
    items.forEach(item => {
      const node = map.get(item.id)!
      
      if (item.parentId) {
        const parent = map.get(item.parentId)
        if (parent) {
          parent.children.push(node)
        }
      } else {
        roots.push(node)
      }
    })
    
    // Сортировать по order
    const sortNodes = (nodes: CategoryNodeType[]) => {
      nodes.sort((a, b) => a.order - b.order)
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children)
        }
      })
    }
    
    sortNodes(roots)
    
    return roots
  }
  
  // Фильтрация по поиску
  const filterTree = (nodes: CategoryNodeType[], query: string): CategoryNodeType[] => {
    if (!query) return nodes
    
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(query.toLowerCase()) ||
                           node.code?.toLowerCase().includes(query.toLowerCase())
      
      const filteredChildren = filterTree(node.children, query)
      
      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        }
      }
      
      return false
    })
  }
  
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }
  
  const handleCreateCategory = (parentId: string | null) => {
    setIsCreating(true)
    setSelectedNode(parentId)
  }
  
  const handleEditCategory = (nodeId: string) => {
    setEditingNode(nodeId)
  }
  
  const handleDeleteCategory = async (nodeId: string) => {
    if (confirm('Удалить категорию и все подкатегории?')) {
      await deleteCategory.mutateAsync(nodeId)
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  
  const tree = buildTree(categories || [])
  const filteredTree = filterTree(tree, search)
  
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск категорий..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Actions */}
        <Button onClick={() => handleCreateCategory(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить категорию
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Экспорт
        </Button>
        
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Импорт из 1С
        </Button>
      </div>
      
      {/* Tree */}
      <div className="border rounded-lg">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
          <div className="col-span-5">Название</div>
          <div className="col-span-2 text-right">План</div>
          <div className="col-span-2 text-right">Факт</div>
          <div className="col-span-2 text-right">Остаток</div>
          <div className="col-span-1"></div>
        </div>
        
        {/* Nodes */}
        <div>
          {filteredTree.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search ? 'Ничего не найдено' : 'Нет категорий. Создайте первую категорию.'}
            </div>
          ) : (
            filteredTree.map(node => (
              <CategoryNode
                key={node.id}
                node={node}
                level={0}
                onToggle={toggleNode}
                onSelect={setSelectedNode}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onAddChild={(parentId) => handleCreateCategory(parentId)}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Create/Edit Dialog */}
      {(isCreating || editingNode) && (
        <CategoryForm
          budgetId={budgetId}
          parentId={selectedNode}
          categoryId={editingNode}
          onClose={() => {
            setIsCreating(false)
            setEditingNode(null)
          }}
        />
      )}
    </div>
  )
}
```

### 3. CategoryNode.tsx - Узел дерева категории

```typescript
'use client'

import { ChevronRight, ChevronDown, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Progress } from '@/shared/ui/progress'
import { cn } from '@/shared/lib/utils'
import { AmountDisplay } from '../shared/AmountDisplay'
import type { CategoryNode as CategoryNodeType } from '../../types/category.types'

interface CategoryNodeProps {
  node: CategoryNodeType
  level: number
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string) => void
  onEdit: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onAddChild: (parentId: string) => void
}

export function CategoryNode({
  node,
  level,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryNodeProps) {
  const hasChildren = node.children.length > 0
  const isExpanded = node.expanded
  const isOverBudget = node.progressPercent > 100
  
  return (
    <div>
      {/* Current node */}
      <div
        className={cn(
          "grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/50 transition-colors",
          node.selected && "bg-muted",
          isOverBudget && "bg-destructive/5"
        )}
        onClick={() => onSelect(node.id)}
      >
        {/* Name column */}
        <div className="col-span-5 flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
          {/* Expand/Collapse button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onToggle(node.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Icon */}
          {node.icon && (
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white"
              style={{ backgroundColor: node.color }}
            >
              <span className="text-sm">{node.icon}</span>
            </div>
          )}
          
          {/* Name */}
          <div className="flex-1">
            <div className="font-medium">{node.name}</div>
            {node.code && (
              <div className="text-xs text-muted-foreground">{node.code}</div>
            )}
          </div>
          
          {/* Children count */}
          {hasChildren && (
            <div className="text-xs text-muted-foreground">
              ({node.childrenCount})
            </div>
          )}
        </div>
        
        {/* Planned amount */}
        <div className="col-span-2 text-right flex items-center justify-end">
          <AmountDisplay amount={node.plannedAmount} currency="RUB" />
        </div>
        
        {/* Spent amount */}
        <div className="col-span-2 text-right">
          <div className="flex items-center justify-end">
            <AmountDisplay amount={node.spentAmount} currency="RUB" />
          </div>
          {/* Progress bar */}
          <Progress 
            value={Math.min(node.progressPercent, 100)} 
            className={cn(
              "h-1 mt-1",
              isOverBudget && "bg-destructive"
            )}
          />
          <div className={cn(
            "text-xs mt-1",
            isOverBudget ? "text-destructive" : "text-muted-foreground"
          )}>
            {node.progressPercent.toFixed(0)}%
          </div>
        </div>
        
        {/* Remaining amount */}
        <div className="col-span-2 text-right flex items-center justify-end">
          <AmountDisplay 
            amount={node.remainingAmount} 
            currency="RUB"
            className={cn(
              node.remainingAmount < 0 && "text-destructive"
            )}
          />
        </div>
        
        {/* Actions */}
        <div className="col-span-1 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(node.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(node.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить подкатегорию
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(node.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Children nodes (recursive) */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <CategoryNode
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 4. ExpensesList.tsx - Список расходов с фильтрами

```typescript
'use client'

import { useState } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { useExpenseMutations } from '../../hooks/useExpenseMutations'
import { ExpenseCard } from './ExpenseCard'
import { ExpenseFilters } from './ExpenseFilters'
import { ExpenseForm } from './ExpenseForm'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Plus, Search, Download, Filter } from 'lucide-react'
import type { ExpenseFilters as ExpenseFiltersType } from '../../types/expense.types'

interface ExpensesListProps {
  budgetId: string
}

export function ExpensesList({ budgetId }: ExpensesListProps) {
  const [filters, setFilters] = useState<ExpenseFiltersType>({
    search: '',
    categoryIds: [],
    statuses: [],
    types: [],
    dateFrom: '',
    dateTo: '',
    amountMin: 0,
    amountMax: 0,
    vendors: [],
    createdBy: [],
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  
  const { data, isLoading, fetchNextPage, hasNextPage } = useExpenses(budgetId, filters)
  const { createExpense, updateExpense, deleteExpense } = useExpenseMutations()
  
  const expenses = data?.pages.flatMap(page => page.items) || []
  
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск расходов..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter toggle */}
        <Button 
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Фильтры
          {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v !== 0)) && (
            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        
        {/* Actions */}
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить расход
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Экспорт
        </Button>
      </div>
      
      {/* Filters panel */}
      {showFilters && (
        <ExpenseFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({
            search: '',
            categoryIds: [],
            statuses: [],
            types: [],
            dateFrom: '',
            dateTo: '',
            amountMin: 0,
            amountMax: 0,
            vendors: [],
            createdBy: [],
          })}
        />
      )}
      
      {/* Expenses list */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            Расходов не найдено. Создайте первый расход.
          </div>
        ) : (
          expenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={() => setEditingExpense(expense.id)}
              onDelete={() => deleteExpense.mutate(expense.id)}
            />
          ))
        )}
        
        {/* Load more */}
        {hasNextPage && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => fetchNextPage()}>
              Загрузить ещё
            </Button>
          </div>
        )}
      </div>
      
      {/* Create/Edit Dialog */}
      {(isCreating || editingExpense) && (
        <ExpenseForm
          budgetId={budgetId}
          expenseId={editingExpense}
          onClose={() => {
            setIsCreating(false)
            setEditingExpense(null)
          }}
        />
      )}
    </div>
  )
}
```

### 5. ApprovalsQueue.tsx - Очередь согласований

```typescript
'use client'

import { useState } from 'react'
import { useApprovals } from '../../hooks/useApprovals'
import { useApprovalActions } from '../../hooks/useApprovalActions'
import { ApprovalCard } from './ApprovalCard'
import { ApprovalHistory } from './ApprovalHistory'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Skeleton } from '@/shared/ui/skeleton'
import { CheckCircle2, XCircle, Clock, Filter } from 'lucide-react'

interface ApprovalsQueueProps {
  budgetId: string
}

export function ApprovalsQueue({ budgetId }: ApprovalsQueueProps) {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  
  const { data, isLoading } = useApprovals(budgetId, { status: tab === 'all' ? undefined : tab })
  const { approve, reject, requestChanges } = useApprovalActions()
  
  const approvals = data || []
  
  // Counts
  const pendingCount = approvals.filter(a => a.status === 'pending').length
  const approvedCount = approvals.filter(a => a.status === 'approved').length
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length
  
  const handleApprove = async (approvalId: string, comment: string) => {
    await approve.mutateAsync({ approvalId, comment })
  }
  
  const handleReject = async (approvalId: string, reason: string) => {
    await reject.mutateAsync({ approvalId, reason })
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Ожидают</span>
          </div>
          <div className="text-3xl font-bold">{pendingCount}</div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Одобрено</span>
          </div>
          <div className="text-3xl font-bold">{approvedCount}</div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Отклонено</span>
          </div>
          <div className="text-3xl font-bold">{rejectedCount}</div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">
            Ожидают ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Одобрено ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Отклонено ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="all">
            Все
          </TabsTrigger>
        </TabsList>
        
        {/* Content */}
        <TabsContent value={tab} className="space-y-3 mt-4">
          {approvals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border rounded-lg">
              {tab === 'pending' && 'Нет заявок на согласование'}
              {tab === 'approved' && 'Нет одобренных заявок'}
              {tab === 'rejected' && 'Нет отклоненных заявок'}
              {tab === 'all' && 'Нет заявок'}
            </div>
          ) : (
            approvals.map(approval => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={(comment) => handleApprove(approval.id, comment)}
                onReject={(reason) => handleReject(approval.id, reason)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 6. BudgetAnalytics.tsx - Аналитика и графики

```typescript
'use client'

import { useBudgetAnalytics } from '../../hooks/useBudgetAnalytics'
import { SpendingTrends } from './SpendingTrends'
import { CategoryBreakdown } from './CategoryBreakdown'
import { MonthlyComparison } from './MonthlyComparison'
import { BudgetForecast } from './BudgetForecast'
import { TopExpenses } from './TopExpenses'
import { ExportReports } from './ExportReports'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { TrendingUp, PieChart, BarChart3, LineChart } from 'lucide-react'

interface BudgetAnalyticsProps {
  budgetId: string
}

export function BudgetAnalytics({ budgetId }: BudgetAnalyticsProps) {
  const { data, isLoading } = useBudgetAnalytics(budgetId)
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Export */}
      <div className="flex justify-end">
        <ExportReports budgetId={budgetId} />
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Spending Trends */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Динамика расходов</h3>
          </div>
          <SpendingTrends data={data.trends} />
        </Card>
        
        {/* Category Breakdown */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Распределение по категориям</h3>
          </div>
          <CategoryBreakdown data={data.categoryBreakdown} />
        </Card>
        
        {/* Monthly Comparison */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Сравнение месяцев</h3>
          </div>
          <MonthlyComparison data={data.monthlyComparison} />
        </Card>
        
        {/* Forecast */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Прогноз расходов</h3>
          </div>
          <BudgetForecast data={data.forecast} />
        </Card>
      </div>
      
      {/* Top Expenses */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Топ-10 расходов</h3>
        <TopExpenses expenses={data.topExpenses} />
      </Card>
    </div>
  )
}
```

---

## BACKEND (Go Service)

### Budget Service Structure

```
backend/services/budget/
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/
│   │   ├── budgets.go
│   │   ├── categories.go
│   │   ├── expenses.go
│   │   ├── approvals.go
│   │   └── analytics.go
│   ├── repository/
│   │   ├── budgets_repo.go
│   │   ├── categories_repo.go
│   │   ├── expenses_repo.go
│   │   └── approvals_repo.go
│   ├── service/
│   │   ├── budget_service.go
│   │   ├── category_service.go
│   │   ├── expense_service.go
│   │   ├── approval_service.go
│   │   └── onec_service.go
│   └── middleware/
│       └── auth.go
├── migrations/
│   └── 001_create_budget_tables.sql
├── Dockerfile
├── go.mod
└── go.sum
```

### Database Schema (PostgreSQL)

```sql
-- Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    
    name VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    period VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'RUB',
    
    start_date DATE,
    end_date DATE,
    
    total_planned DECIMAL(15, 2) DEFAULT 0,
    total_spent DECIMAL(15, 2) GENERATED ALWAYS AS (
        (SELECT COALESCE(SUM(amount_rub), 0) 
         FROM expenses 
         WHERE budget_id = budgets.id 
         AND status IN ('approved', 'paid'))
    ) STORED,
    total_approved DECIMAL(15, 2) GENERATED ALWAYS AS (
        (SELECT COALESCE(SUM(amount_rub), 0)
         FROM expenses
         WHERE budget_id = budgets.id
         AND status = 'approved')
    ) STORED,
    total_pending DECIMAL(15, 2) GENERATED ALWAYS AS (
        (SELECT COALESCE(SUM(amount_rub), 0)
         FROM expenses
         WHERE budget_id = budgets.id
         AND status = 'pending_approval')
    ) STORED,
    
    manager_id UUID,
    
    warning_threshold INTEGER DEFAULT 80,
    critical_threshold INTEGER DEFAULT 90,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_budgets_project ON budgets(project_id);
CREATE INDEX idx_budgets_org ON budgets(organization_id);
CREATE INDEX idx_budgets_status ON budgets(status);

-- Categories table (hierarchical)
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    color VARCHAR(7),  -- hex color
    icon VARCHAR(50),
    
    path TEXT,  -- materialized path: "1.2.3"
    level INTEGER DEFAULT 0,
    order_num INTEGER DEFAULT 0,
    
    planned_amount DECIMAL(15, 2) DEFAULT 0,
    spent_amount DECIMAL(15, 2) GENERATED ALWAYS AS (
        (SELECT COALESCE(SUM(amount_rub), 0)
         FROM expenses
         WHERE category_id = budget_categories.id
         AND status IN ('approved', 'paid'))
    ) STORED,
    
    onec_id VARCHAR(255),
    onec_synced BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_budget ON budget_categories(budget_id);
CREATE INDEX idx_categories_parent ON budget_categories(parent_id);
CREATE INDEX idx_categories_path ON budget_categories USING GIN (string_to_array(path, '.'));

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES budget_categories(id),
    organization_id UUID NOT NULL,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'invoice',
    status VARCHAR(30) DEFAULT 'draft',
    
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    amount_rub DECIMAL(15, 2) NOT NULL,  -- converted amount
    
    expense_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    
    payment_method VARCHAR(20),
    invoice_number VARCHAR(100),
    contract_number VARCHAR(100),
    
    vendor VARCHAR(255),
    vendor_inn VARCHAR(12),
    
    created_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    onec_id VARCHAR(255),
    onec_synced BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMP,
    
    tags TEXT[],
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_budget ON expenses(budget_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_vendor ON expenses(vendor);

-- Expense attachments
CREATE TABLE expense_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attachments_expense ON expense_attachments(expense_id);

-- Approval requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES budgets(id),
    
    level INTEGER DEFAULT 1,
    required_approvers UUID[],
    current_approver UUID,
    
    status VARCHAR(20) DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP,
    responded_at TIMESTAMP
);

CREATE INDEX idx_approvals_expense ON approval_requests(expense_id);
CREATE INDEX idx_approvals_status ON approval_requests(status);
CREATE INDEX idx_approvals_current ON approval_requests(current_approver);

-- Approval history
CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    
    action VARCHAR(20) NOT NULL,  -- approve, reject, request_changes
    user_id UUID NOT NULL,
    comment TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_approval_history_request ON approval_history(approval_request_id);

-- Activity log (for audit trail)
CREATE TABLE budget_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    entity_type VARCHAR(50),  -- budget, category, expense, approval
    entity_id UUID,
    action VARCHAR(50),  -- created, updated, deleted, approved, rejected
    user_id UUID NOT NULL,
    changes JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_budget ON budget_activity_log(budget_id);
CREATE INDEX idx_activity_date ON budget_activity_log(created_at);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER categories_updated_at
    BEFORE UPDATE ON budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

---

## ТРЕБОВАНИЯ

### Frontend
- ✅ Feature-Sliced Design architecture
- ✅ 6 views: Overview, Categories (Tree), Expenses (List), Approvals, Analytics, Integration
- ✅ TypeScript strict mode, NO `any`
- ✅ Все тексты через i18n (ru/en)
- ✅ TanStack Query для server state
- ✅ Zustand для UI state
- ✅ React Hook Form + Zod для форм
- ✅ shadcn/ui components
- ✅ Tailwind CSS (NO CSS modules)
- ✅ Responsive (mobile/tablet/desktop)
- ✅ Accessibility (keyboard nav, screen reader)
- ✅ Permission guards (budget:read, budget:write, budget:approve)
- ✅ Loading states, error handling
- ✅ Optimistic updates

### Backend (Go)
- ✅ RESTful API
- ✅ PostgreSQL с GENERATED columns для автоматических вычислений
- ✅ Triggers для update timestamps и activity log
- ✅ Hierarchical queries для category tree
- ✅ JWT authentication middleware
- ✅ Permission checking
- ✅ Input validation
- ✅ Error handling
- ✅ Kafka events (budget.updated, expense.approved)
- ✅ 1С integration (REST/SOAP client)

### Database
- ✅ PostgreSQL 16
- ✅ GENERATED columns (total_spent, total_approved, spent_amount)
- ✅ Triggers (updated_at, activity_log)
- ✅ Indexes для производительности
- ✅ Materialized path для category tree
- ✅ Foreign keys с ON DELETE CASCADE

### Features
- ✅ Hierarchical categories (дерево с drag-and-drop)
- ✅ Expense approval workflow
- ✅ 1C integration (sync categories, expenses)
- ✅ Analytics (charts, trends, forecast)
- ✅ Export reports (Excel, PDF)
- ✅ File attachments (receipts, invoices)
- ✅ Budget alerts (threshold warnings)
- ✅ Activity audit log
- ✅ Multi-currency support

Создай полный модуль Budget. Agent mode, создай всё сразу.
```

---

## ПОСЛЕ ВЫПОЛНЕНИЯ

### Checklist:

```bash
cd exponat/web

# ✅ Структура создана
ls src/features/budget/components/
ls src/features/budget/hooks/
ls src/features/budget/types/

# ✅ Types check
npm run type-check

# ✅ Lint
npm run lint

# ✅ Запустить dev
npm run dev
open http://localhost:3000/budgets

# ✅ Проверить views
# /budgets/:id/overview
# /budgets/:id/categories
# /budgets/:id/expenses
# /budgets/:id/approvals
# /budgets/:id/analytics
# /budgets/:id/integration
```

### Backend:

```bash
cd backend/services/budget

# ✅ Run migrations
migrate -path migrations -database $DATABASE_URL up

# ✅ Start service
go run cmd/main.go

# ✅ Test API
curl http://localhost:8080/health
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/budgets
```

---

**Используй в Cursor → Composer (Cmd/Ctrl + I) → Agent mode**
