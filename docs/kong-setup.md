# Kong Gateway — настройка

Edge-трафик направляется на **Kong Gateway** (DB-less, декларативный `infrastructure/kong/kong.yml`). Кастомный Go API Gateway удалён из репозитория.

## Локальная разработка

1. Поднимите весь стек в корне репозитория (включая Kong, Redis, Postgres, dashboard, projects, web и др.):

   ```bash
   docker compose up -d
   ```

2. Проверьте Admin API Kong:

   ```bash
   curl http://localhost:8001/status
   ```

3. Фронтенд в образе `web` собирается с единой точкой входа на Kong (`NEXT_PUBLIC_API_BASE_URL` и `NEXT_PUBLIC_PROJECTS_API_URL` = `http://localhost:8000`). Для локального `npm run dev` задайте те же переменные в `web/.env.local`.

   Пути через Kong: dashboard — `/api/dashboard`, projects — `/api/projects`, budget — `/api/v1/budgets` (см. `infrastructure/kong/kong.yml`). Прямые порты без Kong: dashboard `8080`, projects `8081`.

## Kubernetes (Helm)

1. Создайте namespace и ConfigMap с конфигурацией (ключ обязан называться `kong.yml`):

   ```bash
   kubectl create namespace kong --dry-run=client -o yaml | kubectl apply -f -
   kubectl create configmap kong-dbless-config \
     --from-file=kong.yml=./infrastructure/kong/kong.yml \
     -n kong --dry-run=client -o yaml | kubectl apply -f -
   ```

2. Добавьте репозиторий chart и установите Kong:

   ```bash
   helm repo add kong https://charts.konghq.com
   helm repo update
   helm upgrade --install kong kong/kong \
     -f infrastructure/kong/kong-values.yaml \
     -n kong \
     --wait --timeout 10m
   ```

3. Проверьте поды и сервис:

   ```bash
   kubectl get pods -n kong
   kubectl get svc -n kong
   ```

4. При необходимости поправьте `kong.yml` под DNS сервисов кластера (Redis, микросервисы) и обновите ConfigMap, затем перезапустите deployment Kong.

## Метрики и логи

- Prometheus: плагин `prometheus` включён глобально; при включённом `serviceMonitor` в `kong-values.yaml` метрики собирает Prometheus Operator.
- Логи: плагин `file-log` пишет в stdout контейнера.

## Проверка декларативного файла

```bash
docker run --rm -e KONG_DATABASE=off -v "$PWD/infrastructure/kong/kong.yml:/kong/kong.yml:ro" kong:3.5 kong config parse /kong/kong.yml
```

## Troubleshooting

- **401 от Kong:** передан невалидный JWT, а анонимный доступ отключён. Для dev с пустым `Authorization` используется потребитель `exponat-anonymous` (см. `kong.yml`).
- **Redis / rate limiting:** для политики `redis` нужен доступ к Redis по `redis_host` из конфигурации плагина.
