# Экспонат — веб-клиент (`exponat-web`)

Next.js 14 (App Router), TypeScript strict, Tailwind, next-intl (ru/en), shadcn-паттерн в `src/shared/ui`, FSD: `features/`, `shared/`, `widgets/`, `app/`.

## Локализация

- По умолчанию: русский (`/ru/...`).
- Английский: `/en/...`.
- Тексты: `src/i18n/locales/*.json`.
- На страницах с `getTranslations` используйте `initPageLocale(params.locale)` из `@/i18n/server` (нужно для SSG).

## Запуск через Docker Compose (корень репозитория)

Сервис `web` в `docker-compose.yml` **не** монтирует исходники: в контейнер попадает уже собранный `next build`. После любых изменений в `web/` пересоберите и поднимите сервис:

```bash
docker compose build web --no-cache && docker compose up -d web
```

Короче: `docker compose up -d --build web`. Без пересборки вы будете видеть старую UI из предыдущего образа.

Для разработки с hot reload удобнее запускать Next локально: `cd web && npm run dev` (порт 3000), а в Docker оставить только API/Kong/Keycloak.

## Переменные окружения

Скопируйте `.env.local.example` в `.env.local` и при необходимости задайте `NEXT_PUBLIC_API_BASE_URL`.

## Husky / lint-staged

После `git init` в корне репозитория pre-commit запускает `lint-staged` (Prettier + ESLint для staged файлов).
