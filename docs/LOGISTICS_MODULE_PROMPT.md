# ПРОМПТ: МОДУЛЬ LOGISTICS (ПОЛНАЯ РЕАЛИЗАЦИЯ)

## КОНТЕКСТ

@Figma https://www.figma.com/make/L1VGQ0EGt8zhTaVzinZpJU/SaaS-Dashboard-Design?t=63OcE7VqmOunUdIs-1&preview-route=%2Fprojects
@Codebase exponat/
@File exponat/.cursorrules
@File exponat/ARCHITECTURE.md

**ВАЖНО:** Ориентируйся на дизайн из Figma прототипа выше. Используй те же UI patterns, layout структуры, цветовую схему и компоненты.

Создай **полностью работающий** модуль Logistics для платформы Экспонат с управлением экспонатами и IoT-мониторингом:
- 🎨 **Exhibits** - каталог экспонатов с детальными характеристиками
- 📦 **Shipments** - планирование и отслеживание перевозок
- 📍 **Tracking** - GPS отслеживание в реальном времени
- 🌡️ **Monitoring** - IoT мониторинг условий (температура, влажность, вибрация)
- 📋 **Inventory** - инвентаризация и учет местоположений
- 📊 **Reports** - отчеты по перемещениям и инцидентам

---

## АРХИТЕКТУРА МОДУЛЯ

### Структура файлов

```
exponat/web/src/features/logistics/
├── components/
│   ├── LogisticsHeader.tsx              # Header с tabs навигацией
│   ├── LogisticsViewTabs.tsx            # Tabs для переключения views
│   │
│   ├── exhibits/                        # Exhibits catalog
│   │   ├── ExhibitsCatalog.tsx          # Main catalog component
│   │   ├── ExhibitCard.tsx              # Карточка экспоната (grid view)
│   │   ├── ExhibitList.tsx              # Список экспонатов (list view)
│   │   ├── ExhibitDetail.tsx            # Детальная информация
│   │   ├── ExhibitForm.tsx              # Форма создания/редактирования
│   │   ├── ExhibitFilters.tsx           # Фильтры (category, location, status)
│   │   ├── ExhibitSearch.tsx            # Поиск с фильтрами
│   │   ├── ExhibitImages.tsx            # Галерея изображений
│   │   ├── ExhibitHistory.tsx           # История перемещений
│   │   ├── ExhibitDocuments.tsx         # Документы (паспорт, сертификаты)
│   │   ├── ExhibitQRCode.tsx            # QR-код для маркировки
│   │   └── ExhibitBulkActions.tsx       # Массовые действия
│   │
│   ├── shipments/                       # Shipments management
│   │   ├── ShipmentsList.tsx            # Main list component
│   │   ├── ShipmentCard.tsx             # Карточка перевозки
│   │   ├── ShipmentTimeline.tsx         # Timeline этапов
│   │   ├── ShipmentForm.tsx             # Создание перевозки
│   │   ├── ShipmentRoute.tsx            # Маршрут на карте
│   │   ├── ShipmentItems.tsx            # Список экспонатов в перевозке
│   │   ├── ShipmentDocuments.tsx        # ТТН, акты приема-передачи
│   │   ├── ShipmentCosts.tsx            # Стоимость перевозки
│   │   └── ShipmentStatus.tsx           # Статус и этапы
│   │
│   ├── tracking/                        # GPS Tracking (Real-time)
│   │   ├── TrackingMap.tsx              # Main map component (Mapbox/Leaflet)
│   │   ├── TrackingMarker.tsx           # Маркер транспорта на карте
│   │   ├── TrackingRoute.tsx            # Отрисовка маршрута
│   │   ├── TrackingControls.tsx         # Управление картой (zoom, filters)
│   │   ├── TrackingList.tsx             # Список отслеживаемых транспортов
│   │   ├── TrackingDetails.tsx          # Детали транспорта (sidebar)
│   │   ├── TrackingHistory.tsx          # История перемещений (playback)
│   │   └── TrackingAlerts.tsx           # Alerts (отклонение от маршрута)
│   │
│   ├── monitoring/                      # IoT Monitoring
│   │   ├── MonitoringDashboard.tsx      # Main dashboard
│   │   ├── SensorCard.tsx               # Карточка датчика
│   │   ├── TemperatureChart.tsx         # График температуры
│   │   ├── HumidityChart.tsx            # График влажности
│   │   ├── VibrationChart.tsx           # График вибрации
│   │   ├── SensorAlerts.tsx             # Alerts при превышении норм
│   │   ├── SensorHistory.tsx            # История показаний
│   │   └── SensorSettings.tsx           # Настройки норм и thresholds
│   │
│   ├── inventory/                       # Inventory management
│   │   ├── InventoryList.tsx            # Main list component
│   │   ├── LocationTree.tsx             # Дерево локаций (warehouse > hall > shelf)
│   │   ├── InventoryAudit.tsx           # Инвентаризация (сканирование QR)
│   │   ├── InventoryMovements.tsx       # Журнал перемещений
│   │   ├── InventoryStats.tsx           # Статистика по локациям
│   │   └── InventoryExport.tsx          # Экспорт в Excel
│   │
│   ├── reports/                         # Reports & Analytics
│   │   ├── LogisticsReports.tsx         # Main reports component
│   │   ├── ShipmentReport.tsx           # Отчет по перевозкам
│   │   ├── IncidentReport.tsx           # Отчет по инцидентам
│   │   ├── MovementReport.tsx           # Отчет по перемещениям
│   │   ├── CostAnalysis.tsx             # Анализ затрат
│   │   └── ExportReport.tsx             # Экспорт отчетов
│   │
│   ├── shared/                          # Общие компоненты
│   │   ├── ExhibitStatusBadge.tsx       # Badge статуса экспоната
│   │   ├── ShipmentStatusBadge.tsx      # Badge статуса перевозки
│   │   ├── LocationBadge.tsx            # Badge локации
│   │   ├── ConditionIndicator.tsx       # Индикатор состояния (IoT)
│   │   ├── QRScanner.tsx                # QR сканер (camera)
│   │   ├── MapComponent.tsx             # Переиспользуемая карта
│   │   └── TimelineComponent.tsx        # Timeline компонент
│   │
│   └── LogisticsList.tsx                # Главная страница (dashboard)
│
├── hooks/
│   ├── useExhibits.ts                   # Список экспонатов
│   ├── useExhibit.ts                    # Один экспонат
│   ├── useExhibitMutations.ts           # CRUD экспонатов
│   ├── useShipments.ts                  # Перевозки
│   ├── useShipmentMutations.ts          # CRUD перевозок
│   ├── useTracking.ts                   # GPS данные (real-time)
│   ├── useTrackingHistory.ts            # История GPS
│   ├── useSensors.ts                    # IoT датчики (real-time)
│   ├── useSensorHistory.ts              # История показаний
│   ├── useInventory.ts                  # Инвентарь
│   ├── useLocations.ts                  # Локации (tree)
│   ├── useMovements.ts                  # Перемещения
│   └── useLogisticsView.ts              # Текущий view (state)
│
├── api/
│   ├── exhibitsApi.ts                   # API для экспонатов
│   ├── shipmentsApi.ts                  # API для перевозок
│   ├── trackingApi.ts                   # API для GPS tracking
│   ├── sensorsApi.ts                    # API для IoT датчиков
│   ├── inventoryApi.ts                  # API для инвентаря
│   └── reportsApi.ts                    # API для отчетов
│
├── store/
│   ├── logisticsStore.ts                # Zustand store (UI state)
│   ├── trackingStore.ts                 # Real-time tracking state
│   └── monitoringStore.ts               # IoT monitoring state
│
├── types/
│   ├── exhibit.types.ts                 # Типы экспонатов
│   ├── shipment.types.ts                # Типы перевозок
│   ├── tracking.types.ts                # Типы GPS tracking
│   ├── sensor.types.ts                  # Типы IoT датчиков
│   └── inventory.types.ts               # Типы инвентаря
│
└── utils/
    ├── exhibitHelpers.ts
    ├── shipmentHelpers.ts
    ├── trackingHelpers.ts               # Работа с GPS координатами
    ├── sensorHelpers.ts                 # Обработка IoT данных
    ├── qrCodeHelpers.ts                 # Генерация/сканирование QR
    └── logisticsValidation.ts           # Zod schemas
```

### App Router Pages

