# ПРОМПТ: ЗАМЕНА CUSTOM API GATEWAY НА KONG

Используй этот промпт в Cursor Composer (Agent mode) для замены кастомного Go API Gateway на Kong Gateway.

---

## ПРОМПТ ДЛЯ CURSOR

```
@Codebase
@File exponat/ARCHITECTURE.md
@File exponat/API_GATEWAY_DECISION.md

Замени кастомный Go API Gateway на Kong Gateway (стандартное решение).

# КОНТЕКСТ

Проект Экспонат сейчас использует (или планирует) кастомный API Gateway на Go.
Это плохая идея — reinventing the wheel. Нужно заменить на Kong Gateway.

# ЗАДАЧИ

## 1. Удалить Custom API Gateway (если существует)

Если существует `backend/services/api-gateway/`:
```bash
# Удалить директорию
rm -rf backend/services/api-gateway/
```

Если есть ссылки в других местах:
- Обновить документацию
- Удалить из docker-compose.yml
- Удалить из CI/CD pipelines
- Удалить из Kubernetes manifests

## 2. Создать Kong Gateway конфигурацию

### Структура:

```
exponat/
├── infrastructure/
│   └── kong/
│       ├── kong.yml                          # Декларативная конфигурация
│       ├── kong-values.yaml                  # Helm values для K8s
│       ├── docker-compose.kong.yml           # Для локальной разработки
│       └── README.md                         # Документация Kong setup
└── docs/
    └── kong-setup.md                         # Инструкция по настройке
```

### infrastructure/kong/kong.yml

Создай полную декларативную конфигурацию Kong:

```yaml
_format_version: "3.0"
_transform: true

# =============================================================================
# GLOBAL PLUGINS
# =============================================================================

plugins:
  # CORS для всех routes
  - name: cors
    config:
      origins:
        - https://exponat.ru
        - https://staging.exponat.ru
        - https://*.exponat.ru
        - http://localhost:3000  # для разработки
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Authorization
        - Content-Type
        - X-Request-ID
      exposed_headers:
        - X-Auth-Token
        - X-Request-ID
      credentials: true
      max_age: 3600
      preflight_continue: false
  
  # Prometheus metrics
  - name: prometheus
    config:
      per_consumer: true
  
  # Structured logging
  - name: file-log
    config:
      path: /dev/stdout
      reopen: true
      custom_fields_by_lua:
        environment: return os.getenv("KONG_ENV") or "production"
  
  # Request ID для трассировки
  - name: correlation-id
    config:
      header_name: X-Request-ID
      generator: uuid
      echo_downstream: true

# =============================================================================
# UPSTREAM SERVICES
# =============================================================================

upstreams:
  # Projects Service
  - name: project-service-upstream
    algorithm: round-robin
    hash_on: none
    healthchecks:
      active:
        healthy:
          interval: 5
          successes: 2
        unhealthy:
          interval: 5
          http_failures: 3
        http_path: /health
        timeout: 1
      passive:
        healthy:
          successes: 2
        unhealthy:
          http_failures: 3
    targets:
      - target: project-service.default.svc.cluster.local:8080
        weight: 100
  
  # Budget Service
  - name: budget-service-upstream
    algorithm: round-robin
    healthchecks:
      active:
        http_path: /health
    targets:
      - target: budget-service.default.svc.cluster.local:8080
        weight: 100
  
  # AI Assistant Service
  - name: ai-assistant-upstream
    algorithm: round-robin
    healthchecks:
      active:
        http_path: /health
    targets:
      - target: ai-assistant.default.svc.cluster.local:8000
        weight: 100

# =============================================================================
# SERVICES & ROUTES
# =============================================================================

