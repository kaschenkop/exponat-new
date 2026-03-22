# Kong Gateway

Декларативная конфигурация: [`kong.yml`](kong.yml).

- **Локально:** сервис `kong` описан в **корневом** [`docker-compose.yml`](../../docker-compose.yml) — достаточно `docker compose up -d` в корне репозитория. Отдельный [`docker-compose.kong.yml`](docker-compose.kong.yml) не обязателен (оставлен для совместимости).
- **Kubernetes:** [`kong-values.yaml`](kong-values.yaml) — официальный Helm chart [Kong](https://github.com/Kong/charts).

Проверка YAML:

```bash
docker run --rm -e KONG_DATABASE=off -v "$PWD/kong.yml:/kong/kong.yml:ro" kong:3.5 kong config parse /kong/kong.yml
# из корня репозитория:
# docker run --rm -e KONG_DATABASE=off -v "$PWD/infrastructure/kong/kong.yml:/kong/kong.yml:ro" kong:3.5 kong config parse /kong/kong.yml
```

## Имена хостов

Файл `kong.yml` по умолчанию ориентирован на **Docker Compose** (короткие имена: `projects`, `dashboard`, `budget`, `redis`, …). Сервисы, которых нет в `docker-compose.yml`, дадут ошибки DNS в логах Kong при health check / проксировании.  
Для Kubernetes замените цели upstream и `redis_host` на DNS вида `servicename.namespace.svc.cluster.local` (или используйте отдельный overlay / `deck`).

## Rate limiting

В `kong.yml` для локальной разработки используется **`policy: local`** (счётчики в памяти процесса, без Redis на каждом запросе — иначе возможны многосекундные задержки при сбоях/особенностях сети к Redis). Для **нескольких реплик Kong** в Kubernetes задайте **`policy: redis`** и параметры `redis_host` / `redis_port` и т.д.

## JWT

Плагин JWT настроен с потребителем `exponat-anonymous`: запросы **без** заголовка `Authorization` обрабатываются как анонимные (удобно для dev с `SKIP_AUTH` на бэкенде). Для строгого режима отключите `anonymous` в конфигурации плагина.

Подробности: [docs/kong-setup.md](../../docs/kong-setup.md).