```
exponat/web/src/app/[locale]/(dashboard)/logistics/
├── page.tsx                             # Dashboard (overview)
├── exhibits/
│   ├── page.tsx                         # Каталог экспонатов
│   └── [id]/
│       └── page.tsx                     # Детальная информация
├── shipments/
│   ├── page.tsx                         # Список перевозок
│   ├── new/
│   │   └── page.tsx                     # Создание перевозки
│   └── [id]/
│       └── page.tsx                     # Детали перевозки
├── tracking/
│   └── page.tsx                         # GPS карта (real-time)
├── monitoring/
│   └── page.tsx                         # IoT мониторинг
├── inventory/
│   └── page.tsx                         # Инвентаризация
├── reports/
│   └── page.tsx                         # Отчеты
└── layout.tsx                           # Layout с navigation
```

---

---

## 🎨 DESIGN GUIDELINES (из Figma прототипа)

### Layout Structure

**Следуй структуре из Figma:**

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo | Navigation | User Menu                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────┐  ┌──────────────────────────────────────────┐ │
│ │         │  │                                          │ │
│ │ Sidebar │  │          Main Content Area               │ │
│ │         │  │                                          │ │
│ │ - Home  │  │  Breadcrumbs                             │ │
│ │ - Proj  │  │  ────────────                            │ │
│ │ - Budget│  │                                          │ │
│ │ - Logis │  │  Page Title + Actions                    │ │
│ │ - Team  │  │  ═══════════════════                     │ │
│ │         │  │                                          │ │
│ │         │  │  Tabs Navigation (если нужно)            │ │
│ │         │  │  ─────────────────                       │ │
│ │         │  │                                          │ │
│ │         │  │  Content Cards/Lists/Grid                │ │
│ │         │  │  ┌──────┐ ┌──────┐ ┌──────┐            │ │
│ │         │  │  │ Card │ │ Card │ │ Card │            │ │
│ │         │  │  └──────┘ └──────┘ └──────┘            │ │
│ │         │  │                                          │ │
│ └─────────┘  └──────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme (Exponat Brand)

```typescript
// Используй эти цвета из Figma прототипа
const colors = {
  // Primary (Indigo)
  primary: '#6366F1',           // Главный бренд-цвет
  'primary-foreground': '#FFFFFF',
  
  // Secondary (Purple)
  secondary: '#8B5CF6',         // Акценты
  'secondary-foreground': '#FFFFFF',
  
  // Status colors
  success: '#10B981',           // Green - успех, найдено
  warning: '#F59E0B',           // Amber - предупреждение
  error: '#EF4444',             // Red - ошибка, отсутствует
  info: '#3B82F6',              // Blue - информация
  
  // Neutral (Slate)
  background: '#FFFFFF',
  foreground: '#0F172A',
  muted: '#F1F5F9',
  'muted-foreground': '#64748B',
  border: '#E2E8F0',
  
  // Dark mode
  'dark-background': '#0F172A',
  'dark-foreground': '#F1F5F9',
}
```

### Typography

```typescript
// Из Figma прototип
const typography = {
  display: 'Cal Sans',          // Заголовки
  body: 'Onest',                // Текст (отличная кириллица)
  mono: 'JetBrains Mono',       // Код, номера
}

// Размеры
const fontSizes = {
  'xs': '0.75rem',    // 12px
  'sm': '0.875rem',   // 14px
  'base': '1rem',     // 16px
  'lg': '1.125rem',   // 18px
  'xl': '1.25rem',    // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
}
```

### UI Components Patterns

**Card Component:**
```tsx
// Как в Figma - белая карточка с border и shadow
<Card className="p-6 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</Card>
```

**Stats Card:**
```tsx
// Как в Figma dashboard - компактные stats
<div className="grid grid-cols-4 gap-4">
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Label</div>
        <div className="text-2xl font-bold">Value</div>
      </div>
    </div>
  </Card>
</div>
```

**Table/List Pattern:**
```tsx
// Как в Figma - чистые таблицы с hover
<div className="border rounded-lg overflow-hidden">
  {/* Header */}
  <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
    <div>Actions</div>
  </div>
  
  {/* Rows */}
  {items.map(item => (
    <div 
      key={item.id}
      className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors"
    >
      <div>{item.col1}</div>
      <div>{item.col2}</div>
      <div>{item.col3}</div>
      <div>{/* Actions */}</div>
    </div>
  ))}
</div>
```

**Badge Component:**
```tsx
// Status badges как в Figma
<Badge variant="success">Найден</Badge>
<Badge variant="warning">Ожидает</Badge>
<Badge variant="destructive">Отсутствует</Badge>
<Badge variant="outline">В пути</Badge>

// Варианты
const badgeVariants = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  destructive: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  outline: 'border border-border text-foreground',
}
```

**Button Patterns:**
```tsx
// Primary action
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Добавить экспонат
</Button>

// Secondary action
<Button variant="outline">
  <Download className="h-4 w-4 mr-2" />
  Экспорт
</Button>

// Icon only
<Button variant="ghost" size="sm">
  <MoreHorizontal className="h-4 w-4" />
</Button>
```

### Spacing System

```typescript
// Из Figma - consistent spacing
const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
}

// Используй для:
// - Card padding: p-6 (24px)
// - Grid gaps: gap-4 (16px)
// - Section spacing: space-y-6 (24px)
// - Container max-width: max-w-7xl
```

### Grid Patterns

**Dashboard Grid:**
```tsx
// 4-column grid для stats/cards
<div className="grid grid-cols-4 gap-4">
  <StatsCard />
  <StatsCard />
  <StatsCard />
  <StatsCard />
</div>
```

**Content Grid:**
```tsx
// Responsive grid для каталога
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {exhibits.map(exhibit => (
    <ExhibitCard key={exhibit.id} exhibit={exhibit} />
  ))}
</div>
```

**Split Layout:**
```tsx
// Sidebar + Content (для детальных страниц)
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-8">
    {/* Main content */}
  </div>
  <div className="col-span-4">
    {/* Sidebar info */}
  </div>
</div>
```

### Icons

```typescript
// Используй lucide-react (как в Figma)
import {
  Package,          // Экспонат
  Truck,            // Перевозка
  MapPin,           // Локация
  Navigation,       // GPS tracking
  Thermometer,      // Температура
  Droplets,         // Влажность
  Activity,         // Вибрация
  QrCode,           // QR код
  FileText,         // Документ
  Image,            // Изображение
  Calendar,         // Дата
  Clock,            // Время
  AlertTriangle,    // Предупреждение
  CheckCircle,      // Успех
  XCircle,          // Ошибка
} from 'lucide-react'
```

### Responsive Breakpoints

```typescript
// Как в Tailwind (используется в Figma прототипе)
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}

// Mobile-first подход
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col на mobile, 2 на tablet, 4 на desktop */}
</div>
```

### Loading States

```tsx
// Skeleton loaders как в Figma
import { Skeleton } from '@/shared/ui/skeleton'

// Card skeleton
<Card className="p-6">
  <Skeleton className="h-6 w-32 mb-4" />
  <Skeleton className="h-4 w-full mb-2" />
  <Skeleton className="h-4 w-3/4" />
</Card>

// List skeleton
<div className="space-y-4">
  {[...Array(5)].map((_, i) => (
    <Skeleton key={i} className="h-16 w-full" />
  ))}
</div>
```

### Empty States

```tsx
// Как в Figma - дружелюбные empty states
<div className="flex flex-col items-center justify-center p-12 text-center">
  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
    <Package className="h-10 w-10 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">Нет экспонатов</h3>
  <p className="text-muted-foreground mb-6 max-w-sm">
    Начните с добавления первого экспоната в каталог
  </p>
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Добавить экспонат
  </Button>
</div>
```

### Animations

```typescript
// Используй Framer Motion для transitions (как в Figma)
import { motion } from 'framer-motion'

// Fade in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// List stagger
<motion.div>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Chart Styling (для Analytics/Monitoring)

```typescript
// Recharts colors matching Figma
const chartColors = {
  primary: '#6366F1',      // Indigo
  secondary: '#8B5CF6',    // Purple
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  neutral: ['#64748B', '#94A3B8', '#CBD5E1'], // Slate variants
}