services:
  # -------------------------
  # Projects Service
  # -------------------------
  - name: project-service
    url: http://project-service-upstream
    protocol: http
    connect_timeout: 60000
    write_timeout: 60000
    read_timeout: 60000
    retries: 3
    
    routes:
      - name: projects-list
        methods:
          - GET
        paths:
          - /api/v1/projects
        strip_path: false
        preserve_host: false
      
      - name: projects-detail
        methods:
          - GET
          - PUT
          - PATCH
          - DELETE
        paths:
          - /api/v1/projects/(?<id>[a-f0-9-]+)
        strip_path: false
      
      - name: projects-create
        methods:
          - POST
        paths:
          - /api/v1/projects
        strip_path: false
      
      - name: projects-tasks
        methods:
          - GET
          - POST
          - PUT
          - DELETE
        paths:
          - /api/v1/projects/(?<project_id>[a-f0-9-]+)/tasks
        strip_path: false
    
    plugins:
      # JWT Authentication
      - name: jwt
        config:
          uri_param_names:
            - jwt
          cookie_names:
            - jwt
          claims_to_verify:
            - exp
          key_claim_name: iss
          secret_is_base64: false
      
      # Rate Limiting
      - name: rate-limiting
        config:
          second: 10
          minute: 100
          hour: 5000
          day: 50000
          policy: redis
          fault_tolerant: true
          hide_client_headers: false
          redis:
            host: redis.default.svc.cluster.local
            port: 6379
            database: 0
            timeout: 2000
      
      # Circuit Breaker
      - name: circuit-breaker
        config:
          threshold: 50  # 50% error rate
          window_size: 60  # за 60 секунд
          min_calls: 10  # минимум 10 вызовов
      
      # Request Size Limiting
      - name: request-size-limiting
        config:
          allowed_payload_size: 10  # 10 MB

  # -------------------------
  # Budget Service
  # -------------------------
  - name: budget-service
    url: http://budget-service-upstream
    
    routes:
      - name: budgets-api
        methods:
          - GET
          - POST
          - PUT
          - PATCH
          - DELETE
        paths:
          - /api/v1/budgets
          - /api/v1/budgets/(?<id>[a-f0-9-]+)
          - /api/v1/budgets/(?<budget_id>[a-f0-9-]+)/categories
          - /api/v1/budgets/(?<budget_id>[a-f0-9-]+)/expenses
        strip_path: false
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100
          hour: 5000
          policy: redis
          redis:
            host: redis.default.svc.cluster.local
      - name: circuit-breaker
      
      # Request Transformer (добавить organization_id из JWT)
      - name: request-transformer
        config:
          add:
            headers:
              - X-Organization-ID:$(claims.organization_id)
              - X-User-ID:$(claims.sub)

  # -------------------------
  # Construction Service
  # -------------------------
  - name: construction-service
    url: http://construction-service.default.svc.cluster.local:8080
    
    routes:
      - name: construction-api
        paths:
          - /api/v1/construction
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100

  # -------------------------
  # Space Planning Service
  # -------------------------
  - name: space-planning-service
    url: http://space-planning.default.svc.cluster.local:8080
    
    routes:
      - name: space-planning-api
        paths:
          - /api/v1/space-planning
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100
      
      # Space planning может отдавать большие файлы (чертежи)
      - name: request-size-limiting
        config:
          allowed_payload_size: 50  # 50 MB

  # -------------------------
  # Participants Service
  # -------------------------
  - name: participants-service
    url: http://participants.default.svc.cluster.local:8080
    
    routes:
      - name: participants-api
        paths:
          - /api/v1/participants
          - /api/v1/tickets
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 200  # больше для CRM

  # -------------------------
  # File Storage Service
  # -------------------------
  - name: file-storage-service
    url: http://file-storage.default.svc.cluster.local:8080
    
    routes:
      - name: file-upload
        methods:
          - POST
        paths:
          - /api/v1/files
      
      - name: file-download
        methods:
          - GET
        paths:
          - /api/v1/files/(?<file_id>[a-f0-9-]+)
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 50  # меньше для file uploads
      
      # Большие файлы
      - name: request-size-limiting
        config:
          allowed_payload_size: 100  # 100 MB
      
      # Response transformer для signed URLs
      - name: response-transformer
        config:
          add:
            headers:
              - X-File-Expires:3600

  # -------------------------
  # Search Service
  # -------------------------
  - name: search-service
    url: http://search.default.svc.cluster.local:8080
    
    routes:
      - name: search-api
        methods:
          - GET
          - POST
        paths:
          - /api/v1/search
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 200
      
      # Caching для search results
      - name: proxy-cache
        config:
          strategy: memory
          cache_ttl: 300  # 5 минут
          content_type:
            - application/json
          memory:
            dictionary_name: kong_cache

  # -------------------------
  # AI Document Generation (Python)
  # -------------------------
  - name: ai-document-gen
    url: http://ai-document-gen.default.svc.cluster.local:8000
    
    routes:
      - name: ai-documents-api
        paths:
          - /api/v1/ai/documents
    
    plugins:
      - name: jwt
      
      # Строгий rate limiting для AI
      - name: rate-limiting
        config:
          minute: 10  # AI дорого
          hour: 50
          policy: redis
          redis:
            host: redis.default.svc.cluster.local
      
      # Большие timeouts для AI
      - name: request-timeout
        config:
          http_timeout: 120000  # 2 минуты
      
      - name: request-size-limiting
        config:
          allowed_payload_size: 5

  # -------------------------
  # AI Assistant (Chat)
  # -------------------------
  - name: ai-assistant
    url: http://ai-assistant.default.svc.cluster.local:8000
    
    routes:
      - name: ai-chat-api
        paths:
          - /api/v1/ai/chat
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 20
          hour: 100
      
      # WebSocket support
      - name: request-termination
        enabled: false  # не блокировать WebSocket

  # -------------------------
  # Analytics Service
  # -------------------------
  - name: analytics-service
    url: http://analytics.default.svc.cluster.local:8000
    
    routes:
      - name: analytics-api
        paths:
          - /api/v1/analytics
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 50
      
      # Caching для dashboards
      - name: proxy-cache
        config:
          cache_ttl: 60  # 1 минута

  # -------------------------
  # Notification Service
  # -------------------------
  - name: notification-service
    url: http://notifications.default.svc.cluster.local:8080
    
    routes:
      - name: notifications-api
        paths:
          - /api/v1/notifications
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100

  # -------------------------
  # Logistics Service
  # -------------------------
  - name: logistics-service
    url: http://logistics.default.svc.cluster.local:8000
    
    routes:
      - name: logistics-api
        paths:
          - /api/v1/exhibits
          - /api/v1/logistics
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100

  # -------------------------
  # Reporting Service
  # -------------------------
  - name: reporting-service
    url: http://reporting.default.svc.cluster.local:8000
    
    routes:
      - name: reports-api
        paths:
          - /api/v1/reports
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 30  # reports дорогие
      
      # Большие timeouts для генерации отчетов
      - name: request-timeout
        config:
          http_timeout: 300000  # 5 минут

  # -------------------------
  # Integration Service (1C, etc.)
  # -------------------------
  - name: integration-service
    url: http://integration.default.svc.cluster.local:8000
    
    routes:
      - name: integrations-api
        paths:
          - /api/v1/integrations
    
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 50

