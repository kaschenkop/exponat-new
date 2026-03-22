# Keycloak — настройка и локальная разработка

## Зачем

Централизованная аутентификация (OIDC/OAuth2), SSO, MFA и роли — через **Keycloak**. Фронтенд использует **NextAuth.js** с провайдером Keycloak; бэкенд (например, `projects`) валидирует **access token** по **JWKS** (`OIDC_ISSUER` или `JWT_JWKS_URL`).

## Локальный запуск Keycloak

Порт **8090** на хосте (чтобы не конфликтовать с `dashboard` на **8080** в корневом `docker-compose`).

```bash
docker compose -f infrastructure/keycloak/docker-compose.keycloak.yml up -d
```

- Админ-консоль: http://localhost:8090  
- Логин: `admin` / `admin_password_change_me` (смените в проде)

Realm `exponat-development` подхватывается из `infrastructure/keycloak/realm-export.json` при первом импорте (пустой том БД). Если realm уже есть — при необходимости сделайте **Partial import** в консоли или удалите том `keycloak_postgres_data`.

**Issuer для клиентов:**

```text
http://localhost:8090/realms/exponat-development
```

## Веб-приложение (`web/`)

1. Скопируйте `web/.env.local.example` → `.env.local`.
2. Задайте `NEXTAUTH_SECRET` (например: `openssl rand -base64 32`).
3. Укажите `KEYCLOAK_ISSUER` как выше.
4. Для публичного клиента `exponat-web` поле **Client secret** в Keycloak может быть пустым; если создали confidential client — вставьте `KEYCLOAK_CLIENT_SECRET`.

Запуск:

```bash
cd web && npm run dev
```

Вход: http://localhost:3000/ru/login → «Войти через Keycloak». Тестовый пользователь из импорта: `admin@exponat.ru` / `admin123`.

## Сервис `projects` (Go)

При включённой проверке JWT (без `SKIP_AUTH=true`):

- Задайте **`OIDC_ISSUER`** (тот же issuer) **или** полный URL **`JWT_JWKS_URL`** на endpoint `.../protocol/openid-connect/certs`.
- Токен в заголовке `Authorization: Bearer <access_token>` (тот же, что выдаёт Keycloak для `exponat-web`).

Локально в Docker по умолчанию остаётся `SKIP_AUTH=true` для простоты; для проверки Keycloak выставьте `SKIP_AUTH=false` и передайте `OIDC_ISSUER`.

## Kong Gateway

JWT для Keycloak подписан **RS256**; ротация ключей через JWKS. В Kong OSS нет «подключения JWKS» одной строкой как у приложения — валидацию токена выполняют **upstream-сервисы** (Go/Python) или отдельные плагины/Enterprise. Глобальный плагин `jwt` в `kong.yml` с фиксированным секретом **не** подставляется вместо проверки Keycloak; см. комментарии в `infrastructure/kong/kong.yml`.

## Kubernetes

Шаблон Helm values: `infrastructure/keycloak/keycloak-values.yaml` (подставьте секреты, ingress, образ). Рекомендуется отдельный namespace `auth` и TLS для `auth.exponat.ru`.