// Chart config
<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
  <XAxis dataKey="timestamp" stroke="#64748B" />
  <YAxis stroke="#64748B" />
  <Tooltip 
    contentStyle={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
    }}
  />
  <Line 
    type="monotone" 
    dataKey="value" 
    stroke="#6366F1" 
    strokeWidth={2}
    dot={{ fill: '#6366F1', r: 4 }}
  />
</LineChart>
```

---

## TYPESCRIPT TYPES

### exhibit.types.ts

```typescript
export type ExhibitStatus = 'in_storage' | 'on_display' | 'in_transit' | 'in_restoration' | 'decommissioned'
export type ExhibitCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
export type ExhibitCategory = 'painting' | 'sculpture' | 'artifact' | 'document' | 'photo' | 'video' | 'interactive' | 'other'

export interface Exhibit {
  id: string
  organizationId: string
  projectId: string | null
  
  // Основная информация
  name: string
  inventoryNumber: string  // уникальный номер
  description: string
  category: ExhibitCategory
  tags: string[]
  
  // Статус и состояние
  status: ExhibitStatus
  condition: ExhibitCondition
  
  // Физические характеристики
  dimensions: {
    width: number   // см
    height: number  // см
    depth: number   // см
    weight: number  // кг
  }
  
  // Ценность и страховка
  estimatedValue: number  // RUB
  insuranceValue: number
  isInsured: boolean
  
  // Условия хранения/транспортировки
  requirements: {
    temperatureMin: number  // °C
    temperatureMax: number
    humidityMin: number     // %
    humidityMax: number
    fragile: boolean
    requiresClimateControl: boolean
    requiresSpecialHandling: boolean
    handlingNotes: string
  }
  
  // Локация
  currentLocation: Location
  locationId: string
  locationHistory: LocationHistory[]
  
  // Текущая перевозка (если в пути)
  currentShipmentId: string | null
  
  // Медиа
  images: ExhibitImage[]
  primaryImageUrl: string
  
  // Документы
  documents: ExhibitDocument[]
  
  // Маркировка
  qrCode: string
  barcode: string
  rfidTag: string | null
  
  // Авторство и история
  author: string | null
  yearCreated: number | null
  origin: string | null
  acquisitionDate: string
  acquisitionSource: string
  
  // Метаданные
  createdBy: string
  createdAt: string
  updatedAt: string
  lastInventoryDate: string
}

export interface ExhibitImage {
  id: string
  url: string
  thumbnailUrl: string
  caption: string
  isPrimary: boolean
  uploadedAt: string
}

export interface ExhibitDocument {
  id: string
  type: 'passport' | 'certificate' | 'insurance' | 'customs' | 'other'
  title: string
  fileUrl: string
  uploadedAt: string
}

export interface Location {
  id: string
  type: 'warehouse' | 'exhibition_hall' | 'storage' | 'restoration' | 'transit'
  name: string
  address: string
  building: string | null
  floor: string | null
  room: string | null
  shelf: string | null
  coordinates: {
    lat: number
    lng: number
  }
}

export interface LocationHistory {
  id: string
  locationId: string
  locationName: string
  movedAt: string
  movedBy: string
  reason: string
  shipmentId: string | null
}
```

### shipment.types.ts

```typescript
export type ShipmentStatus = 'planned' | 'in_preparation' | 'in_transit' | 'delivered' | 'cancelled'
export type ShipmentType = 'incoming' | 'outgoing' | 'internal'
export type TransportType = 'truck' | 'van' | 'car' | 'air' | 'rail' | 'sea'

export interface Shipment {
  id: string
  organizationId: string
  projectId: string | null
  
  // Основное
  number: string  // номер перевозки
  type: ShipmentType
  status: ShipmentStatus
  
  // Маршрут
  route: {
    origin: Location
    destination: Location
    waypoints: Location[]
    distance: number  // км
    estimatedDuration: number  // минут
  }
  
  // Даты
  plannedDepartureDate: string
  actualDepartureDate: string | null
  plannedArrivalDate: string
  actualArrivalDate: string | null
  
  // Транспорт
  transportType: TransportType
  vehicle: {
    type: string
    plateNumber: string
    model: string
    driverId: string
    driverName: string
    driverPhone: string
    hasClimateControl: boolean
    maxWeight: number  // кг
  }
  
  // Экспонаты
  exhibits: ShipmentExhibit[]
  totalExhibits: number
  totalWeight: number
  totalValue: number
  
  // Упаковка
  packaging: {
    cratesCount: number
    boxesCount: number
    packingListUrl: string | null
  }
  
  // Документы
  documents: ShipmentDocument[]
  
  // Стоимость
  cost: {
    amount: number
    currency: 'RUB'
    includedInBudget: boolean
    budgetCategoryId: string | null
  }
  
  // GPS Tracking
  trackingEnabled: boolean
  currentLocation: {
    lat: number
    lng: number
    timestamp: string
    speed: number  // км/ч
  } | null
  
  // IoT Мониторинг
  monitoringEnabled: boolean
  sensorIds: string[]
  
  // Этапы
  timeline: ShipmentTimelineItem[]
  
  // Инциденты
  incidents: ShipmentIncident[]
  hasIncidents: boolean
  
  // Метаданные
  createdBy: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface ShipmentExhibit {
  exhibitId: string
  exhibitName: string
  inventoryNumber: string
  condition: ExhibitCondition
  packagedIn: string  // номер ящика/контейнера
  notes: string
}

export interface ShipmentDocument {
  id: string
  type: 'waybill' | 'packing_list' | 'insurance' | 'customs' | 'acceptance_act' | 'other'
  title: string
  fileUrl: string
  uploadedAt: string
}

export interface ShipmentTimelineItem {
  id: string
  timestamp: string
  type: 'created' | 'departed' | 'checkpoint' | 'incident' | 'arrived' | 'completed'
  title: string
  description: string
  location: {
    lat: number
    lng: number
    address: string
  } | null
  userId: string | null
  userName: string | null
}

export interface ShipmentIncident {
  id: string
  timestamp: string
  type: 'delay' | 'damage' | 'deviation' | 'temperature' | 'humidity' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location: {
    lat: number
    lng: number
  }
  affectedExhibits: string[]
  resolvedAt: string | null
  resolution: string | null
}
```

### tracking.types.ts

```typescript
export interface TrackingDevice {
  id: string
  deviceId: string  // уникальный ID устройства
  shipmentId: string
  vehiclePlateNumber: string
  
  // Текущее местоположение
  currentPosition: {
    lat: number
    lng: number
    accuracy: number  // метры
    altitude: number | null
    heading: number | null  // градусы (0-360)
    speed: number  // км/ч
    timestamp: string
  }
  
  // Статус
  isOnline: boolean
  lastSeenAt: string
  batteryLevel: number | null  // %
  
  // Маршрут
  plannedRoute: RoutePoint[]
  actualRoute: RoutePoint[]
  
  // Alerts
  alerts: TrackingAlert[]
}

export interface RoutePoint {
  lat: number
  lng: number
  timestamp: string
  speed: number
  address: string | null
}

export interface TrackingAlert {
  id: string
  type: 'offline' | 'speed_exceeded' | 'route_deviation' | 'geofence_breach' | 'low_battery'
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy: string | null
}

export interface Geofence {
  id: string
  name: string
  type: 'circle' | 'polygon'
  center: { lat: number; lng: number } | null
  radius: number | null  // метры
  polygon: { lat: number; lng: number }[] | null
  shipmentIds: string[]
}
```

### sensor.types.ts

```typescript
export type SensorType = 'temperature' | 'humidity' | 'vibration' | 'shock' | 'tilt' | 'light'

export interface Sensor {
  id: string
  sensorId: string  // уникальный ID датчика
  type: SensorType
  name: string
  
  // Привязка
  shipmentId: string | null
  exhibitId: string | null
  locationId: string | null
  
  // Текущие показания
  currentReading: {
    value: number
    unit: string
    timestamp: string
    status: 'normal' | 'warning' | 'critical'
  }
  
  // Пороговые значения
  thresholds: {
    minNormal: number
    maxNormal: number
    minWarning: number
    maxWarning: number
    minCritical: number
    maxCritical: number
  }
  
  // История
  readings: SensorReading[]
  
  // Статус
  isOnline: boolean
  lastSeenAt: string
  batteryLevel: number | null  // %
  
