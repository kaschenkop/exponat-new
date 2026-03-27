# Keycloak — настройка и локальная разработка

## Зачем

Централизованная аутентификация (OIDC/OAuth2), SSO, MFA и роли — через **Keycloak**. Фронтенд использует **NextAuth.js** с провайдером Keycloak (**authorization code + PKCE**, как задано в провайдере NextAuth v4); бэкенд (например, `projects`) валидирует **access token** по **JWKS** (`OIDC_ISSUER` или `JWT_JWKS_URL`).

**Тема входа:** кастомная тема `exponat` лежит в `infrastructure/keycloak/themes/exponat`. В realm задано `loginTheme: exponat` (см. `realm-export.json`). **Локально (docker-compose)** монтирование: `/opt/keycloak/themes/exponat`. **Staging GKE (Bitnami Helm)** — ConfigMap `keycloak-theme-exponat` + initContainer в `infrastructure/keycloak/helm/values-staging-gke.yaml`, путь в поде: `/opt/bitnami/keycloak/themes/exponat`. Без этих файлов Keycloak показывает дефолтную тему Keycloak.

**Если страница входа Keycloak не меняется:**

1. **Импорт realm не обновляет уже существующий realm** — поле Login theme в БД могло остаться прежним. Зайдите в админ-консоль: **Realm settings → Themes → Login theme → `exponat` → Save** (realm `exponat-development`).
2. Перезапустите контейнер Keycloak после правок темы (`docker compose restart keycloak`). В `docker-compose` для dev включено отключение кэша тем (`--spi-theme--cache-themes=false` и т.д.).
3. Убедитесь, что в контейнере есть каталог: `/opt/keycloak/themes/exponat/login/theme.properties` (`docker compose exec keycloak ls -la /opt/keycloak/themes/exponat/login/`).

Заголовок формы регистрации **«Register»** на русской локали: в базовом `messages_ru` Keycloak не хватает ключа `registerTitle`, поэтому в теме `exponat` добавлен файл `login/messages/messages_ru.properties` с `registerTitle=Регистрация`. После обновления файлов перезапустите Keycloak.

## Локальный запуск Keycloak

Порт **8090** на хосте (чтобы не конфликтовать с `dashboard` на **8080** в корневом `docker-compose`).

Keycloak описан в **корневом** `docker-compose.yml` (сервис `keycloak`; БД `keycloak` в том же Postgres, что и приложение — см. `migrations/initdb/000_keycloak_database.sql`). Поднимается вместе со стеком:

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

Страницы входа и регистрации для realm `exponat-development` на **русском**: в экспорте включены `internationalizationEnabled`, `defaultLocale: ru`, `supportedLocales: [ru]`. Если realm уже создан раньше — в консоли: **Realm settings → Localization → Internationalization ON**, язык по умолчанию **Russian**, в списке поддерживаемых оставьте **ru** (или выполните partial import / пересоздайте realm).

Realm `exponat-development` подхватывается из `infrastructure/keycloak/realm-export.json` при первом импорте (пустой том БД Keycloak). Если realm уже есть — при необходимости сделайте **Partial import** в консоли или удалите том `exponat_pgdata` / пересоздайте БД `keycloak` (для отдельного compose — том `keycloak_postgres_data`).

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

Вход: http://localhost:3000/ru/login → «Войти по логину» (форма Keycloak), либо кнопки **Яндекс** / **ВКонтакте** (см. ниже). Тестовый пользователь из импорта: `admin@exponat.site` / `admin123`.

### Яндекс и ВКонтакте (брокеры в Keycloak)

Кнопки на странице входа приложения передают в Keycloak параметр **`kc_idp_hint`** — в Keycloak должны быть заведены провайдеры с **алиасами ровно `yandex` и `vk`** (регистр как в UI).

1. Админ консоль Keycloak → realm `exponat-development` → **Identity providers** → **Add provider**.
2. Для Яндекса: тип **OpenID Connect** (или OAuth2 по [документации Яндекса](https://yandex.ru/dev/id/doc/ru/)). Поле **Alias**: `yandex`. Client ID и Secret — из приложения OAuth в [Яндекс OAuth](https://oauth.yandex.ru/client/new). **Redirect URI** в кабинете Яндекса задайте как  
   `http://localhost:8090/realms/exponat-development/broker/yandex/endpoint`  
   (для продакшена замените хост Keycloak на `https://auth.<ваш-домен>`).
3. Для VK: в Keycloak часто используют тип **VK** (если есть) или **OAuth 2.0** по [документации VK](https://dev.vk.com/ru/api/access-token/authcode-flow-user). **Alias**: `vk`. Redirect URI в настройках приложения VK:  
   `http://localhost:8090/realms/exponat-development/broker/vk/endpoint`.
4. В настройках провайдера включите **Trust email** (по желанию), чтобы не требовать подтверждение email при первом входе.

Пока провайдеры не созданы или алиасы другие, кнопки на фронте приведут к ошибке на стороне Keycloak.

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

Шаблон Helm values: `infrastructure/keycloak/keycloak-values.yaml` (подставьте секреты, ingress, образ). Рекомендуется отдельный namespace `auth` и TLS для `auth.exponat.site`. Тему `exponat` нужно смонтировать в образ аналогично Docker (`/opt/keycloak/themes/exponat`), например через `extraVolumes`/`extraVolumeMounts` в чарте или init-контейнер.
