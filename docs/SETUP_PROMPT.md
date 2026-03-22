# ПРОМПТ: НАСТРОЙКА ПРОЕКТА ЭКСПОНАТ

Используй этот промпт в Cursor Composer (Agent mode) для автоматической настройки проекта.

---

## ПРОМПТ ДЛЯ CURSOR

```
Настрой проект Экспонат согласно всем правилам и архитектуре.

# КОНТЕКСТ
Проект: SaaS-платформа "Экспонат" для управления выставками
Директория: exponat/ (уже существует)

# ДОКУМЕНТАЦИЯ В ПРОЕКТЕ
@File exponat/.cursorrules
@File exponat/GITOPS_RULES.md

# ЗАДАЧИ

## 1. Git Setup

Создай и настрой:
```
exponat/
├── .gitignore                        # Полный gitignore
├── .env.example                      # Template env variables
├── .github/
│   ├── workflows/
│   │   ├── frontend-ci.yml           # Lint, test, build, lighthouse
│   │   ├── backend-go-ci.yml         # Go CI с postgres/redis
│   │   ├── backend-python-ci.yml     # Python CI
│   │   ├── deploy-staging.yml        # Auto deploy on develop push
│   │   └── deploy-production.yml     # Deploy on tag v*.*.*
│   ├── pull_request_template.md      # PR template с checklist
│   └── CODEOWNERS                    # Code review assignments
├── GITOPS_RULES.md                   # GitOps документация
└── README.md                         # Project README
```

### .gitignore content:
```
# Dependencies
node_modules/
*.pyc
__pycache__/
vendor/

# Build outputs
.next/
dist/
build/
out/
coverage/
*.log

# Environment
.env
.env.local
.env.*.local
.env.development
.env.staging
.env.production

# IDEs
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Testing
coverage/
.nyc_output/

# Misc
*.pem
.vercel
```

### .env.example content:
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/exponat_dev
REDIS_URL=redis://localhost:6379

# API
NEXT_PUBLIC_API_URL=http://localhost:8080
API_SECRET_KEY=your-secret-key

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
YANDEX_CLIENT_ID=
YANDEX_CLIENT_SECRET=

# 1C Integration
ONEC_API_URL=http://localhost:8081/api
ONEC_USERNAME=
ONEC_PASSWORD=

# AI/LLM
OPENAI_API_KEY=
YANDEXGPT_API_KEY=

# File Storage
S3_BUCKET=exponat-uploads
S3_REGION=ru-central1
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Monitoring
SENTRY_DSN=
```

## 2. Frontend Setup (web/)

Создай структуру Next.js проекта:
```
exponat/web/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── (auth)/
│   │       ├── (dashboard)/
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── features/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── budget/
│   │   ├── logistics/
│   │   ├── construction/
│   │   ├── space-planning/
│   │   ├── participants/
│   │   ├── ai-assistant/
│   │   ├── analytics/
│   │   └── auth/
│   ├── shared/
│   │   ├── ui/
│   │   ├── lib/
│   │   │   └── utils.ts          # cn() function
│   │   ├── hooks/
│   │   ├── types/
│   │   └── config/
│   ├── widgets/
│   │   ├── sidebar/
│   │   └── header/
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── ru.json
│   │   │   └── en.json
│   │   └── config.ts
│   └── styles/
│       └── globals.css
├── public/
├── .cursorrules                    # Copy from root
├── .eslintrc.json
├── .prettierrc
├── components.json                 # shadcn/ui config
├── next.config.js
├── tailwind.config.ts              # С Exponat Design System
├── tsconfig.json                   # Strict mode + path aliases
├── package.json
├── Dockerfile
└── .dockerignore
```

### package.json scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "prepare": "husky install"
  }
}
```

### tsconfig.json с path aliases:
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/widgets/*": ["./src/widgets/*"],
      "@/app/*": ["./src/app/*"],
      "@/i18n/*": ["./src/i18n/*"]
    }
  }
}
```

### tailwind.config.ts с Exponat Design System:
```typescript
const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          // ... оттенки
        },
        secondary: {
          DEFAULT: '#8B5CF6',
        },
      },
      fontFamily: {
        display: ['Cal Sans', 'sans-serif'],
        body: ['Onest', 'Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### Создать базовые компоненты в shared/ui:
- Button
- Input
- Dialog
- Card
- Toast
- Skeleton

Используй shadcn/ui CLI:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input dialog card toast skeleton
```

### i18n/locales/ru.json:
```json
{
  "common": {
    "save": "Сохранить",
    "cancel": "Отмена",
    "delete": "Удалить",
    "edit": "Редактировать",
    "create": "Создать"
  },
  "nav": {
    "dashboard": "Дашборд",
    "projects": "Проекты",
    "budget": "Бюджет",
    "logistics": "Логистика",
    "construction": "Строительство",
    "spacePlanning": "Планирование пространства",
    "participants": "Участники",
    "aiAssistant": "AI-ассистент",
    "analytics": "Аналитика",
    "settings": "Настройки"
  }
}
```