  // Alerts
  alerts: SensorAlert[]
}

export interface SensorReading {
  timestamp: string
  value: number
  status: 'normal' | 'warning' | 'critical'
}

export interface SensorAlert {
  id: string
  sensorId: string
  type: 'threshold_exceeded' | 'sensor_offline' | 'battery_low'
  severity: 'warning' | 'critical'
  message: string
  value: number | null
  threshold: number | null
  timestamp: string
  acknowledged: boolean
  acknowledgedBy: string | null
  acknowledgedAt: string | null
}
```

### inventory.types.ts

```typescript
export interface InventoryAudit {
  id: string
  organizationId: string
  
  name: string
  description: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  
  // Scope
  locationIds: string[]
  exhibitIds: string[] | null  // null = все экспонаты
  
  // Даты
  plannedDate: string
  startedAt: string | null
  completedAt: string | null
  
  // Результаты
  totalExpected: number
  totalScanned: number
  totalFound: number
  totalMissing: number
  totalExtra: number
  
  // Items
  items: InventoryAuditItem[]
  
  // Метаданные
  createdBy: string
  assignedTo: string[]
  createdAt: string
  updatedAt: string
}

export interface InventoryAuditItem {
  id: string
  auditId: string
  exhibitId: string
  exhibitName: string
  inventoryNumber: string
  
  expectedLocationId: string
  expectedLocationName: string
  
  actualLocationId: string | null
  actualLocationName: string | null
  
  status: 'found' | 'missing' | 'misplaced' | 'extra'
  condition: ExhibitCondition
  
  scannedAt: string | null
  scannedBy: string | null
  notes: string
}

export interface Movement {
  id: string
  exhibitId: string
  exhibitName: string
  
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  
  movedAt: string
  movedBy: string
  movedByName: string
  
  reason: 'exhibition' | 'storage' | 'restoration' | 'shipment' | 'inventory' | 'other'
  reasonDetails: string
  
  shipmentId: string | null
  auditId: string | null
  
  approved: boolean
  approvedBy: string | null
  approvedAt: string | null
}
```

---

## КОМПОНЕНТЫ (ДЕТАЛЬНАЯ РЕАЛИЗАЦИЯ)

### 1. ExhibitsCatalog.tsx - Каталог экспонатов

```typescript
'use client'

import { useState } from 'react'
import { useExhibits } from '../../hooks/useExhibits'
import { useExhibitMutations } from '../../hooks/useExhibitMutations'
import { ExhibitCard } from './ExhibitCard'
import { ExhibitList } from './ExhibitList'
import { ExhibitFilters } from './ExhibitFilters'
import { ExhibitForm } from './ExhibitForm'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Skeleton } from '@/shared/ui/skeleton'
import { Plus, Search, Grid, List, Download, Upload, QrCode } from 'lucide-react'
import type { ExhibitFilters as ExhibitFiltersType } from '../../types/exhibit.types'

interface ExhibitsCatalogProps {
  projectId?: string
}

export function ExhibitsCatalog({ projectId }: ExhibitsCatalogProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<ExhibitFiltersType>({
    search: '',
    categories: [],
    statuses: [],
    locations: [],
    conditions: [],
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingExhibit, setEditingExhibit] = useState<string | null>(null)
  
  const { data, isLoading, fetchNextPage, hasNextPage } = useExhibits(projectId, filters)
  const { createExhibit, updateExhibit, deleteExhibit } = useExhibitMutations()
  
  const exhibits = data?.pages.flatMap(page => page.items) || []
  
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
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
            placeholder="Поиск по названию, номеру, автору..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* View toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Actions */}
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить экспонат
        </Button>
        
        <Button variant="outline">
          <QrCode className="h-4 w-4 mr-2" />
          Сканировать QR
        </Button>
        
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Импорт
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Экспорт
        </Button>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <ExhibitFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({
            search: '',
            categories: [],
            statuses: [],
            locations: [],
            conditions: [],
          })}
        />
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Всего</div>
          <div className="text-2xl font-bold">{exhibits.length}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">На хранении</div>
          <div className="text-2xl font-bold">
            {exhibits.filter(e => e.status === 'in_storage').length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">На выставке</div>
          <div className="text-2xl font-bold">
            {exhibits.filter(e => e.status === 'on_display').length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">В пути</div>
          <div className="text-2xl font-bold">
            {exhibits.filter(e => e.status === 'in_transit').length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Общая стоимость</div>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              minimumFractionDigits: 0,
            }).format(exhibits.reduce((sum, e) => sum + e.estimatedValue, 0))}
          </div>
        </div>
      </div>
      
      {/* Exhibits */}
      {view === 'grid' ? (
        <div className="grid grid-cols-4 gap-4">
          {exhibits.map(exhibit => (
            <ExhibitCard
              key={exhibit.id}
              exhibit={exhibit}
              onClick={() => setEditingExhibit(exhibit.id)}
            />
          ))}
        </div>
      ) : (
        <ExhibitList
          exhibits={exhibits}
          onEdit={(id) => setEditingExhibit(id)}
          onDelete={(id) => deleteExhibit.mutate(id)}
        />
      )}
      
      {/* Load more */}
      {hasNextPage && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => fetchNextPage()}>
            Загрузить ещё
          </Button>
        </div>
      )}
      
      {/* Create/Edit Dialog */}
      {(isCreating || editingExhibit) && (
        <ExhibitForm
          exhibitId={editingExhibit}
          projectId={projectId}
          onClose={() => {
            setIsCreating(false)
            setEditingExhibit(null)
          }}
        />
      )}
    </div>
  )
}
```

### 2. TrackingMap.tsx - GPS отслеживание (Real-time)

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { useTracking } from '../../hooks/useTracking'
import { TrackingMarker } from './TrackingMarker'
import { TrackingRoute } from './TrackingRoute'
import { TrackingDetails } from './TrackingDetails'
import { TrackingControls } from './TrackingControls'
import { TrackingList } from './TrackingList'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export function TrackingMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  
  // Real-time tracking data (WebSocket)
  const { data: devices, isLoading } = useTracking()
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [37.6173, 55.7558], // Moscow
      zoom: 10,
    })
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    
    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    return () => {
      map.current?.remove()
    }
  }, [])
  
  // Update markers when devices change
  useEffect(() => {
    if (!map.current || !devices) return
    
    devices.forEach(device => {
      const el = document.createElement('div')
      el.className = 'tracking-marker'
      el.style.backgroundImage = `url(/icons/truck-${device.isOnline ? 'online' : 'offline'}.svg)`
      el.style.width = '40px'
      el.style.height = '40px'
      el.style.cursor = 'pointer'
      
      el.addEventListener('click', () => {
        setSelectedDevice(device.id)
      })
      
      new mapboxgl.Marker(el)
        .setLngLat([device.currentPosition.lng, device.currentPosition.lat])
        .addTo(map.current!)
    })
  }, [devices])
  
  // Fit map to show all markers
  useEffect(() => {
    if (!map.current || !devices || devices.length === 0) return
    
    const bounds = new mapboxgl.LngLatBounds()
    devices.forEach(device => {
      bounds.extend([device.currentPosition.lng, device.currentPosition.lat])
    })
    
    map.current.fitBounds(bounds, { padding: 50 })
  }, [devices])
  
  const selectedDeviceData = devices?.find(d => d.id === selectedDevice)
  
  return (
    <div className="relative h-[calc(100vh-200px)] flex">
      {/* Sidebar with tracking list */}
      <div className="w-80 border-r bg-background overflow-y-auto">
        <TrackingList
          devices={devices || []}
          selectedDevice={selectedDevice}
          onSelect={setSelectedDevice}
        />
      </div>
      
      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Controls overlay */}
        <div className="absolute top-4 left-4 z-10">
          <TrackingControls
            onZoomIn={() => map.current?.zoomIn()}
            onZoomOut={() => map.current?.zoomOut()}
            onReset={() => {
              if (devices && devices.length > 0) {
                const bounds = new mapboxgl.LngLatBounds()
                devices.forEach(device => {
                  bounds.extend([device.currentPosition.lng, device.currentPosition.lat])
                })
                map.current?.fitBounds(bounds, { padding: 50 })
              }
            }}
          />
        </div>
        
        {/* Selected device details */}
        {selectedDeviceData && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <TrackingDetails
              device={selectedDeviceData}
              onClose={() => setSelectedDevice(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

### 3. MonitoringDashboard.tsx - IoT мониторинг датчиков

```typescript
'use client'