# =============================================================================
# CONSUMERS (для JWT)
# =============================================================================

consumers:
  - username: exponat-frontend
    custom_id: frontend-app
    jwt_secrets:
      - key: exponat-jwt-key
        algorithm: HS256
        secret: ${JWT_SECRET}  # from env variable
```

### infrastructure/kong/kong-values.yaml

Helm values для Kubernetes deployment:

```yaml
# Kong Helm Chart values
image:
  repository: kong
  tag: "3.5"

env:
  # DB-less mode (конфигурация из файла)
  database: "off"
  
  # Declarative config
  declarative_config: /kong/kong.yml
  
  # Logging
  proxy_access_log: /dev/stdout
  admin_access_log: /dev/stdout
  proxy_error_log: /dev/stderr
  admin_error_log: /dev/stderr
  
  # Nginx settings
  nginx_worker_processes: "4"
  nginx_worker_connections: "10000"
  
  # Environment
  KONG_ENV: production

# Replicas для HA
replicaCount: 3

# Anti-affinity (разные ноды)
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - kong
          topologyKey: kubernetes.io/hostname

# Resources
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 2000m
    memory: 2Gi

# Health checks
readinessProbe:
  httpGet:
    path: /status
    port: 8001
  initialDelaySeconds: 5
  periodSeconds: 10

livenessProbe:
  httpGet:
    path: /status
    port: 8001
  initialDelaySeconds: 15
  periodSeconds: 20

# Service
service:
  type: LoadBalancer
  annotations:
    # Yandex Cloud Load Balancer
    yandex.cloud/load-balancer-type: external
    yandex.cloud/subnet-id: ${SUBNET_ID}

# Ingress Controller (опционально)
ingressController:
  enabled: true
  installCRDs: true

# Prometheus metrics
serviceMonitor:
  enabled: true
  interval: 30s

# ConfigMap с kong.yml
configMap:
  enabled: true
  data:
    kong.yml: |
      # содержимое kong.yml файла выше

# Secrets
secretVolumes:
  - jwt-secret

# Plugins
plugins:
  configMaps: []
