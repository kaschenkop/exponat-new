# Экспонат — веб-клиент (`exponat-web`)

Next.js 14 (App Router), TypeScript strict, Tailwind, next-intl (ru/en), shadcn-паттерн в `src/shared/ui`, FSD: `features/`, `shared/`, `widgets/`, `app/`.

## Локализация

- По умолчанию: русский (`/ru/...`).
- Английский: `/en/...`.
- Тексты: `src/i18n/locales/*.json`.
- На страницах с `getTranslations` используйте `initPageLocale(params.locale)` из `@/i18n/server` (нужно для SSG).

## Переменные окружения

Скопируйте `.env.local.example` в `.env.local` и при необходимости задайте `NEXT_PUBLIC_API_BASE_URL`.

## Husky / lint-staged

После `git init` в корне репозитория pre-commit запускает `lint-staged` (Prettier + ESLint для staged файлов).