import { useSensors } from '../../hooks/useSensors'
import { SensorCard } from './SensorCard'
import { TemperatureChart } from './TemperatureChart'
import { HumidityChart } from './HumidityChart'
import { VibrationChart } from './VibrationChart'
import { SensorAlerts } from './SensorAlerts'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Thermometer, Droplets, Activity, AlertTriangle } from 'lucide-react'

interface MonitoringDashboardProps {
  shipmentId?: string
}

export function MonitoringDashboard({ shipmentId }: MonitoringDashboardProps) {
  // Real-time sensor data (WebSocket)
  const { data: sensors, isLoading } = useSensors(shipmentId)
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }
  
  const temperatureSensors = sensors?.filter(s => s.type === 'temperature') || []
  const humiditySensors = sensors?.filter(s => s.type === 'humidity') || []
  const vibrationSensors = sensors?.filter(s => s.type === 'vibration') || []
  
  const activeAlerts = sensors?.flatMap(s => s.alerts.filter(a => !a.acknowledged)) || []
  
  return (
    <div className="space-y-6">
      {/* Alerts banner */}
      {activeAlerts.length > 0 && (
        <div className="p-4 border-l-4 border-destructive bg-destructive/10 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-semibold text-destructive">
              {activeAlerts.length} активных предупреждений
            </span>
          </div>
          <SensorAlerts alerts={activeAlerts} />
        </div>
      )}
      
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Thermometer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Температура</div>
              <div className="text-2xl font-bold">
                {temperatureSensors.length > 0 
                  ? `${temperatureSensors[0].currentReading.value}°C`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Влажность</div>
              <div className="text-2xl font-bold">
                {humiditySensors.length > 0
                  ? `${humiditySensors[0].currentReading.value}%`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Вибрация</div>
              <div className="text-2xl font-bold">
                {vibrationSensors.length > 0
                  ? `${vibrationSensors[0].currentReading.value} g`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Статус</div>
              <div className="text-2xl font-bold">
                {sensors?.every(s => s.currentReading.status === 'normal') 
                  ? 'Норма' 
                  : 'Внимание'
                }
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Sensor cards grid */}
      <div className="grid grid-cols-4 gap-4">
        {sensors?.map(sensor => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="temperature">
        <TabsList>
          <TabsTrigger value="temperature">Температура</TabsTrigger>
          <TabsTrigger value="humidity">Влажность</TabsTrigger>
          <TabsTrigger value="vibration">Вибрация</TabsTrigger>
        </TabsList>
        
        <TabsContent value="temperature" className="mt-4">
          <Card className="p-6">
            <TemperatureChart sensors={temperatureSensors} />
          </Card>
        </TabsContent>
        
        <TabsContent value="humidity" className="mt-4">
          <Card className="p-6">
            <HumidityChart sensors={humiditySensors} />
          </Card>
        </TabsContent>
        
        <TabsContent value="vibration" className="mt-4">
          <Card className="p-6">
            <VibrationChart sensors={vibrationSensors} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 4. InventoryAudit.tsx - Инвентаризация с QR сканером

```typescript
'use client'

import { useState } from 'react'
import { useInventoryAudit } from '../../hooks/useInventoryAudit'
import { QRScanner } from '../shared/QRScanner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { QrCode, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react'

interface InventoryAuditProps {
  auditId: string
}

export function InventoryAudit({ auditId }: InventoryAuditProps) {
  const { data: audit, markAsFound, markAsMissing } = useInventoryAudit(auditId)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  if (!audit) return null
  
  const progress = (audit.totalScanned / audit.totalExpected) * 100
  
  const handleScan = async (qrCode: string) => {
    // Find exhibit by QR code
    const item = audit.items.find(i => i.exhibitQRCode === qrCode)
    
    if (item) {
      await markAsFound.mutateAsync({
        auditId,
        itemId: item.id,
      })
      
      // Success feedback
      alert(`Отсканирован: ${item.exhibitName}`)
    } else {
      // Extra item (not in expected list)
      alert('Экспонат не найден в списке инвентаризации')
    }
    
    setIsScannerOpen(false)
  }
  
  const filteredItems = audit.items.filter(item => 
    item.exhibitName.toLowerCase().includes(search.toLowerCase()) ||
    item.inventoryNumber.toLowerCase().includes(search.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{audit.name}</h2>
        <p className="text-muted-foreground">{audit.description}</p>
      </div>
      
      {/* Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Прогресс инвентаризации</span>
            <span className="text-2xl font-bold">{progress.toFixed(0)}%</span>
          </div>
          
          <Progress value={progress} />
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{audit.totalExpected}</div>
              <div className="text-sm text-muted-foreground">Ожидается</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{audit.totalFound}</div>
              <div className="text-sm text-muted-foreground">Найдено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{audit.totalMissing}</div>
              <div className="text-sm text-muted-foreground">Отсутствует</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{audit.totalExtra}</div>
              <div className="text-sm text-muted-foreground">Лишние</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или номеру..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={() => setIsScannerOpen(true)}>
          <QrCode className="h-4 w-4 mr-2" />
          Сканировать QR
        </Button>
      </div>
      
      {/* Items list */}
      <div className="space-y-2">
        {filteredItems.map(item => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center gap-4">
              {/* Status icon */}
              <div>
                {item.status === 'found' && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                {item.status === 'missing' && (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                {item.status === 'misplaced' && (
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                )}
                {!item.status && (
                  <div className="h-6 w-6 rounded-full border-2 border-muted" />
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="font-medium">{item.exhibitName}</div>
                <div className="text-sm text-muted-foreground">
                  {item.inventoryNumber} • {item.expectedLocationName}
                </div>
                {item.actualLocationName && item.actualLocationName !== item.expectedLocationName && (
                  <div className="text-sm text-yellow-600">
                    Найден: {item.actualLocationName}
                  </div>
                )}
              </div>
              
              {/* Status badge */}
              <div>
                {item.status === 'found' && (
                  <Badge variant="success">Найден</Badge>
                )}
                {item.status === 'missing' && (
                  <Badge variant="destructive">Отсутствует</Badge>
                )}
                {item.status === 'misplaced' && (
                  <Badge variant="warning">Не на месте</Badge>
                )}
                {!item.status && (
                  <Badge variant="outline">Не проверен</Badge>
                )}
              </div>
              
              {/* Actions */}
              {!item.status && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsFound.mutate({ auditId, itemId: item.id })}
                  >
                    Найден
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsMissing.mutate({ auditId, itemId: item.id })}
                  >
                    Отсутствует
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  )
}
```

---

## BACKEND (Python Service - PostgreSQL + JSONB)

### Service Structure

```
backend/services/logistics/
├── app/
│   ├── main.py
│   ├── models/
│   │   ├── exhibit.py
│   │   ├── shipment.py
│   │   ├── tracking.py
│   │   └── sensor.py
│   ├── routes/
│   │   ├── exhibits.py
│   │   ├── shipments.py
│   │   ├── tracking.py
│   │   ├── sensors.py
│   │   └── inventory.py
│   ├── services/
│   │   ├── exhibit_service.py
│   │   ├── shipment_service.py
│   │   ├── tracking_service.py
│   │   ├── iot_service.py
│   │   └── qr_service.py
│   ├── websocket/
│   │   ├── tracking_ws.py
│   │   └── sensors_ws.py
│   └── middleware/
│       └── auth.py
├── migrations/
│   └── 001_create_logistics_tables.sql
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### PostgreSQL Schema (JSONB для гибких данных)

**Почему PostgreSQL + JSONB вместо MongoDB:**

| Критерий | PostgreSQL + JSONB | MongoDB |
|----------|-------------------|---------|
| **ACID транзакции** | ✅ Полная поддержка | ⚠️ Ограничена |
| **Joins** | ✅ Эффективные | ❌ Сложные aggregation |
| **JSON queries** | ✅ JSONB (быстро) | ✅ Native |
| **Индексы на JSON** | ✅ GIN indexes | ✅ |
| **Consistency** | ✅ Строгая | ⚠️ Eventual |
| **Ecosystem** | ✅ Единая БД для всего | ❌ Еще одна БД |
| **Стоимость** | ✅ Меньше | ❌ Больше (еще один сервис) |
| **Operational complexity** | ✅ Меньше | ❌ Больше |

**Вывод:** PostgreSQL + JSONB дает все преимущества гибкой схемы MongoDB, но с ACID транзакциями, джоинами и без дополнительной БД.

```sql
-- Exhibits table (structured + flexible JSONB)
CREATE TABLE exhibits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    project_id UUID REFERENCES projects(id),
    
    -- Structured fields (для фильтров и индексов)
    name VARCHAR(500) NOT NULL,
    inventory_number VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    condition VARCHAR(20) NOT NULL,
    
    -- Physical properties
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    depth DECIMAL(10, 2),
    weight DECIMAL(10, 2),
    
    -- Value
    estimated_value DECIMAL(15, 2),
    insurance_value DECIMAL(15, 2),
    is_insured BOOLEAN DEFAULT FALSE,
    
    -- Current location
    current_location_id UUID REFERENCES locations(id),
    
    -- Flexible metadata (JSONB для расширяемости)
    metadata JSONB DEFAULT '{}'::JSONB,
    /*
    metadata может содержать:
    {
      "author": "Иван Шишкин",
      "year_created": 1889,
      "origin": "Россия",
      "acquisition_date": "2020-01-15",
      "acquisition_source": "Частная коллекция",
      "materials": ["масло", "холст"],
      "style": "реализм",
      "period": "XIX век",
      "custom_field_1": "значение",
      ... любые другие поля
    }
    */
    
    -- Requirements (JSONB для гибкости)
    requirements JSONB DEFAULT '{}'::JSONB,
    /*
    requirements:
    {
      "temperature_min": 18,
      "temperature_max": 22,
      "humidity_min": 40,
      "humidity_max": 60,
      "light_max": 150,
      "fragile": true,
      "climate_control": true,
      "special_handling": true,
      "handling_notes": "Хранить вертикально",
      "vibration_sensitive": true,
      ... любые другие требования
    }
    */
    
    -- Tracking
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(50),
    rfid_tag VARCHAR(100),
    
    -- Tags для поиска
    tags TEXT[] DEFAULT '{}',
    
    -- Images (JSONB array)
    images JSONB DEFAULT '[]'::JSONB,
    /*
    images:
    [
      {
        "url": "https://storage.exponat.ru/exhibits/img1.jpg",
        "thumbnail_url": "https://storage.exponat.ru/exhibits/thumb1.jpg",
        "caption": "Общий вид",
        "is_primary": true,
        "uploaded_at": "2024-03-20T10:00:00Z"
      }
    ]
    */
    
    -- Documents (JSONB array)
    documents JSONB DEFAULT '[]'::JSONB,
    /*
    documents:
    [
      {
        "type": "passport",
        "title": "Паспорт экспоната",
        "file_url": "https://storage.exponat.ru/docs/passport.pdf",
        "uploaded_at": "2024-03-20T10:00:00Z"
      }
    ]
    */
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_inventory_date TIMESTAMP,
    
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Indexes
CREATE INDEX idx_exhibits_org ON exhibits(organization_id);
CREATE INDEX idx_exhibits_project ON exhibits(project_id);
CREATE INDEX idx_exhibits_category ON exhibits(category);
CREATE INDEX idx_exhibits_status ON exhibits(status);
CREATE INDEX idx_exhibits_location ON exhibits(current_location_id);
CREATE INDEX idx_exhibits_inventory ON exhibits(inventory_number);
CREATE INDEX idx_exhibits_qr ON exhibits(qr_code);

-- GIN indexes для JSONB (быстрый поиск по JSON полям)
CREATE INDEX idx_exhibits_metadata ON exhibits USING GIN (metadata);
CREATE INDEX idx_exhibits_requirements ON exhibits USING GIN (requirements);

-- GIN index для full-text search по tags
CREATE INDEX idx_exhibits_tags ON exhibits USING GIN (tags);

-- Примеры JSONB queries:

-- Найти экспонаты с автором "Шишкин"
SELECT * FROM exhibits 
WHERE metadata->>'author' = 'Иван Шишкин';

-- Найти экспонаты с температурным режимом 18-22°C
SELECT * FROM exhibits 
WHERE (requirements->>'temperature_min')::int = 18
  AND (requirements->>'temperature_max')::int = 22;

-- Найти хрупкие экспонаты
SELECT * FROM exhibits 
WHERE requirements->>'fragile' = 'true';

-- Найти экспонаты по тегу
SELECT * FROM exhibits 
WHERE 'живопись' = ANY(tags);

-- Обновить metadata (добавить новое поле)
UPDATE exhibits 
SET metadata = metadata || '{"restoration_date": "2024-03-15"}'::JSONB
WHERE id = 'xxx';
```

```sql
-- Locations table (hierarchical)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    type VARCHAR(30) NOT NULL,  -- warehouse, exhibition_hall, storage, restoration, transit
    name VARCHAR(255) NOT NULL,
    
    -- Address
    address TEXT,
    building VARCHAR(100),
    floor VARCHAR(50),
    room VARCHAR(50),
    shelf VARCHAR(50),
    
    -- Hierarchy (optional - для складов с зонами/стеллажами)
    parent_id UUID REFERENCES locations(id),
    path TEXT,  -- materialized path
    
    -- Coordinates (для карты)
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    
    -- Capacity
    total_capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    
    -- Settings
    has_climate_control BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_parent ON locations(parent_id);
-- PostGIS для geospatial queries (опционально)
-- CREATE INDEX idx_locations_coords ON locations USING GIST (ST_MakePoint(longitude, latitude));

-- Shipments table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    project_id UUID REFERENCES projects(id),
    
    number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,  -- incoming, outgoing, internal
    status VARCHAR(30) NOT NULL,  -- planned, in_preparation, in_transit, delivered, cancelled
    
    -- Route
    origin_location_id UUID REFERENCES locations(id),
    destination_location_id UUID REFERENCES locations(id),
    distance DECIMAL(10, 2),  -- км
    estimated_duration INTEGER,  -- минуты
    
    -- Waypoints (JSONB array)
    waypoints JSONB DEFAULT '[]'::JSONB,
    /*
    waypoints:
    [
      {
        "location_id": "uuid",
        "name": "Checkpoint 1",
        "coordinates": {"lat": 55.75, "lng": 37.61},
        "planned_arrival": "2024-03-20T14:00:00Z"
      }
    ]
    */
    
    -- Dates
    planned_departure_date TIMESTAMP,
    actual_departure_date TIMESTAMP,
    planned_arrival_date TIMESTAMP,
    actual_arrival_date TIMESTAMP,
    
    -- Vehicle info (JSONB для гибкости)
    transport_type VARCHAR(20),  -- truck, van, car, air, rail, sea
    vehicle JSONB DEFAULT '{}'::JSONB,
    /*
    vehicle:
    {
      "type": "truck",
      "plate_number": "А123БВ",
      "model": "Газель",
      "driver_id": "uuid",
      "driver_name": "Иванов И.И.",
      "driver_phone": "+7 999 123-45-67",
      "has_climate_control": true,
      "max_weight": 1500
    }
    */
    
    -- Stats
    total_exhibits INTEGER DEFAULT 0,
    total_weight DECIMAL(10, 2),
    total_value DECIMAL(15, 2),
    
    -- Packaging
    packaging JSONB DEFAULT '{}'::JSONB,
    /*
    packaging:
    {
      "crates_count": 5,
      "boxes_count": 10,
      "packing_list_url": "https://..."
    }
    */
    
    -- Cost
    cost_amount DECIMAL(15, 2),
    cost_currency VARCHAR(3) DEFAULT 'RUB',
    budget_category_id UUID,
    
    -- Tracking
    tracking_enabled BOOLEAN DEFAULT FALSE,
    tracking_device_id VARCHAR(100),
    
    -- Monitoring
    monitoring_enabled BOOLEAN DEFAULT FALSE,
    
    -- Flags
    has_incidents BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    created_by UUID NOT NULL
);

CREATE INDEX idx_shipments_org ON shipments(organization_id);
CREATE INDEX idx_shipments_project ON shipments(project_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_number ON shipments(number);

-- Shipment exhibits (many-to-many)
CREATE TABLE shipment_exhibits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    exhibit_id UUID NOT NULL REFERENCES exhibits(id),
    
    -- Condition at packing
    condition_at_packing VARCHAR(20),
    
    -- Packaging details
    packaged_in VARCHAR(100),  -- номер ящика/контейнера
    notes TEXT,
    
    -- Condition at delivery
    condition_at_delivery VARCHAR(20),
    delivery_notes TEXT,
    
    UNIQUE(shipment_id, exhibit_id)
);

CREATE INDEX idx_shipment_exhibits_shipment ON shipment_exhibits(shipment_id);
CREATE INDEX idx_shipment_exhibits_exhibit ON shipment_exhibits(exhibit_id);

-- Shipment documents
CREATE TABLE shipment_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    
    type VARCHAR(30) NOT NULL,  -- waybill, packing_list, insurance, customs, acceptance_act
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    
    uploaded_at TIMESTAMP DEFAULT NOW(),
    uploaded_by UUID
);

CREATE INDEX idx_shipment_docs_shipment ON shipment_documents(shipment_id);

-- Shipment timeline (events)
CREATE TABLE shipment_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    
    timestamp TIMESTAMP NOT NULL,
    type VARCHAR(30) NOT NULL,  -- created, departed, checkpoint, incident, arrived, completed
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location (optional)
    location JSONB,
    /*
    location:
    {
      "lat": 55.75,
      "lng": 37.61,
      "address": "Москва, ул. Примерная, 1"
    }
    */
    
    user_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timeline_shipment ON shipment_timeline(shipment_id);
CREATE INDEX idx_timeline_timestamp ON shipment_timeline(timestamp);

-- Shipment incidents
CREATE TABLE shipment_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    
    timestamp TIMESTAMP NOT NULL,
    type VARCHAR(30) NOT NULL,  -- delay, damage, deviation, temperature, humidity, other
    severity VARCHAR(20) NOT NULL,  -- low, medium, high, critical
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    
    -- Affected exhibits (array of UUIDs)
    affected_exhibits UUID[],
    
    -- Resolution
    resolved_at TIMESTAMP,
    resolution TEXT,
    resolved_by UUID,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_incidents_shipment ON shipment_incidents(shipment_id);
CREATE INDEX idx_incidents_severity ON shipment_incidents(severity);

-- GPS Tracking (time-series data)
CREATE TABLE tracking_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    
    -- Position
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    accuracy DECIMAL(10, 2),  -- meters
    altitude DECIMAL(10, 2),
    heading DECIMAL(5, 2),  -- degrees 0-360
    speed DECIMAL(6, 2),  -- km/h
    
    timestamp TIMESTAMP NOT NULL,
    
    -- Device status
    battery_level INTEGER,  -- %
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tracking_device ON tracking_positions(device_id);
CREATE INDEX idx_tracking_shipment ON tracking_positions(shipment_id);
CREATE INDEX idx_tracking_timestamp ON tracking_positions(timestamp);

-- Tracking devices
CREATE TABLE tracking_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    
    shipment_id UUID REFERENCES shipments(id),
    vehicle_plate_number VARCHAR(20),
    
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP,
    
    -- Current position (denormalized для быстрого доступа)
    current_latitude DECIMAL(10, 7),
    current_longitude DECIMAL(10, 7),
    current_speed DECIMAL(6, 2),
    current_heading DECIMAL(5, 2),
    position_updated_at TIMESTAMP,
    
    battery_level INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_devices_device_id ON tracking_devices(device_id);
CREATE INDEX idx_devices_shipment ON tracking_devices(shipment_id);

-- Tracking alerts
CREATE TABLE tracking_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    
    type VARCHAR(30) NOT NULL,  -- offline, speed_exceeded, route_deviation, geofence_breach, low_battery
    severity VARCHAR(20) NOT NULL,  -- info, warning, critical
    
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_device ON tracking_alerts(device_id);
CREATE INDEX idx_alerts_acknowledged ON tracking_alerts(acknowledged);

-- IoT Sensors
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,  -- temperature, humidity, vibration, shock, tilt, light
    name VARCHAR(255) NOT NULL,
    
    -- Attached to
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    exhibit_id UUID REFERENCES exhibits(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    
    -- Current reading (denormalized)
    current_value DECIMAL(10, 4),
    current_unit VARCHAR(10),
    current_status VARCHAR(20),  -- normal, warning, critical
    reading_updated_at TIMESTAMP,
    
    -- Thresholds (JSONB для гибкости разных типов датчиков)
    thresholds JSONB DEFAULT '{}'::JSONB,
    /*
    thresholds:
    {
      "min_normal": 18,
      "max_normal": 22,
      "min_warning": 16,
      "max_warning": 24,
      "min_critical": 14,
      "max_critical": 26
    }
    */
    
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP,
    battery_level INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensors_sensor_id ON sensors(sensor_id);
CREATE INDEX idx_sensors_shipment ON sensors(shipment_id);
CREATE INDEX idx_sensors_exhibit ON sensors(exhibit_id);
CREATE INDEX idx_sensors_type ON sensors(type);

-- Sensor readings (time-series data)
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id VARCHAR(100) NOT NULL,
    
    value DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- normal, warning, critical
    
    timestamp TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_readings_sensor ON sensor_readings(sensor_id);
CREATE INDEX idx_readings_timestamp ON sensor_readings(timestamp);

-- Sensor alerts
CREATE TABLE sensor_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id VARCHAR(100) NOT NULL,
    
    type VARCHAR(30) NOT NULL,  -- threshold_exceeded, sensor_offline, battery_low
    severity VARCHAR(20) NOT NULL,  -- warning, critical
    
    message TEXT NOT NULL,
    value DECIMAL(10, 4),
    threshold DECIMAL(10, 4),
    
    timestamp TIMESTAMP NOT NULL,
    
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensor_alerts_sensor ON sensor_alerts(sensor_id);
CREATE INDEX idx_sensor_alerts_ack ON sensor_alerts(acknowledged);

-- Inventory audits
CREATE TABLE inventory_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,  -- planned, in_progress, completed, cancelled
    
    -- Dates
    planned_date DATE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Stats
    total_expected INTEGER DEFAULT 0,
    total_scanned INTEGER DEFAULT 0,
    total_found INTEGER DEFAULT 0,
    total_missing INTEGER DEFAULT 0,
    total_extra INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Assigned auditors
    assigned_to UUID[]
);

CREATE INDEX idx_audits_org ON inventory_audits(organization_id);
CREATE INDEX idx_audits_status ON inventory_audits(status);

-- Audit locations (which locations to audit)
CREATE TABLE audit_locations (
    audit_id UUID NOT NULL REFERENCES inventory_audits(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id),
    
    PRIMARY KEY (audit_id, location_id)
);

-- Audit items
CREATE TABLE audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES inventory_audits(id) ON DELETE CASCADE,
    exhibit_id UUID NOT NULL REFERENCES exhibits(id),
    
    expected_location_id UUID REFERENCES locations(id),
    actual_location_id UUID REFERENCES locations(id),
    
    status VARCHAR(20),  -- found, missing, misplaced, extra
    condition VARCHAR(20),
    
    scanned_at TIMESTAMP,
    scanned_by UUID,
    notes TEXT,
    
    UNIQUE(audit_id, exhibit_id)
);

CREATE INDEX idx_audit_items_audit ON audit_items(audit_id);
CREATE INDEX idx_audit_items_exhibit ON audit_items(exhibit_id);
CREATE INDEX idx_audit_items_status ON audit_items(status);

-- Movement history (audit trail)
CREATE TABLE movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibit_id UUID NOT NULL REFERENCES exhibits(id),
    
    from_location_id UUID REFERENCES locations(id),
    to_location_id UUID NOT NULL REFERENCES locations(id),
    
    moved_at TIMESTAMP NOT NULL,
    moved_by UUID NOT NULL,
    
    reason VARCHAR(30) NOT NULL,  -- exhibition, storage, restoration, shipment, inventory, other
    reason_details TEXT,
    
    shipment_id UUID REFERENCES shipments(id),
    audit_id UUID REFERENCES inventory_audits(id),
    
    approved BOOLEAN DEFAULT TRUE,
    approved_by UUID,
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_movements_exhibit ON movements(exhibit_id);
CREATE INDEX idx_movements_from ON movements(from_location_id);
CREATE INDEX idx_movements_to ON movements(to_location_id);
CREATE INDEX idx_movements_date ON movements(moved_at);
CREATE INDEX idx_movements_shipment ON movements(shipment_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exhibits_updated_at
    BEFORE UPDATE ON exhibits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER audits_updated_at
    BEFORE UPDATE ON inventory_audits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger для обновления current position в tracking_devices
CREATE OR REPLACE FUNCTION update_device_position()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tracking_devices
    SET 
        current_latitude = NEW.latitude,
        current_longitude = NEW.longitude,
        current_speed = NEW.speed,
        current_heading = NEW.heading,
        position_updated_at = NEW.timestamp,
        battery_level = NEW.battery_level,
        is_online = TRUE,
        last_seen_at = NEW.timestamp
    WHERE device_id = NEW.device_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tracking_position_inserted
    AFTER INSERT ON tracking_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_device_position();

-- Trigger для обновления current reading в sensors
CREATE OR REPLACE FUNCTION update_sensor_reading()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sensors
    SET 
        current_value = NEW.value,
        current_unit = NEW.unit,
        current_status = NEW.status,
        reading_updated_at = NEW.timestamp,
        is_online = TRUE,
        last_seen_at = NEW.timestamp
    WHERE sensor_id = NEW.sensor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sensor_reading_inserted
    AFTER INSERT ON sensor_readings
    FOR EACH ROW
    EXECUTE FUNCTION update_sensor_reading();
```

### Python Models (SQLAlchemy)

```python
from sqlalchemy import Column, String, Integer, Numeric, Boolean, TIMESTAMP, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class Exhibit(Base):
    __tablename__ = 'exhibits'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False)
    project_id = Column(UUID(as_uuid=True))
    
    name = Column(String(500), nullable=False)
    inventory_number = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False)
    condition = Column(String(20), nullable=False)
    
    width = Column(Numeric(10, 2))
    height = Column(Numeric(10, 2))
    depth = Column(Numeric(10, 2))
    weight = Column(Numeric(10, 2))
    
    estimated_value = Column(Numeric(15, 2))
    insurance_value = Column(Numeric(15, 2))
    is_insured = Column(Boolean, default=False)
    
    current_location_id = Column(UUID(as_uuid=True))
    
    # JSONB fields для гибкости
    metadata = Column(JSONB, default={})
    requirements = Column(JSONB, default={})
    images = Column(JSONB, default=[])
    documents = Column(JSONB, default=[])
    
    qr_code = Column(String(100), unique=True, nullable=False)
    barcode = Column(String(50))
    rfid_tag = Column(String(100))
    
    tags = Column(ARRAY(Text), default=[])
    
    created_at = Column(TIMESTAMP, server_default='NOW()')
    updated_at = Column(TIMESTAMP, server_default='NOW()')
    last_inventory_date = Column(TIMESTAMP)

# Примеры JSONB queries с SQLAlchemy:

# Найти экспонаты с автором "Шишкин"
exhibits = session.query(Exhibit).filter(
    Exhibit.metadata['author'].astext == 'Иван Шишкин'
).all()

# Найти хрупкие экспонаты
fragile_exhibits = session.query(Exhibit).filter(
    Exhibit.requirements['fragile'].astext == 'true'
).all()

# Обновить metadata
exhibit.metadata = {**exhibit.metadata, 'restoration_date': '2024-03-15'}
session.commit()
```

---

## ПОЧЕМУ PostgreSQL + JSONB ЛУЧШЕ MONGODB

### Преимущества PostgreSQL + JSONB:

**1. ACID транзакции:**
```python
# Перемещение экспоната с транзакцией
@transaction
async def move_exhibit(exhibit_id, new_location_id, user_id):
    # 1. Update exhibit location
    await db.execute(
        "UPDATE exhibits SET current_location_id = $1 WHERE id = $2",
        new_location_id, exhibit_id
    )
    
    # 2. Create movement record
    await db.execute(
        "INSERT INTO movements (exhibit_id, to_location_id, moved_by) VALUES ($1, $2, $3)",
        exhibit_id, new_location_id, user_id
    )
    
    # 3. Update location occupancy
    await db.execute(
        "UPDATE locations SET current_occupancy = current_occupancy + 1 WHERE id = $1",
        new_location_id
    )
    
    # Всё или ничего - ACID гарантирует consistency
```

**2. Joins работают:**
```sql
-- Найти все экспонаты в конкретной локации с данными о текущей перевозке
SELECT 
    e.*,
    l.name as location_name,
    s.number as shipment_number,
    s.status as shipment_status
FROM exhibits e
LEFT JOIN locations l ON e.current_location_id = l.id
LEFT JOIN shipment_exhibits se ON e.id = se.exhibit_id
LEFT JOIN shipments s ON se.shipment_id = s.id
WHERE l.id = 'xxx';
```

**3. Один PostgreSQL для всего:**
```
PostgreSQL:
├── Projects (уже есть)
├── Budget (уже есть)
├── Users (уже есть)
├── Logistics ← добавляем сюда
└── ... другие модули

vs

PostgreSQL + MongoDB:
├── PostgreSQL (Projects, Budget, Users, ...)
└── MongoDB (только Logistics)
    ↓
    - Еще один сервис для мониторинга
    - Еще один backup процесс
    - Еще одна точка отказа
    - Больше operational complexity
```

**4. Consistency гарантирована:**
```python
# MongoDB - eventual consistency
await mongo.exhibits.update_one(
    {'_id': exhibit_id},
    {'$set': {'current_location_id': new_location}}
)
# Другой процесс может прочитать старое значение!

# PostgreSQL - strong consistency
await pg.execute(
    "UPDATE exhibits SET current_location_id = $1 WHERE id = $2",
    new_location, exhibit_id
)
# Сразу видно всем
```

**5. JSONB queries быстрые:**
```sql
-- GIN index на JSONB делает queries быстрыми
CREATE INDEX idx_exhibits_metadata ON exhibits USING GIN (metadata);

-- Query с фильтром по JSONB полю
EXPLAIN ANALYZE
SELECT * FROM exhibits 
WHERE metadata->>'author' = 'Шишкин';
-- Index Scan using idx_exhibits_metadata  (cost=... actual time=0.123ms)
```

### Когда MongoDB реально нужен:

- ✅ Логи (append-only, огромные объемы)
- ✅ Real-time analytics (temporary data)
- ✅ Content management (documents without relations)
- ✅ Horizontal sharding needed (петабайты данных)

**Для Logistics:** Не нужно ничего из этого. PostgreSQL + JSONB идеален.

---

## ТРЕБОВАНИЯ

### Frontend
- ✅ 6 views: Exhibits, Shipments, Tracking (Map), Monitoring (IoT), Inventory, Reports
- ✅ Real-time GPS tracking (Mapbox/Leaflet + WebSocket)
- ✅ Real-time IoT monitoring (Charts + WebSocket)
- ✅ QR code generation and scanning (camera)
- ✅ Image gallery with upload
- ✅ Drag-and-drop file uploads
- ✅ Responsive (mobile для QR сканирования)
- ✅ Permission guards (logistics:read, logistics:write)

### Backend (Python + FastAPI)
- ✅ **PostgreSQL** (structured + JSONB для гибкости)
- ✅ SQLAlchemy ORM
- ✅ WebSocket для real-time (GPS + IoT)
- ✅ File upload (images, documents)
- ✅ QR code generation (python-qrcode)
- ✅ GPS tracking integration (REST API от tracker providers)
- ✅ IoT sensors integration (MQTT/HTTP)
- ✅ Celery для background tasks (notifications, reports)
- ✅ TimescaleDB (опционально, для time-series оптимизации)

### Database
- ✅ **PostgreSQL** (вместо MongoDB)
- ✅ JSONB для гибких metadata/requirements/images/documents
- ✅ GIN indexes на JSONB (fast JSON queries)
- ✅ Triggers для auto-update denormalized fields
- ✅ ACID транзакции
- ✅ Foreign keys с cascades
- ✅ Time-series tables (tracking_positions, sensor_readings)

### Integrations
- ✅ GPS trackers (REST API integration)
- ✅ IoT sensors (MQTT broker для датчиков)
- ✅ Maps (Mapbox или Leaflet + OpenStreetMap)
- ✅ QR scanner (HTML5 camera API)

Создай полный модуль Logistics. Agent mode.
```

---

## ПОСЛЕ ВЫПОЛНЕНИЯ

```bash
cd exponat/web

# ✅ Check structure
ls src/features/logistics/components/

# ✅ Start dev
npm run dev
open http://localhost:3000/logistics

# ✅ Test views
# /logistics/exhibits
# /logistics/shipments
# /logistics/tracking (GPS map)
# /logistics/monitoring (IoT dashboard)
# /logistics/inventory
```

**Используй в Cursor → Composer → Agent mode**
