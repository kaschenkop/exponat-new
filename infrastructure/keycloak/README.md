# Keycloak (IAM)

Локальная разработка: отдельный compose-файл, чтобы не занимать порт **8080** (он используется сервисом `dashboard` в корневом `docker-compose.yml`). Keycloak слушает **8090** на хосте.

## Быстрый старт

Keycloak входит в **корневой** `docker-compose.yml` (сервис `keycloak`; одна инстанция Postgres для приложения и Keycloak). Достаточно из корня репозитория:

```bash
docker compose up -d
```

Отдельно только Keycloak (без приложения):

```bash
cd infrastructure/keycloak && docker compose -f docker-compose.keycloak.yml up -d
```

- Админ-консоль: http://localhost:8090 (логин `admin` / `admin_password_change_me`).
- Realm импортируется при первом старте из `realm-export.json` (если том БД пустой). Иначе: **Realm settings → Partial import** или пересоздайте том.

**Issuer для приложений:** `http://localhost:8090/realms/exponat-development`

## Клиенты

| Client ID    | Назначение                          |
|-------------|--------------------------------------|
| `exponat-web` | Next.js (публичный, PKCE)           |
| `exponat-api` | Resource server (bearer-only); роли в токене как client roles |

Тестовый пользователь (из импорта): `admin@exponat.site` / `admin123`, атрибут `organization_id=org-demo`.

## Kubernetes

Шаблон values для Helm (например, chart `codecentric/keycloak`) — `keycloak-values.yaml`. Подставьте секреты, хост `auth.exponat.site` (продакшен DNS), образ `quay.io/keycloak/keycloak:23.0` или новее по политике безопасности.

## См. также

- [docs/keycloak-setup.md](../../docs/keycloak-setup.md)
