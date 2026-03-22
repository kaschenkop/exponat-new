# Keycloak — настройка и локальная разработка

## Зачем

Централизованная аутентификация (OIDC/OAuth2), SSO, MFA и роли — через **Keycloak**. Фронтенд использует **NextAuth.js** с провайдером Keycloak; бэкенд (например, `projects`) валидирует **access token** по **JWKS** (`OIDC_ISSUER` или `JWT_JWKS_URL`).

## Локальный запуск Keycloak

Порт **8090** на хосте (чтобы не конфликтовать с `dashboard` на **8080** в корневом `docker-compose`).

Keycloak описан в **корневом** `docker-compose.yml` (`postgres-keycloak`, `keycloak`). Поднимается вместе со стеком:

```bash
docker compose up -d
```

Только Keycloak без остальных сервисов:

```bash
docker compose -f infrastructure/keycloak/docker-compose.keycloak.yml up -d
```
(удобно запускать из каталога `infrastructure/keycloak`.)

- Админ-консоль: http://localhost:8090  
- Логин: `admin` / `admin_password_change_me` (смените в проде)

Realm `exponat-development` подхватывается из `infrastructure/keycloak/realm-export.json` при первом импорте (пустой том БД). Если realm уже есть — при необходимости сделайте **Partial import** в консоли или удалите том `keycloak_postgres_data`.

**Issuer для клиентов:**

```text
http://localhost:8090/realms/exponat-development
```

## Веб-приложение (`web/`)

1. Скопируйте `web/.env.local.example` → `.env.local`.
2. Задайте **`NEXTAUTH_SECRET`** (например: `openssl rand -base64 32`). Без него NextAuth отдаёт **500** на `/api/auth/session` и в консоли браузера `CLIENT_FETCH_ERROR`. В режиме `development` используется небезопасный встроенный fallback в коде — для продакшена секрет обязателен.
3. Укажите `KEYCLOAK_ISSUER` как выше (локально: `http://localhost:8090/realms/exponat-development`).
4. Для публичного клиента `exponat-web` поле **Client secret** в Keycloak может быть пустым; если создали confidential client — вставьте `KEYCLOAK_CLIENT_SECRET`.

Запуск:

```bash
cd web && npm run dev
```

Вход: http://localhost:3000/ru/login → «Войти через Keycloak». Тестовый пользователь из импорта: `admin@exponat.site` / `admin123`.

### Продакшен (DNS: **exponat.site**)

- Фронт: `https://exponat.site` → `NEXTAUTH_URL=https://exponat.site`
- Keycloak: `https://auth.exponat.site` → `KEYCLOAK_ISSUER=https://auth.exponat.site/realms/<realm>`
- API (Kong): `https://api.exponat.site` (см. Helm `values-production.yaml`)
- Staging: `https://staging.exponat.site`, API `https://api.staging.exponat.site`

## Сервис `projects` (Go)

При включённой проверке JWT (без `SKIP_AUTH=true`):

- Задайте **`OIDC_ISSUER`** (тот же issuer) **или** полный URL **`JWT_JWKS_URL`** на endpoint `.../protocol/openid-connect/certs`.
- Токен в заголовке `Authorization: Bearer <access_token>` (тот же, что выдаёт Keycloak для `exponat-web`).

Локально в Docker по умолчанию остаётся `SKIP_AUTH=true` для простоты; для проверки Keycloak выставьте `SKIP_AUTH=false` и передайте `OIDC_ISSUER`.

## Kong Gateway

JWT для Keycloak подписан **RS256**; ротация ключей через JWKS. В Kong OSS нет «подключения JWKS» одной строкой как у приложения — валидацию токена выполняют **upstream-сервисы** (Go/Python) или отдельные плагины/Enterprise. Глобальный плагин `jwt` в `kong.yml` с фиксированным секретом **не** подставляется вместо проверки Keycloak; см. комментарии в `infrastructure/kong/kong.yml`.

## Kubernetes

Шаблон Helm values: `infrastructure/keycloak/keycloak-values.yaml` (подставьте секреты, ingress, образ). Рекомендуется отдельный namespace `auth` и TLS для `auth.exponat.site`.
