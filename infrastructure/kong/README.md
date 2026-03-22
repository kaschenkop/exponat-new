# Kong Gateway

Декларативная конфигурация: [`kong.yml`](kong.yml).

- **Локально:** [`docker-compose.kong.yml`](docker-compose.kong.yml) — подключайтесь к сети Compose проекта (`exponat_default`), предварительно подняв основной `docker compose up` в корне репозитория (нужны `redis`, `projects`, `dashboard`).
- **Kubernetes:** [`kong-values.yaml`](kong-values.yaml) — официальный Helm chart [Kong](https://github.com/Kong/charts).

Проверка YAML:

```bash
docker run --rm -e KONG_DATABASE=off -v "$PWD/kong.yml:/kong/kong.yml:ro" kong:3.5 kong config parse /kong/kong.yml
```

## Имена хостов

Файл `kong.yml` по умолчанию ориентирован на **Docker Compose** (короткие имена: `projects`, `dashboard`, `redis`, …).  
Для Kubernetes замените цели upstream и `redis_host` на DNS вида `servicename.namespace.svc.cluster.local` (или используйте отдельный overlay / `deck`).

## JWT

Плагин JWT настроен с потребителем `exponat-anonymous`: запросы **без** заголовка `Authorization` обрабатываются как анонимные (удобно для dev с `SKIP_AUTH` на бэкенде). Для строгого режима отключите `anonymous` в конфигурации плагина.

Подробности: [docs/kong-setup.md](../../docs/kong-setup.md).