```

### infrastructure/kong/docker-compose.kong.yml

Для локальной разработки:

```yaml
version: '3.8'

services:
  kong:
    image: kong:3.5
    container_name: kong
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: "0.0.0.0:8001, 0.0.0.0:8444 ssl"
      JWT_SECRET: ${JWT_SECRET:-dev-secret-key-change-in-production}
    ports:
      - "8000:8000"  # Proxy HTTP
      - "8443:8443"  # Proxy HTTPS
      - "8001:8001"  # Admin API HTTP
      - "8444:8444"  # Admin API HTTPS
    volumes:
      - ./kong.yml:/kong/kong.yml:ro
    networks:
      - exponat-network
    restart: unless-stopped
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    container_name: kong-redis
    ports:
      - "6379:6379"
    networks:
      - exponat-network
    restart: unless-stopped

networks:
  exponat-network:
    external: true  # должна быть создана заранее
```

### docs/kong-setup.md

```markdown
# Kong Gateway Setup Guide

## Локальная разработка

### 1. Запустить Kong

\`\`\`bash
cd infrastructure/kong
docker-compose -f docker-compose.kong.yml up -d
\`\`\`

### 2. Проверить статус

\`\`\`bash
curl http://localhost:8001/status
\`\`\`

### 3. Протестировать API

\`\`\`bash
# Получить JWT token (через Keycloak)
TOKEN="eyJ..."

# Запрос через Kong
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/projects
\`\`\`

## Production Deployment

### 1. Deploy Kong в Kubernetes

\`\`\`bash
# Создать namespace
kubectl create namespace kong

# Создать secret для JWT
kubectl create secret generic jwt-secret \
  --from-literal=secret=$(openssl rand -base64 32) \
  -n kong

# Install через Helm
helm repo add kong https://charts.konghq.com
helm repo update

helm install kong kong/kong \
  -f infrastructure/kong/kong-values.yaml \
  -n kong
\`\`\`

### 2. Проверить deployment

\`\`\`bash
kubectl get pods -n kong
kubectl logs -f deployment/kong -n kong
\`\`\`

### 3. Получить Load Balancer IP

\`\`\`bash
kubectl get svc kong-proxy -n kong
# EXTERNAL-IP будет IP вашего LB
\`\`\`

### 4. Настроить DNS

\`\`\`
api.exponat.ru → <EXTERNAL-IP>
\`\`\`

## Мониторинг

### Prometheus Metrics

Kong автоматически экспортирует метрики:

\`\`\`
http://<kong-admin>:8001/metrics
\`\`\`

### Grafana Dashboard

Импортировать официальный dashboard:
- Dashboard ID: 7424 (Kong Official)

## Обновление конфигурации

### GitOps workflow:

1. Обновить \`kong.yml\`
2. Commit в Git
3. ArgoCD автоматически применит изменения
4. Или вручную:

\`\`\`bash
kubectl apply -f infrastructure/kong/kong.yml
kubectl rollout restart deployment/kong -n kong
\`\`\`

## Troubleshooting

### Проверить конфигурацию

\`\`\`bash
docker run --rm -v $(pwd)/kong.yml:/kong.yml kong:3.5 \
  kong config parse /kong.yml
\`\`\`

### Логи

\`\`\`bash
kubectl logs -f deployment/kong -n kong
\`\`\`

### Admin API

\`\`\`bash
kubectl port-forward svc/kong-admin 8001:8001 -n kong
curl http://localhost:8001/status
\`\`\`
\`\`\`

## 3. Обновить Frontend API Client

Обновить базовый URL в frontend:

### web/src/shared/api/client.ts

```typescript
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,  // Kong Gateway URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (добавить JWT)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor (обработать ошибки)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    
    if (error.response?.status === 429) {
      // Rate limit exceeded
      console.error('Too many requests. Please slow down.')
    }
    
    return Promise.reject(error)
  }
)
```

### .env.example

```bash
# Kong Gateway URL
NEXT_PUBLIC_API_URL=http://localhost:8000  # dev
# NEXT_PUBLIC_API_URL=https://api.exponat.ru  # production
```

## 4. Обновить CI/CD

### .github/workflows/deploy-staging.yml

Добавить deployment Kong перед backend services:

```yaml
- name: Deploy Kong Gateway
  run: |
    helm upgrade --install kong kong/kong \
      -f infrastructure/kong/kong-values.yaml \
      -n kong \
      --create-namespace \
      --wait

