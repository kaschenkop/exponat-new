# ARCHITECTURE.md - ЭКСПОНАТ (EXPONAT)

**SaaS-платформа для управления выставками**

Версия: 1.0  
Дата: Март 2026  
Статус: Production Ready

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор системы](#обзор-системы)
2. [Архитектурные принципы](#архитектурные-принципы)
3. [Technology Stack](#technology-stack)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Architecture](#database-architecture)
7. [Infrastructure](#infrastructure)
8. [Security](#security)
9. [Scalability & Performance](#scalability--performance)
10. [Monitoring & Observability](#monitoring--observability)
11. [Deployment](#deployment)
12. [Development Workflow](#development-workflow)

---

## 🎯 ОБЗОР СИСТЕМЫ

### Назначение

**Экспонат** — комплексная SaaS-платформа для управления выставками (музейными, корпоративными, экспофорумами) с функциями искусственного интеллекта.

### Ключевые возможности

**Управление проектами:**
- Планирование выставок (Gantt, Kanban, Calendar)
- Управление командой и задачами
- Timeline и этапы проекта
- Real-time коллаборация

**Финансы:**
- Бюджетирование и контроль расходов
- Интеграция с 1С
- Workflow согласования платежей
- Финансовая аналитика

**Логистика:**
- Учет и отслеживание экспонатов
- GPS tracking и IoT мониторинг
- Планирование перевозок
- Контроль условий хранения

**Пространственное планирование:**
- 2D/3D планирование выставочного пространства
- Размещение экспонатов
- Освещение и мультимедиа
- Экспорт чертежей

**AI-функции:**
- Генерация документации (концепции, сценарии, ТЗ)
- Анализ требований и рисков
- Рекомендации по оптимизации
- Чат-ассистент с RAG

**CRM & Участники:**
- Управление участниками и посетителями
- Билетная система с QR-кодами
- Email-маркетинг
- Членские программы

**Аналитика:**
- Дашборды и метрики
- ML прогнозирование
- Custom reports
- Export в Excel/PDF

### Целевые пользователи

- **Музеи:** Третьяковская галерея, Эрмитаж, ГМИИ им. Пушкина
- **Выставочные центры:** Экспоцентр, Крокус Экспо, Ленэкспо
- **Корпорации:** Газпром, РЖД, Росатом (корпоративные выставки)
- **Event-агентства:** Организаторы специализированных выставок

### Рынок

- **Основной:** Россия и СНГ
- **Язык:** Русский (основной), English (дополнительный)
- **Соответствие:** 152-ФЗ, GDPR ready

---

## 🏛️ АРХИТЕКТУРНЫЕ ПРИНЦИПЫ

### 1. Cloud-Native

Система спроектирована для работы в облаке с поддержкой:
- **Containerization** - Docker для всех компонентов
- **Orchestration** - Kubernetes для управления
- **Auto-scaling** - горизонтальное масштабирование
- **Multi-region** - распределение по регионам

### 2. Microservices

Backend разбит на независимые микросервисы:
- **Domain-Driven Design** - сервисы по доменам
- **Database per Service** - изолированные БД
- **Independent Deployment** - независимый деплой
- **Loose Coupling** - слабая связность

### 3. Event-Driven

Асинхронная коммуникация через события:
- **Apache Kafka** - event streaming
- **Event Sourcing** - хранение событий
- **CQRS** - разделение команд и запросов
- **Saga Pattern** - распределенные транзакции

### 4. API-First

API как основа взаимодействия:
- **RESTful API** - для внешних клиентов
- **gRPC** - для inter-service коммуникации
- **GraphQL** - для сложных запросов (опционально)
- **OpenAPI Spec** - документация API

### 5. Security by Design

Безопасность на всех уровнях:
- **Zero Trust** - не доверять по умолчанию
- **OAuth 2.0 / OpenID Connect** - аутентификация
- **RBAC + ABAC** - авторизация
- **Encryption** - данные в покое и передаче
- **Security Headers** - защита web-приложения

### 6. Observability

Полная видимость системы:
- **Structured Logging** - структурированные логи
- **Metrics** - метрики производительности
- **Distributed Tracing** - трассировка запросов
- **Alerting** - автоматические уведомления

---

## 💻 TECHNOLOGY STACK

### Frontend

| Технология | Версия | Назначение |
|-----------|--------|-----------|
| **Next.js** | 14.2+ | React framework (App Router) |
| **React** | 18.3+ | UI библиотека |
| **TypeScript** | 5.4+ | Типизация |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **shadcn/ui** | latest | UI компоненты (Radix UI + Tailwind) |
| **Zustand** | 4.5+ | Глобальное состояние |
| **TanStack Query** | 5.28+ | Server state, кэширование |
| **React Hook Form** | 7.51+ | Управление формами |
| **Zod** | 3.22+ | Валидация и типизация |
| **Framer Motion** | 11.0+ | Анимации |
| **Lucide Icons** | latest | Иконки |
| **next-intl** | 3.9+ | Интернационализация (ru/en) |
| **Recharts** | 2.12+ | Графики и диаграммы |
| **React Three Fiber** | 8.15+ | 3D визуализация (Three.js) |
| **Socket.io-client** | 4.7+ | WebSocket для real-time |
| **Y.js** | 13.6+ | CRDT для коллаборации |

### Backend - Go Services

| Технология | Версия | Назначение |
|-----------|--------|-----------|
| **Go** | 1.22+ | Основной язык для core сервисов |
| **Gin / Echo** | latest | HTTP framework |
| **gRPC** | latest | Inter-service коммуникация |
| **Go-pg** | latest | PostgreSQL driver |
| **Go-Redis** | latest | Redis client |

**Go сервисы (8):**
1. Project Management - управление проектами
2. Budget Management - бюджетирование
3. Construction Management - строительство/монтаж
4. Space Planning - планирование пространства
5. Participant Management - CRM участников
6. Notification Service - уведомления
7. File Storage Service - файлы (S3/MinIO)
8. Search Service - поиск (Elasticsearch proxy)

### Backend - Python Services

| Технология | Версия | Назначение |
|-----------|--------|-----------|
| **Python** | 3.11+ | Язык для AI/ML сервисов |
| **FastAPI** | 0.109+ | Async HTTP framework |
| **LangChain** | 0.1+ | LLM orchestration |
| **OpenAI / YandexGPT** | latest | LLM APIs |
| **TensorFlow / PyTorch** | latest | ML фреймворки |
| **pandas** | latest | Data processing |
| **Celery** | latest | Task queue |

**Python сервисы (6):**
1. AI Document Generation - генерация документов (LLM)
2. AI Analytics - ML аналитика и прогнозы
3. AI Assistant - чат-ассистент с RAG
4. Exhibit Logistics - логистика (IoT интеграции)
5. Reporting Service - отчеты (pandas)
6. Integration Service - интеграции (1С, и др.)

### Backend - Additional

| Технология | Версия | Назначение |
|-----------|--------|-----------|
| **Keycloak** | latest | IAM (Identity & Access Management) |
| **Apache Kafka** | 3.6+ | Event streaming |
| **RabbitMQ** | 3.12+ | Message broker для задач |

### Databases

| База данных | Назначение |
|------------|-----------|
| **PostgreSQL 16** | Основная OLTP БД (Projects, Budget, Users, etc.) |
| **MongoDB 7** | Logistics (гибкая схема экспонатов) |
| **Redis 7** | Кэш, сессии, rate limiting |
| **Elasticsearch 8** | Полнотекстовый поиск |
| **ClickHouse** | OLAP, аналитика, временные ряды |
| **Pinecone / Qdrant** | Vector DB для AI RAG |

### Infrastructure & DevOps

| Технология | Назначение |
|-----------|-----------|
| **Docker** | Контейнеризация |
| **Kubernetes** | Оркестрация контейнеров |
| **Helm** | Package manager для K8s |
| **ArgoCD** | GitOps CD |
| **Terraform** | Infrastructure as Code |
| **GitHub Actions** | CI/CD pipelines |
| **Prometheus + Grafana** | Мониторинг метрик |
| **ELK / Loki** | Логирование |
| **Jaeger / Tempo** | Distributed tracing |
| **Sentry** | Error tracking |

### Cloud Provider

**Основной:** Yandex Cloud (соответствие 152-ФЗ)
**Альтернативы:** VK Cloud, SberCloud, on-premise

---

## ⚛️ FRONTEND ARCHITECTURE

### Архитектурный паттерн: Feature-Sliced Design

```
web/src/
├── app/                    # Next.js App Router
│   └── [locale]/           # Интернационализация (ru/en)
│       ├── (auth)/         # Auth routes group
│       ├── (dashboard)/    # Dashboard routes group
│       ├── layout.tsx
│       └── page.tsx
│
├── features/               # Feature modules (Domain slices)
│   ├── dashboard/
│   ├── projects/
│   ├── budget/
│   ├── logistics/
│   ├── construction/
│   ├── space-planning/
│   ├── participants/
│   ├── ai-assistant/
│   ├── analytics/
│   └── auth/
│
├── shared/                 # Shared code (Infrastructure)
│   ├── ui/                 # UI components (shadcn/ui)
│   ├── lib/                # Utils, helpers, constants
│   ├── hooks/              # Common hooks
│   ├── types/              # Global types
│   ├── api/                # API client
│   └── config/             # Configuration
│
├── widgets/                # Composite components
│   ├── sidebar/
│   ├── header/
│   └── stats-cards/
│
└── i18n/                   # Internationalization
    ├── locales/
    │   ├── ru.json
    │   └── en.json
    └── config.ts
```

### Feature Module Structure

Каждый feature модуль имеет единообразную структуру:

```
features/[domain]/
├── components/             # UI компоненты
│   ├── [Name]Card.tsx
│   ├── [Name]Form.tsx
│   ├── [Name]List.tsx
│   └── [Name]Filters.tsx
├── hooks/                  # Custom hooks
│   ├── use[Name].ts
│   ├── use[Name]s.ts
│   └── use[Name]Mutations.ts
├── api/                    # API layer
│   └── [name]Api.ts
├── store/                  # Zustand stores (UI state only)
│   └── [name]Store.ts
├── types/                  # TypeScript types
│   └── [name].types.ts
└── utils/                  # Domain utilities
    ├── [name]Helpers.ts
    └── [name]Validation.ts
```

### State Management Strategy

Разделение состояний по типам:

| Тип состояния | Инструмент | Примеры | Обоснование |
|--------------|-----------|---------|-------------|
| **Server State** | TanStack Query | Проекты, бюджет, экспонаты, участники | Данные с backend, кэширование, синхронизация |
| **Global Client State** | Zustand | Текущий пользователь, UI state (sidebar, theme) | Легковесный, простой API |
| **Form State** | React Hook Form + Zod | Формы создания/редактирования | Производительность, валидация |
| **Local Component State** | useState, useReducer | Модальные окна, аккордеоны, табы | Локальная логика компонента |
| **URL State** | useSearchParams | Фильтры, пагинация, сортировка | Shareable URLs, browser history |

### Rendering Strategy

**Server Components (по умолчанию):**
- Статические страницы
- Страницы требующие SEO
- Страницы с данными доступными на сервере

**Client Components (`'use client'`):**
- Интерактивные элементы (onClick, onChange)
- Hooks (useState, useEffect)
- Browser APIs (localStorage, window)
- Real-time updates (WebSocket)

**SSR vs SSG vs ISR:**
- **SSR** - для динамических данных (Dashboard, Project Detail)
- **SSG** - для статики (Landing, Docs, Blog)
- **ISR** - для полустатичного (Public project previews)

### Design System

**Цвета (Exponat Brand):**
```typescript
colors: {
  primary: '#6366F1',      // Indigo - основной бренд
  secondary: '#8B5CF6',    // Purple - акценты
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  neutral: 'slate',        // Slate оттенки
}
```

**Типографика:**
- **Display:** Cal Sans - заголовки
- **Body:** Onest / Geist - текст (отличная кириллица)
- **Mono:** JetBrains Mono - код

**Spacing:** 4, 8, 12, 16, 24, 32, 48, 64, 96px

**Breakpoints (Mobile-first):**
- sm: 640px (mobile landscape)
- md: 768px (tablets)
- lg: 1024px (desktops)
- xl: 1280px (large screens)
- 2xl: 1536px (extra large)

### Performance Optimizations

**Code Splitting:**
- Route-based splitting (автоматически Next.js)
- Component-based splitting (React.lazy)
- Vendor splitting (отдельные chunks для библиотек)

**Optimization Techniques:**
- `next/image` - автооптимизация изображений (WebP/AVIF)
- `next/font` - оптимизация шрифтов
- Tree Shaking - удаление неиспользуемого кода
- React.memo - мемоизация компонентов
- useMemo / useCallback - мемоизация вычислений
- Virtual Scrolling - для длинных списков (react-window)
- Debounce / Throttle - для search/filter

**Target Metrics:**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Lighthouse Score:** > 90

---

## 🔧 BACKEND ARCHITECTURE

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Kong API Gateway                           │
│        (Standard Solution - Production Ready)                │
│  Plugins: JWT, Rate Limiting, CORS, Logging, Metrics        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌────────────────┐
│   Go Services │    │Python Services │    │  Keycloak IAM  │
│      (8)      │    │      (6)       │    │     (Java)     │
│               │    │                │    │                │
│ • Projects    │    │ • AI Doc Gen   │    │ • OAuth 2.0    │
│ • Budget      │    │ • AI Analytics │    │ • SSO          │
│ • Construction│    │ • AI Assistant │    │ • User Mgmt    │
│ • Space Plan  │    │ • Logistics    │    │ • MFA          │
│ • Participants│    │ • Reporting    │    │                │
│ • Notifications│   │ • Integration  │    │                │
│ • File Storage│    │                │    │                │
│ • Search      │    │                │    │                │
└───────────────┘    └────────────────┘    └────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
            ┌──────────────┐    ┌──────────────┐
            │ Apache Kafka │    │  RabbitMQ    │
            │   (Events)   │    │   (Tasks)    │
            └──────────────┘    └──────────────┘
```

### Service Responsibilities

#### API Gateway (Kong - Standard Solution)

**Tech:** Kong Gateway 3.5+ (nginx + Lua)
**Database:** DB-less mode (декларативная конфигурация в Git)

**Responsibilities:**
- Роутинг запросов к микросервисам
- Authentication (JWT validation, OAuth 2.0 proxy)
- Rate limiting (per user, per endpoint)
- CORS handling
- Request/Response transformation
- Circuit breaker
- Logging (structured JSON)
- Metrics (Prometheus)
- API documentation (OpenAPI)

**Конфигурация:** Декларативная (YAML в Git) → GitOps
**Deployment:** Kubernetes (3 replicas для HA)
**Мониторинг:** Prometheus + Grafana

**Почему Kong, а не custom Go:**
- ✅ Production-ready из коробки
- ✅ Богатая экосистема плагинов
- ✅ Не нужно разрабатывать и поддерживать
- ✅ High performance (nginx-based)
- ✅ Декларативная конфигурация
- ✅ Large community

См. подробнее в разделе "API Gateway Solution" выше.

#### Go Services (High Performance)

**Project Management:**
- **Tech:** Go (Echo), PostgreSQL, Redis, WebSocket
- **Responsibilities:**
  - CRUD проектов выставок
  - Управление задачами и timeline
  - Real-time коллаборация (WebSocket)
  - Gantt, Kanban, Calendar данные
- **Database:** PostgreSQL + Redis
- **Events:** project.created, project.updated, task.assigned

**Budget Management:**
- **Tech:** Go, PostgreSQL (ACID)
- **Responsibilities:**
  - Планирование бюджета
  - Tracking расходов
  - Интеграция с 1С (REST/SOAP client)
  - Workflow согласования
  - Alerts при превышении бюджета
- **Database:** PostgreSQL
- **Events:** budget.exceeded, payment.approved

**Space Planning:**
- **Tech:** Go, PostgreSQL + PostGIS
- **Responsibilities:**
  - Хранение 2D/3D планов
  - Размещение экспонатов
  - Геопространственные запросы (PostGIS)
- **Database:** PostgreSQL с PostGIS

**Participant Management:**
- **Tech:** Go, PostgreSQL, Elasticsearch
- **Responsibilities:**
  - CRM участников
  - Билетная система
  - Email кампании
  - Поиск участников (Elasticsearch)
- **Database:** PostgreSQL + Elasticsearch

**Notification Service:**
- **Tech:** Go
- **Responsibilities:**
  - Email уведомления
  - SMS уведомления
  - Push notifications
  - In-app notifications
  - Высокий throughput
- **Database:** PostgreSQL
- **Queue:** RabbitMQ

**File Storage Service:**
- **Tech:** Go, MinIO/S3
- **Responsibilities:**
  - Загрузка файлов
  - Генерация signed URLs
  - Обработка изображений (resize, optimize)
- **Storage:** MinIO / Yandex Object Storage

**Search Service:**
- **Tech:** Go, Elasticsearch
- **Responsibilities:**
  - Прокси к Elasticsearch
  - Полнотекстовый поиск
  - Faceted search
  - Автодополнение
- **Database:** Elasticsearch

#### Python Services (AI/ML & Integrations)

**AI Document Generation:**
- **Tech:** Python (FastAPI), LangChain, OpenAI/YandexGPT
- **Responsibilities:**
  - Генерация концепций, сценариев, ТЗ
  - RAG (Retrieval-Augmented Generation)
  - Template-based generation
  - Векторный поиск по документам
- **Database:** PostgreSQL + Vector DB (Pinecone/Qdrant)
- **Queue:** Celery (фоновая генерация)

**AI Analytics:**
- **Tech:** Python (FastAPI), TensorFlow, scikit-learn, pandas
- **Responsibilities:**
  - ML модели для прогнозирования
  - Анализ трендов и паттернов
  - Рекомендательные системы
  - Оптимизация бюджета/логистики
- **Database:** ClickHouse (временные ряды), PostgreSQL
- **MLOps:** MLflow для версионирования моделей

**AI Assistant:**
- **Tech:** Python (FastAPI), Rasa, LangChain
- **Responsibilities:**
  - Чат-ассистент с NLU
  - Контекстные ответы (RAG)
  - Интеграция с LLM
  - WebSocket для real-time chat
- **Database:** Redis (сессии), PostgreSQL
- **Vector DB:** Pinecone/Qdrant

**Exhibit Logistics:**
- **Tech:** Python (FastAPI), MongoDB
- **Responsibilities:**
  - Учет экспонатов (гибкая схема)
  - IoT интеграции (GPS, датчики)
  - Планирование перевозок
  - Мониторинг условий
- **Database:** MongoDB (гибкая схема экспонатов)
- **Integrations:** IoT sensors APIs, GPS tracking

**Reporting Service:**
- **Tech:** Python (FastAPI), pandas, matplotlib
- **Responsibilities:**
  - Генерация отчетов (Excel, PDF)
  - Data processing (pandas)
  - Визуализация данных
  - Custom report builder
- **Database:** ClickHouse (OLAP запросы)

**Integration Service:**
- **Tech:** Python (FastAPI)
- **Responsibilities:**
  - Интеграция с 1С (REST/SOAP)
  - Интеграция с CMS
  - Платежные системы
  - Email providers
  - Множество адаптеров
- **Database:** PostgreSQL

#### Identity & Access Management

**Keycloak (готовое решение):**
- **Tech:** Java (Keycloak)
- **Responsibilities:**
  - OAuth 2.0 / OpenID Connect
  - SSO (Single Sign-On)
  - Управление пользователями
  - RBAC / ABAC
  - MFA (Multi-Factor Authentication)
  - LDAP/AD integration
- **Database:** PostgreSQL

### API Gateway Solution

**Рекомендуется:** Kong Gateway (Open Source) или Yandex API Gateway

#### Сравнение решений:

| Решение | Плюсы | Минусы | Рекомендация |
|---------|-------|--------|--------------|
| **Kong (Open Source)** | • Production-ready<br>• Богатая экосистема плагинов<br>• Высокая производительность<br>• Декларативная конфигурация<br>• OpenAPI support | • Требует PostgreSQL/Cassandra<br>• Дополнительная сложность | ✅ **Рекомендуется** для self-hosted |
| **Yandex API Gateway** | • Managed service<br>• Serverless (нет инфраструктуры)<br>• Интеграция с Yandex Cloud<br>• Pay-per-request | • Vendor lock-in<br>• Меньше гибкости | ✅ **Рекомендуется** для Yandex Cloud |
| **Nginx + Lua** | • Легковесный<br>• Хорошо знаком командам<br>• Гибкость | • Больше ручной работы<br>• Меньше готовых фич | ⚠️ Для простых случаев |
| **Traefik** | • Cloud-native<br>• Auto-discovery<br>• Let's Encrypt интеграция | • Меньше enterprise фич<br>• Сложнее мониторинг | ⚠️ Для K8s-native setup |
| **Custom Go Gateway** | • Полный контроль<br>• Специфичная логика | • Нужно разрабатывать<br>• Поддержка и багфиксы<br>• Reinventing the wheel | ❌ Не рекомендуется |

#### Выбор: Kong Gateway (Open Source)

**Почему Kong:**
1. **Production-ready** из коробки
2. **Богатая экосистема плагинов:**
   - Rate limiting
   - Authentication (JWT, OAuth 2.0, LDAP)
   - CORS
   - Request/Response transformation
   - Caching
   - Logging
   - Analytics
3. **Высокая производительность** (nginx + Lua)
4. **Декларативная конфигурация** (GitOps-friendly)
5. **OpenAPI/Swagger интеграция**
6. **Observability** (Prometheus, DataDog, etc.)
7. **Large community** и enterprise support опция

**Архитектура с Kong:**

```
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer                          │
│              (Yandex Cloud / NGINX)                      │
│                  SSL termination                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Kong Gateway                          │
│                                                          │
│  Plugins:                                                │
│  • JWT Authentication                                    │
│  • Rate Limiting (100 req/s per user)                   │
│  • CORS                                                  │
│  • Request/Response Transformation                      │
│  • Logging (structured JSON)                            │
│  • Prometheus metrics                                    │
│  • Circuit Breaker                                       │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌────────────────┐ ┌──────────────┐
│  Go Services  │ │Python Services │ │  Keycloak    │
│               │ │                │ │    (IAM)     │
│ • Projects    │ │ • AI Doc Gen   │ │              │
│ • Budget      │ │ • AI Analytics │ │ • OAuth 2.0  │
│ • ...         │ │ • ...          │ │ • Users      │
└───────────────┘ └────────────────┘ └──────────────┘
```

**Kong Configuration (декларативная):**

```yaml
# kong.yml
_format_version: "3.0"

services:
  - name: project-service
    url: http://project-service:8080
    routes:
      - name: projects-route
        paths:
          - /api/v1/projects
        strip_path: false
    plugins:
      - name: jwt
        config:
          claims_to_verify:
            - exp
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: prometheus
      
  - name: budget-service
    url: http://budget-service:8080
    routes:
      - name: budgets-route
        paths:
          - /api/v1/budgets
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100

  - name: ai-assistant-service
    url: http://ai-assistant:8000
    routes:
      - name: ai-route
        paths:
          - /api/v1/ai
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 20  # меньше для AI (дороже)
      - name: request-size-limiting
        config:
          allowed_payload_size: 10  # 10 MB

plugins:
  - name: cors
    config:
      origins:
        - https://exponat.ru
        - https://*.exponat.ru
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
      headers:
        - Authorization
        - Content-Type
      exposed_headers:
        - X-Auth-Token
      credentials: true
      max_age: 3600
```

**Deployment (Kubernetes):**

```yaml
# helm values для Kong
apiVersion: v1
kind: ConfigMap
metadata:
  name: kong-config
data:
  kong.yml: |
    # конфигурация выше

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
spec:
  replicas: 3  # HA
  selector:
    matchLabels:
      app: kong
  template:
    metadata:
      labels:
        app: kong
    spec:
      containers:
      - name: kong
        image: kong:3.5
        env:
        - name: KONG_DATABASE
          value: "off"  # DB-less mode (декларативная конфиг)
        - name: KONG_DECLARATIVE_CONFIG
          value: /kong/kong.yml
        - name: KONG_PROXY_ACCESS_LOG
          value: /dev/stdout
        - name: KONG_ADMIN_ACCESS_LOG
          value: /dev/stdout
        - name: KONG_PROXY_ERROR_LOG
          value: /dev/stderr
        - name: KONG_ADMIN_ERROR_LOG
          value: /dev/stderr
        ports:
        - name: proxy
          containerPort: 8000
        - name: admin
          containerPort: 8001
        volumeMounts:
        - name: config
          mountPath: /kong
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
      volumes:
      - name: config
        configMap:
          name: kong-config
```

#### Альтернатива: Yandex API Gateway (для полностью managed решения)

**Если используется Yandex Cloud и нужен serverless подход:**

```yaml
# serverless.yml (Yandex API Gateway)
openapi: 3.0.0
info:
  title: Exponat API
  version: 1.0.0

paths:
  /api/v1/projects:
    get:
      summary: List projects
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: d4e...  # Cloud Function ID
        service_account_id: aje...
      security:
        - jwt: []
      
  /api/v1/projects/{id}:
    get:
      summary: Get project
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      x-yc-apigateway-integration:
        type: http
        url: http://project-service.default.svc.cluster.local:8080/projects/{id}
        method: GET
        timeouts:
          read: 30s
      security:
        - jwt: []

components:
  securitySchemes:
    jwt:
      type: apiKey
      in: header
      name: Authorization
```

**Плюсы Yandex API Gateway:**
- Полностью managed (нет инфраструктуры)
- Автоматическое масштабирование
- Pay-per-request
- Интеграция с Yandex Cloud Functions
- Встроенный мониторинг

**Минусы:**
- Vendor lock-in
- Меньше контроля
- Меньше кастомизации

### Итоговая рекомендация

**Для Production: Kong Gateway (Open Source)**

Причины:
1. ✅ Не нужно разрабатывать с нуля
2. ✅ Production-ready из коробки
3. ✅ Богатая функциональность (auth, rate limiting, logging)
4. ✅ Высокая производительность
5. ✅ GitOps-friendly (декларативная конфигурация)
6. ✅ Vendor-agnostic (можно мигрировать между облаками)
7. ✅ Large community и поддержка
8. ✅ Observability из коробки

**Кастомный Go Gateway имеет смысл только если:**
- ❌ Очень специфичная бизнес-логика в gateway (редко нужно)
- ❌ Уникальные требования, которые Kong не покрывает (маловероятно)
- ❌ Есть большая команда для поддержки (дорого)

**Вывод:** Используем проверенное решение (Kong), экономим время на разработку, фокусируемся на бизнес-логике в сервисах.

### Communication Patterns

#### Synchronous Communication

**REST API:**
- Client ↔ API Gateway: REST
- API Gateway ↔ Services: REST / gRPC
- External APIs: REST

**gRPC:**
- Inter-service: Go ↔ Go, Go ↔ Python
- High performance, type-safe
- Protocol Buffers

#### Asynchronous Communication

**Apache Kafka (Events):**
- Event streaming
- Event sourcing
- High throughput
- Examples:
  - `project.created`
  - `budget.exceeded`
  - `task.assigned`
  - `payment.approved`

**RabbitMQ (Tasks):**
- Task queue
- Background jobs
- Retry logic
- Examples:
  - Email sending
  - Report generation
  - File processing
  - Notifications

#### Real-time Communication

**WebSocket:**
- Server-Sent Events (SSE)
- Real-time updates
- Collaborative editing
- Examples:
  - Project collaboration
  - Live notifications
  - Chat assistant

### Data Management Patterns

**CQRS (Command Query Responsibility Segregation):**
- Разделение команд (write) и запросов (read)
- Оптимизация каждой операции отдельно
- Materialized views для чтения

**Event Sourcing:**
- Хранение всех событий
- Audit log по умолчанию
- Возможность восстановить состояние
- Temporal queries

**Saga Pattern:**
- Распределенные транзакции
- Orchestration / Choreography
- Компенсирующие транзакции
- Examples: Создание проекта с бюджетом и командой

**Database per Service:**
- Изолированные БД для каждого сервиса
- Нет shared database
- API как единственный интерфейс

### Resilience Patterns

**Circuit Breaker:**
- Защита от каскадных сбоев
- Fail fast при проблемах
- Auto-recovery
- Library: Resilience4j (Go), tenacity (Python)

**Retry with Backoff:**
- Автоматические повторы
- Exponential backoff
- Max retry limit

**Timeout:**
- Request timeout
- Connection timeout
- Circuit breaker timeout

**Bulkhead:**
- Изоляция ресурсов
- Thread pools
- Connection pools

**Rate Limiting:**
- API Gateway level
- Per-service level
- Per-user quotas

---

## 🗄️ DATABASE ARCHITECTURE

### Database Distribution

```
┌──────────────────────────────────────────────────────────┐
│                     PostgreSQL 16                         │
│              (Main OLTP Database)                        │
│                                                          │
│  • projects          • users          • organizations    │
│  • budgets           • teams          • permissions      │
│  • tasks             • events         • audit_log        │
│  • phases            • approvals      • activity_log     │
│  • participants      • tickets        • ...              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                      MongoDB 7                            │
│          (Flexible Schema - Logistics)                   │
│                                                          │
│  • exhibits (гибкая схема)                               │
│  • iot_data (sensor readings)                            │
│  • tracking_history                                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                       Redis 7                             │
│              (Cache & Sessions)                          │
│                                                          │
│  • Session storage                                       │
│  • Cache (dashboard stats, project data)                │
│  • Rate limiting counters                                │
│  • Real-time presence                                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  Elasticsearch 8                          │
│               (Full-Text Search)                         │
│                                                          │
│  • Projects search                                       │
│  • Participants search                                   │
│  • Documents search                                      │
│  • Autocomplete                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    ClickHouse                             │
│                  (OLAP Analytics)                        │
│                                                          │
│  • analytics_events                                      │
│  • budget_trends                                         │
│  • visitor_statistics                                    │
│  • performance_metrics                                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              Pinecone / Qdrant                            │
│                 (Vector Database)                        │
│                                                          │
│  • Document embeddings (RAG)                             │
│  • Semantic search                                       │
│  • AI assistant context                                  │
└──────────────────────────────────────────────────────────┘
```

### PostgreSQL Schema Design

**Key Tables:**

```sql
-- Organizations (Multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'museum', 'expo_center', 'corporate', 'agency'
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50), -- 'admin', 'manager', 'coordinator', 'viewer'
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- 'museum', 'corporate', 'expo_forum'
    status VARCHAR(50), -- 'draft', 'planning', 'active', 'completed'
    start_date DATE,
    end_date DATE,
    total_budget DECIMAL(15, 2),
    spent_budget DECIMAL(15, 2),
    progress INTEGER CHECK (progress >= 0 AND progress <= 100),
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50), -- 'todo', 'in_progress', 'review', 'done'
    priority VARCHAR(50), -- 'low', 'medium', 'high', 'urgent'
    start_date DATE,
    due_date DATE,
    assignee_id UUID REFERENCES users(id),
    parent_task_id UUID REFERENCES tasks(id),
    dependencies UUID[], -- array of task IDs
    progress INTEGER DEFAULT 0,
    order_num INTEGER, -- для Kanban
    created_at TIMESTAMP DEFAULT NOW()
);

-- Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    total_planned DECIMAL(15, 2),
    total_spent DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'RUB',
    status VARCHAR(20), -- 'draft', 'approved', 'active'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Budget Categories (иерархические)
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES budget_categories(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- для 1С
    planned_amount DECIMAL(15, 2),
    spent_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexing Strategy:**
- Primary keys: UUID with gen_random_uuid()
- Foreign keys: всегда indexed
- Query patterns: composite indexes
- Full-text: PostgreSQL full-text search + Elasticsearch
- Геоданные: PostGIS для Space Planning

**Partitioning:**
- activity_log: по датам (monthly)
- analytics_events: по датам (daily/weekly)

**Materialized Views:**
```sql
-- Dashboard stats (обновляется каждые 5 минут)
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    organization_id,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_projects,
    SUM(p.total_budget) as total_budget,
    SUM(p.spent_budget) as spent_budget
FROM projects p
GROUP BY organization_id;
```

### Data Consistency

**Eventual Consistency:**
- Между микросервисами
- Через Kafka events
- Компенсирующие транзакции (Saga)

**Strong Consistency:**
- Внутри одного сервиса (PostgreSQL ACID)
- Критичные операции (платежи)

**Conflict Resolution:**
- Last-Write-Wins (для большинства данных)
- CRDT (для collaborative editing через Y.js)

---

## ☁️ INFRASTRUCTURE

### Cloud Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Yandex Cloud                           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Managed Kubernetes                     │ │
│  │                                                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │  Node 1  │  │  Node 2  │  │  Node 3  │  ...   │ │
│  │  │          │  │          │  │          │        │ │
│  │  │ Pods:    │  │ Pods:    │  │ Pods:    │        │ │
│  │  │ • Go Svc │  │ • Python │  │ • Go Svc │        │ │
│  │  │ • Redis  │  │ • Postgres│  │ • Kafka │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  │                                                     │ │
│  │  Auto-scaling: HPA + VPA                          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Managed Databases                          │ │
│  │                                                     │ │
│  │  • PostgreSQL (Multi-AZ)                           │ │
│  │  • MongoDB (Replica Set)                           │ │
│  │  • Redis (Sentinel)                                │ │
│  │  • ClickHouse (Cluster)                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Object Storage (S3)                        │ │
│  │                                                     │ │
│  │  • Files, Images, Documents                        │ │
│  │  • Versioning enabled                              │ │
│  │  • Lifecycle policies                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Load Balancer                              │ │
│  │  • SSL/TLS termination                             │ │
│  │  • Health checks                                   │ │
│  │  • DDoS protection                                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel                                │
│               (Frontend Hosting)                        │
│                                                          │
│  • Next.js App                                           │
│  • Edge Functions                                        │
│  • CDN (Global)                                          │
│  • Auto-scaling                                          │
└─────────────────────────────────────────────────────────┘
```

### Kubernetes Architecture

**Namespaces:**
- `production` - production environment
- `staging` - staging environment
- `development` - dev environment

**Deployments:**
- Rolling updates (zero-downtime)
- Health checks (liveness + readiness probes)
- Resource limits (CPU, Memory)
- Auto-scaling (HPA - Horizontal Pod Autoscaler)

**Services:**
- ClusterIP (internal)
- LoadBalancer (external, через Yandex LB)
- Headless (для StatefulSets)

**Storage:**
- PersistentVolumes для stateful workloads
- StorageClasses для разных типов дисков
- Velero для backup

**Networking:**
- Istio Service Mesh (опционально)
- Network Policies (изоляция)
- Ingress Controller (NGINX)

### Infrastructure as Code (Terraform)

```hcl
# Пример Terraform модуля для K8s кластера
module "kubernetes_cluster" {
  source = "./modules/kubernetes"
  
  name                = "exponat-production"
  version             = "1.26"
  node_count          = 3
  node_instance_type  = "s2.medium" # 4 vCPU, 8 GB RAM
  
  auto_scaling = {
    min_nodes = 3
    max_nodes = 10
  }
  
  network_id = yandex_vpc_network.main.id
  subnet_ids = yandex_vpc_subnet.private[*].id
}

# PostgreSQL Managed
module "postgresql" {
  source = "./modules/database"
  
  name           = "exponat-db"
  version        = "16"
  instance_type  = "s2.medium"
  disk_size      = 100 # GB
  
  ha_enabled     = true # Multi-AZ
  backup_window  = "02:00-03:00"
  
  databases = [
    "projects",
    "budgets",
    "users"
  ]
}
```

### Multi-Region Strategy

**Primary Region:** ru-central1 (Москва)
**DR Region:** ru-central1-b (резервная зона)

**Data Replication:**
- PostgreSQL: streaming replication
- MongoDB: replica sets across zones
- Redis: Sentinel with replicas
- S3: cross-region replication

**Failover:**
- Автоматический для БД (managed services)
- Ручной для K8s кластера (через ArgoCD)
- RTO: 4 часа
- RPO: 1 час

---

## 🔒 SECURITY

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│         Layer 7: Application Security                   │
│  • Input validation (Zod)                                │
│  • SQL injection prevention (parameterized queries)     │
│  • XSS prevention (React auto-escaping)                 │
│  • CSRF tokens                                           │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│         Layer 6: Authentication & Authorization         │
│  • OAuth 2.0 / OpenID Connect (Keycloak)                │
│  • JWT tokens (short-lived)                             │
│  • MFA (TOTP, SMS)                                       │
│  • RBAC + ABAC                                           │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│         Layer 5: API Security                            │
│  • API Gateway rate limiting                            │
│  • API keys для external integrations                   │
│  • Request signing                                       │
│  • API versioning                                        │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│         Layer 4: Network Security                        │
│  • VPC (private subnets)                                 │
│  • Security Groups (firewall rules)                     │
│  • Network Policies (K8s)                                │
│  • DDoS protection                                       │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│         Layer 3: Data Security                           │
│  • Encryption at rest (AES-256)                         │
│  • Encryption in transit (TLS 1.3)                      │
│  • Database encryption                                   │
│  • Secrets management (Vault / Lockbox)                 │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│         Layer 2: Infrastructure Security                 │
│  • OS hardening                                          │
│  • Container scanning (Trivy)                           │
│  • Image signing                                         │
│  • Security patches (auto-update)                       │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│         Layer 1: Compliance                              │
│  • 152-ФЗ (персональные данные РФ)                      │
│  • GDPR ready                                            │
│  • Audit logging                                         │
│  • Penetration testing (quarterly)                      │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Login request
     ▼
┌──────────────┐
│  Frontend    │
│  (Next.js)   │
└────┬─────────┘
     │ 2. Redirect to Keycloak
     ▼
┌──────────────┐
│  Keycloak    │
│  (OAuth 2.0) │
└────┬─────────┘
     │ 3. Authenticate
     │    (password / MFA / OAuth)
     │ 4. Issue tokens
     │    • Access Token (JWT, 15 min)
     │    • Refresh Token (7 days)
     │    • ID Token
     ▼
┌──────────────┐
│  Frontend    │
│  (stores     │
│   tokens)    │
└────┬─────────┘
     │ 5. API requests with
     │    Authorization: Bearer <token>
     ▼
┌──────────────┐
│ API Gateway  │
│ (validates   │
│  JWT)        │
└────┬─────────┘
     │ 6. Forward to services
     │    with user context
     ▼
┌──────────────┐
│  Services    │
│  (RBAC check)│
└──────────────┘
```

### Secrets Management

**HashiCorp Vault / Yandex Lockbox:**
- API keys
- Database passwords
- Encryption keys
- OAuth secrets
- 1С credentials

**Kubernetes Secrets:**
- Encrypted at rest (etcd encryption)
- RBAC для доступа
- Rotation policy (90 дней)

### Security Best Practices

**Development:**
- Dependency scanning (npm audit, safety)
- SAST (Static Analysis)
- Pre-commit hooks (секреты не в Git)
- Code review обязателен

**Production:**
- WAF (Web Application Firewall)
- IDS/IPS (Intrusion Detection/Prevention)
- Log monitoring (подозрительная активность)
- Incident response plan

---

## 📈 SCALABILITY & PERFORMANCE

### Horizontal Scaling

**Frontend:**
- Vercel auto-scaling (serverless functions)
- Edge CDN (global distribution)
- ISR для static pages

**Backend:**
- Kubernetes HPA (Horizontal Pod Autoscaler)
  - CPU-based: > 70% → scale up
  - Memory-based: > 80% → scale up
  - Custom metrics: request rate, queue length
- Min replicas: 2 (HA)
- Max replicas: 20

**Databases:**
- PostgreSQL: read replicas (до 5)
- MongoDB: sharding (по organization_id)
- Redis: cluster mode (partitioning)
- ClickHouse: distributed tables

### Vertical Scaling

**Node sizes:**
- Development: s2.small (2 vCPU, 4 GB)
- Staging: s2.medium (4 vCPU, 8 GB)
- Production: s2.large (8 vCPU, 16 GB)

**Auto-upgrade path:**
- Мониторинг resource usage
- Alert при > 80% утилизации
- Scheduled upgrades (maintenance window)

### Caching Strategy

**Layers:**
1. **Browser cache** (static assets)
   - JS/CSS: 1 year (content hash в имени)
   - Images: 1 month
   - API responses: no-cache (или short TTL)

2. **CDN cache** (Vercel Edge, Yandex CDN)
   - Static pages: 1 hour
   - Images: 1 day
   - API responses: не кэшируются

3. **Redis cache** (application level)
   - Dashboard stats: 5 минут
   - Project data: 30 секунд
   - User sessions: до logout
   - Rate limit counters: 1 минута

4. **Database query cache** (PostgreSQL)
   - Materialized views: 5 минут refresh
   - Query result cache: автоматически

**Cache Invalidation:**
- Time-based (TTL)
- Event-based (через Kafka)
- Manual (admin panel)

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time (p95)** | < 200ms | Prometheus |
| **API Response Time (p99)** | < 500ms | Prometheus |
| **Page Load Time (LCP)** | < 2.5s | Lighthouse |
| **Database Query Time** | < 50ms | Slow query log |
| **Cache Hit Rate** | > 80% | Redis metrics |
| **Throughput** | 1000 req/s per service | Load testing |
| **Availability (SLA)** | 99.9% | Uptime monitoring |

### Load Testing

**Tools:**
- k6 (load testing)
- Gatling (scenario-based)
- Artillery (API testing)

**Scenarios:**
- Normal load: 100 concurrent users
- Peak load: 1000 concurrent users
- Stress test: до failure point

**Frequency:**
- Before major releases
- Quarterly baseline tests
- After infrastructure changes

---

## 📊 MONITORING & OBSERVABILITY

### Three Pillars of Observability

```
┌─────────────────────────────────────────────────────────┐
│                   1. METRICS                             │
│                  (Prometheus + Grafana)                  │
│                                                          │
│  • Request rate (req/s)                                  │
│  • Response time (p50, p95, p99)                         │
│  • Error rate (%)                                        │
│  • CPU / Memory usage                                    │
│  • Database connections                                  │
│  • Cache hit rate                                        │
│  • Business metrics (projects created, budgets, etc.)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   2. LOGS                                │
│              (ELK Stack / Loki + Grafana)                │
│                                                          │
│  • Structured logging (JSON)                             │
│  • Correlation IDs (trace requests)                     │
│  • Log levels (ERROR, WARN, INFO, DEBUG)                │
│  • Centralized aggregation                              │
│  • Full-text search                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   3. TRACES                              │
│            (Jaeger / Tempo + OpenTelemetry)              │
│                                                          │
│  • Distributed tracing                                   │
│  • Request flow visualization                           │
│  • Latency breakdown                                     │
│  • Dependency mapping                                    │
│  • Performance bottlenecks                              │
└─────────────────────────────────────────────────────────┘
```

### Metrics Collection

**Prometheus exporters:**
- Node exporter (system metrics)
- PostgreSQL exporter
- Redis exporter
- Application metrics (custom)

**Business Metrics:**
```go
// Example: Go service
projectsCreated := prometheus.NewCounter(prometheus.CounterOpts{
    Name: "exponat_projects_created_total",
    Help: "Total number of projects created",
})

apiLatency := prometheus.NewHistogram(prometheus.HistogramOpts{
    Name: "exponat_api_latency_seconds",
    Help: "API request latency",
    Buckets: prometheus.DefBuckets,
})
```

**Grafana Dashboards:**
- System Overview (CPU, Memory, Disk, Network)
- API Performance (request rate, latency, errors)
- Database Performance (queries, connections, slow queries)
- Business Metrics (projects, budgets, users)
- Alerts Dashboard

### Logging

**Structured Logging (JSON):**
```json
{
  "timestamp": "2026-03-22T10:30:45Z",
  "level": "INFO",
  "service": "project-service",
  "trace_id": "abc123",
  "user_id": "user-456",
  "message": "Project created",
  "project_id": "proj-789",
  "duration_ms": 125
}
```

**Log Aggregation:**
- Filebeat → Elasticsearch → Kibana
- Or: Promtail → Loki → Grafana

**Retention:**
- ERROR logs: 90 дней
- WARN logs: 30 дней
- INFO logs: 7 дней
- DEBUG logs: 1 день (только dev/staging)

### Distributed Tracing

**OpenTelemetry instrumentation:**
```go
// Example trace
span := tracer.Start(ctx, "CreateProject")
defer span.End()

span.SetAttributes(
    attribute.String("project.name", name),
    attribute.String("user.id", userId),
)

// Call other services (auto-propagation)
budgetService.CreateBudget(ctx, budget)
```

**Trace visualization:**
```
[API Gateway] ──────┬──────> [Project Service]
   50ms             │            150ms
                    │              │
                    │              ├──> [Database]
                    │              │       80ms
                    │              │
                    │              └──> [Kafka Publish]
                    │                      30ms
                    │
                    └──────> [Notification Service]
                                    40ms
                                      │
                                      └──> [Email Send]
                                            25ms

Total latency: 200ms
```

### Alerting

**Alert Rules (Prometheus Alertmanager):**

**Critical (PagerDuty):**
- Service down (all replicas)
- Database unavailable
- Disk > 90% full
- Memory OOM kills
- API error rate > 5%

**Warning (Slack):**
- High latency (p95 > 1s)
- Cache hit rate < 70%
- Slow queries detected
- Disk > 80% full

**Info (Email):**
- New deployment
- Scheduled maintenance
- Weekly summary

### Error Tracking

**Sentry:**
- Frontend errors (React Error Boundary)
- Backend errors (exception handlers)
- Source maps для production
- Release tracking
- User feedback widget

**Error Grouping:**
- By error type
- By affected users
- By release version
- By service

---

## 🚀 DEPLOYMENT

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Actions                          │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐      ┌─────────┐     ┌─────────┐
   │  Lint   │      │  Test   │     │  Build  │
   │         │      │         │     │         │
   │ ESLint  │      │ Vitest  │     │ Docker  │
   │ Prettier│      │ Go test │     │ Image   │
   └─────────┘      └─────────┘     └─────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Security Scan   │
              │                  │
              │  • Trivy         │
              │  • npm audit     │
              │  • safety (Py)   │
              └──────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐      ┌─────────┐     ┌─────────┐
   │ Staging │      │  Prod   │     │ Rollback│
   │         │      │         │     │         │
   │ Auto on │      │ Manual  │     │  Auto   │
   │ develop │      │ approve │     │ on fail │
   └─────────┘      └─────────┘     └─────────┘
```

### Deployment Strategy

**Staging:**
- **Trigger:** Push to `develop` branch
- **Automatic:** Yes
- **Environment:** Staging K8s namespace
- **Database:** Staging DB (copy of production)
- **Testing:** Automated E2E tests

**Production:**
- **Trigger:** Git tag `v*.*.*`
- **Approval:** Required (manual)
- **Strategy:** Rolling update (zero-downtime)
- **Database:** Migrations before deploy
- **Rollback:** Automatic on health check fail

### Blue-Green Deployment (опционально)

```
┌─────────────────────────────────────────────────────────┐
│                  Load Balancer                           │
└─────────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
    ┌──────────┐                   ┌──────────┐
    │  Blue    │                   │  Green   │
    │  (v1.0)  │                   │  (v1.1)  │
    │          │                   │          │
    │ Current  │◄───── Switch ────▶│ New Ver  │
    │ 100%     │       traffic     │  0%      │
    └──────────┘                   └──────────┘

After validation:
    100% traffic → Green (v1.1)
    Keep Blue (v1.0) for quick rollback
```

### Database Migrations

**Strategy:**
- **Backwards compatible** migrations only
- **Zero-downtime** - старая версия app работает с новой схемой
- **Rollback plan** для каждой миграции

**Tools:**
- Go: golang-migrate
- Python: Alembic

**Process:**
1. Deploy migration (no breaking changes)
2. Deploy new app version
3. Run post-migration cleanup (опционально)

---

## 🔄 DEVELOPMENT WORKFLOW

### Local Development

**Prerequisites:**
```bash
Node.js 20+
Go 1.22+
Python 3.11+
Docker & Docker Compose
```

**Setup:**
```bash
# Clone repo
git clone https://github.com/org/exponat.git
cd exponat

# Environment
cp .env.example .env.local

# Start dependencies (PostgreSQL, Redis, etc.)
docker-compose up -d

# Frontend
cd web
npm install
npm run dev
# → http://localhost:3000

# Backend (example: projects service)
cd backend/services/projects
go run cmd/main.go
# → http://localhost:8080
```

### Git Workflow

**Branches:**
- `main` - production
- `develop` - integration
- `feature/*` - новые фичи
- `bugfix/*` - исправления
- `hotfix/*` - срочные fix для production

**Commit Convention (Conventional Commits):**
```
feat(projects): add Gantt chart view
fix(budget): resolve calculation error
docs(api): update API documentation
```

**Pull Request:**
- Минимум 1 approval
- CI checks passed
- Code review completed

### Testing Strategy

**Frontend:**
```bash
npm run test              # Unit tests (Vitest)
npm run test:coverage     # Coverage report
npm run test:e2e          # E2E (Playwright)
```

**Backend:**
```bash
go test ./...             # Unit tests
go test -race ./...       # Race detector
go test -cover ./...      # Coverage
```

**Coverage Targets:**
- Unit tests: > 70%
- Integration tests: Critical paths
- E2E tests: Happy paths

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

### Документация

- **Architecture Decision Records (ADR)** - docs/adr/
- **API Documentation** - OpenAPI specs в docs/api/
- **Runbooks** - docs/runbooks/ (incident response)
- **Onboarding Guide** - docs/onboarding.md

### Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Go Best Practices](https://golang.org/doc/effective_go)
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [OWASP Security](https://owasp.org/)

### Contact & Support

- **Team Lead:** [Name]
- **DevOps:** [Name]
- **Security:** [Name]
- **Slack:** #exponat-dev
- **Email:** dev@exponat.ru

---

**Версия:** 1.0  
**Последнее обновление:** Март 2026  
**Статус:** Production Ready  

**Лицензия:** Proprietary  
**Copyright:** © 2026 Exponat. All rights reserved.