## 3. Backend Setup (backend/)

Создай структуру для микросервисов:
```
exponat/backend/
├── services/
│   ├── api-gateway/              # Go
│   │   ├── cmd/
│   │   │   └── main.go
│   │   ├── internal/
│   │   │   ├── handlers/
│   │   │   ├── middleware/
│   │   │   └── config/
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── .dockerignore
│   ├── projects/                 # Go
│   ├── budget/                   # Go
│   ├── ai-document-gen/          # Python
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── ...
└── shared/
    ├── go/                       # Shared Go libs
    └── python/                   # Shared Python libs
```

## 4. Infrastructure Setup (infrastructure/)

```
exponat/infrastructure/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   └── modules/
├── kubernetes/
│   ├── base/
│   │   ├── deployments/
│   │   ├── services/
│   │   └── configmaps/
│   └── overlays/
│       ├── development/
│       ├── staging/
│       └── production/
└── helm/
    └── exponat/
        ├── Chart.yaml
        ├── values.yaml
        ├── values-staging.yaml
        ├── values-production.yaml
        └── templates/
```

## 5. Husky Setup (Pre-commit hooks)

```bash
cd exponat/web
npm install -D husky lint-staged
npx husky init
```

### .husky/pre-commit:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

cd web
npx lint-staged
```

### package.json:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 6. Docker Setup

### web/Dockerfile:
```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml (для локальной разработки):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: exponat_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

volumes:
  postgres_data:
  mongo_data:
```

## 7. Documentation

### README.md:
```markdown
# Экспонат (Exponat)

SaaS-платформа для управления выставками

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Go 1.22+
- Python 3.11+
- Docker & Docker Compose

### Development
\`\`\`bash
# Clone
git clone https://github.com/your-org/exponat.git
cd exponat

# Setup environment
cp .env.example .env.local

# Start services
docker-compose up -d

# Frontend
cd web
npm install
npm run dev

# Backend
cd backend/services/api-gateway
go run cmd/main.go
\`\`\`

## 📚 Documentation
- [Architecture](docs/architecture/)
- [GitOps Rules](GITOPS_RULES.md)
- [Code Style](.cursorrules)

## 🤝 Contributing
1. Read [GITOPS_RULES.md](GITOPS_RULES.md)
2. Create feature branch: \`git checkout -b feature/my-feature\`
3. Commit: \`git commit -m "feat(scope): description"\`
4. Push & create PR

## 📝 License
Proprietary
```

## ТРЕБОВАНИЯ

### Code Style
- ✅ Следуй `.cursorrules` строго
- ✅ TypeScript strict mode
- ✅ Conventional Commits
- ✅ Feature-Sliced Design
- ✅ NO CSS modules, только Tailwind
- ✅ i18n для всех текстов

### Git Workflow
- ✅ Git Flow (main, develop, feature/*, etc.)
- ✅ Conventional Commits обязательно
- ✅ PR template с checklist
- ✅ Code review обязателен
- ✅ CI/CD на GitHub Actions

### CI/CD
- ✅ Lint, type-check, tests на каждый PR
- ✅ Auto deploy to staging на push в develop
- ✅ Production deploy на git tag v*.*.*
- ✅ Lighthouse CI для performance
- ✅ Coverage reports

Создай всю структуру и конфигурацию. Используй Agent mode для создания всех файлов сразу.
```

---

## ПОСЛЕ ВЫПОЛНЕНИЯ ПРОМПТА

### Проверь что создано:

```bash
cd exponat

# 1. Git setup
ls -la .github/workflows/
cat .gitignore
cat .env.example

# 2. Frontend
cd web
cat package.json
cat tsconfig.json
cat tailwind.config.ts
ls -la src/

# 3. Backend
cd ../backend/services
ls -la

# 4. Husky
cd ../../web
npm run prepare

# 5. Commit
git status
git add .
git commit -m "chore: initial project setup with GitOps rules"
```

### Запусти проверки:

```bash
cd web

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Tests
npm run test
```

### Запусти локально:

```bash
# Services
docker-compose up -d

# Frontend
cd web
npm run dev
# Открой http://localhost:3000

# Backend
cd ../backend/services/api-gateway
go run cmd/main.go
# API на http://localhost:8080
```

---

## АЛЬТЕРНАТИВНЫЙ КРАТКИЙ ПРОМПТ

Если нужен еще более короткий вариант:

```
@Codebase
Создай структуру проекта Экспонат согласно:
- .cursorrules (code style)
- GITOPS_RULES.md (git workflow)
- Exponat архитектура (Feature-Sliced Design)

Создай:
1. Git: .gitignore, .env.example, GitHub Actions workflows
2. Frontend: Next.js 14 структура с i18n, shadcn/ui
3. Backend: Go/Python сервисы структура
4. Docker: Dockerfile, docker-compose.yml
5. Husky: pre-commit hooks
6. Docs: README.md

Следуй всем правилам строго. Agent mode.
```

---

**Используй в Cursor → Composer (Cmd/Ctrl + I) → Agent mode**