- name: Deploy Backend Services
  run: |
    # существующий deployment
```

## 5. Обновить документацию

Обновить следующие файлы:

### README.md

Добавить секцию:

```markdown
## API Gateway

Используется Kong Gateway (Open Source).

### Локальная разработка

\`\`\`bash
cd infrastructure/kong
docker-compose -f docker-compose.kong.yml up -d
\`\`\`

Kong доступен на:
- Proxy: http://localhost:8000
- Admin API: http://localhost:8001

См. [docs/kong-setup.md](docs/kong-setup.md) для деталей.
```

### ARCHITECTURE.md

Уже обновлён с секцией про Kong Gateway.

## 6. Тестирование

После настройки Kong, протестируй все endpoints:

```bash
# Health check
curl http://localhost:8000/api/v1/projects/health

# With auth
TOKEN="eyJ..."
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/projects

# Rate limiting (должен вернуть 429 после 100 req/min)
for i in {1..150}; do
  curl http://localhost:8000/api/v1/projects
done
```

## ТРЕБОВАНИЯ

### Kong Configuration
- ✅ Декларативная конфигурация (kong.yml в Git)
- ✅ Все сервисы настроены (Projects, Budget, AI, etc.)
- ✅ JWT authentication для всех routes
- ✅ Rate limiting (разные лимиты для разных сервисов)
- ✅ CORS настроен
- ✅ Health checks для upstreams
- ✅ Circuit breaker
- ✅ Prometheus metrics
- ✅ Structured logging

### Kubernetes Deployment
- ✅ Helm chart для Kong
- ✅ 3 replicas (HA)
- ✅ Anti-affinity (разные ноды)
- ✅ Resource limits
- ✅ Health checks (liveness + readiness)
- ✅ ServiceMonitor для Prometheus

### Local Development
- ✅ docker-compose для Kong
- ✅ Подключение к локальным services
- ✅ Простой запуск (один docker-compose up)

### Documentation
- ✅ kong-setup.md с инструкциями
- ✅ README.md обновлён
- ✅ ARCHITECTURE.md обновлён

Создай всю инфраструктуру Kong Gateway полностью. Используй Agent mode для создания всех файлов сразу.
```

---

## ПОСЛЕ ВЫПОЛНЕНИЯ

### Checklist:

```bash
cd exponat

# ✅ Kong конфигурация создана
ls infrastructure/kong/
cat infrastructure/kong/kong.yml

# ✅ Локальный запуск работает
cd infrastructure/kong
docker-compose -f docker-compose.kong.yml up -d
curl http://localhost:8001/status

# ✅ Проверить route
curl http://localhost:8000/api/v1/projects/health

# ✅ Frontend обновлён
cat web/src/shared/api/client.ts

# ✅ Документация обновлена
cat docs/kong-setup.md
```

### Deploy в K8s:

```bash
# Создать namespace
kubectl create namespace kong

# Install Kong
helm install kong kong/kong \
  -f infrastructure/kong/kong-values.yaml \
  -n kong \
  --create-namespace

# Проверить
kubectl get pods -n kong
kubectl logs -f deployment/kong -n kong
```

### Тестирование:

```bash
# Получить JWT token
TOKEN=$(curl -X POST https://auth.exponat.ru/token \
  -d "username=test&password=test" | jq -r .access_token)

# Запрос через Kong
curl -H "Authorization: Bearer $TOKEN" \
  https://api.exponat.ru/api/v1/projects

# Должен работать!
```

---

## КРАТКАЯ ВЕРСИЯ (МИНИМАЛИСТИЧНАЯ)

Если нужна ещё более короткая версия:

```
@Codebase
Замени custom Go API Gateway на Kong Gateway.

Создай:
1. infrastructure/kong/kong.yml - декларативная конфигурация всех services
2. infrastructure/kong/kong-values.yaml - Helm values для K8s
3. infrastructure/kong/docker-compose.kong.yml - для локальной разработки
4. docs/kong-setup.md - инструкции

Kong должен:
- Роутить все API запросы к сервисам (Projects, Budget, AI, etc.)
- JWT authentication (через Keycloak)
- Rate limiting (100 req/min для обычных API, 20 для AI)
- CORS
- Health checks
- Prometheus metrics
- Circuit breaker

Обнови frontend API client чтобы использовал Kong URL.

Agent mode, создай всё сразу.
```
