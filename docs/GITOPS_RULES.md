# GITOPS RULES - ЭКСПОНАТ (EXPONAT)

## 🎯 ФИЛОСОФИЯ GITOPS

**Git как единственный источник правды** - все изменения инфраструктуры, конфигурации и кода проходят через Git.

**Принципы:**
1. **Declarative** - описываем желаемое состояние, а не шаги для его достижения
2. **Versioned** - вся история изменений в Git
3. **Pulled Automatically** - система сама синхронизируется с Git
4. **Continuously Reconciled** - автоматическое приведение к желаемому состоянию

---

## 📁 СТРУКТУРА РЕПОЗИТОРИЯ

```
exponat/
├── .github/
│   ├── workflows/                    # GitHub Actions CI/CD
│   │   ├── frontend-ci.yml           # Frontend CI
│   │   ├── backend-go-ci.yml         # Go services CI
│   │   ├── backend-python-ci.yml     # Python services CI
│   │   ├── deploy-staging.yml        # Deploy to staging
│   │   └── deploy-production.yml     # Deploy to production
│   ├── CODEOWNERS                    # Code review assignments
│   └── pull_request_template.md      # PR template
│
├── web/                              # Frontend monolith
│   ├── src/
│   ├── .env.example                  # Environment variables template
│   ├── .env.local                    # Local dev (gitignored)
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
│
├── backend/                          # Backend microservices
│   ├── services/
│   │   ├── api-gateway/
│   │   │   ├── cmd/
│   │   │   ├── internal/
│   │   │   ├── Dockerfile
│   │   │   ├── go.mod
│   │   │   └── go.sum
│   │   ├── projects/
│   │   ├── budget/
│   │   └── ...
│   └── shared/                       # Shared libraries
│
├── infrastructure/                   # Infrastructure as Code
│   ├── terraform/                    # Terraform configs
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── modules/
│   │       ├── kubernetes/
│   │       ├── database/
│   │       └── networking/
│   ├── kubernetes/                   # Kubernetes manifests
│   │   ├── base/                     # Base configs
│   │   │   ├── deployments/
│   │   │   ├── services/
│   │   │   ├── configmaps/
│   │   │   └── secrets/
│   │   └── overlays/                 # Environment-specific
│   │       ├── development/
│   │       ├── staging/
│   │       └── production/
│   └── helm/                         # Helm charts
│       └── exponat/
│           ├── Chart.yaml
│           ├── values.yaml
│           ├── values-staging.yaml
│           ├── values-production.yaml
│           └── templates/
│
├── scripts/                          # Automation scripts
│   ├── deploy.sh
│   ├── db-migrate.sh
│   ├── seed-data.sh
│   └── backup.sh
│
├── docs/                             # Documentation
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   └── runbooks/
│
├── docker-compose.yml                # Local development
├── docker-compose.prod.yml           # Production-like local
├── .gitignore
├── .env.example                      # Global env template
└── README.md
```

---

## 🌿 BRANCHING STRATEGY (Git Flow)

### Основные ветки

```
main (production)          # Всегда готова к production deploy
├── develop                # Integration branch
│   ├── feature/*          # Новые фичи
│   ├── bugfix/*           # Исправления багов
│   ├── hotfix/*           # Срочные исправления в production
│   └── release/*          # Релизные ветки
```

### Правила именования веток

#### Feature Branches
```bash
feature/projects-list           # Новая фича
feature/budget-1c-integration   # Интеграция
feature/ai-document-generation  # AI функция

# Формат: feature/{краткое-описание}
# Создается от: develop
# Мержится в: develop
```

#### Bugfix Branches
```bash
bugfix/fix-project-form-validation    # Баг в форме
bugfix/resolve-budget-calculation     # Баг в вычислениях

# Формат: bugfix/{описание-бага}
# Создается от: develop
# Мержится в: develop
```

#### Hotfix Branches
```bash
hotfix/critical-login-error     # Критический баг в production
hotfix/api-timeout-fix          # Срочное исправление API

# Формат: hotfix/{описание-критического-бага}
# Создается от: main
# Мержится в: main И develop
```

#### Release Branches
```bash
release/v1.0.0                  # Релиз версии 1.0.0
release/v1.1.0                  # Релиз версии 1.1.0

# Формат: release/v{major}.{minor}.{patch}
# Создается от: develop
# Мержится в: main И develop
```

### Workflow примеры

#### Создание новой фичи
```bash
# 1. Переключиться на develop и обновить
git checkout develop
git pull origin develop

# 2. Создать feature branch
git checkout -b feature/projects-list

# 3. Разработка с частыми коммитами
git add .
git commit -m "feat(projects): add projects list component"
git commit -m "feat(projects): add filters functionality"
git commit -m "test(projects): add unit tests for ProjectCard"

# 4. Push и создать PR
git push origin feature/projects-list

# 5. После ревью и approve - merge в develop через GitHub/GitLab
# (squash merge рекомендуется для чистой истории)
```

#### Hotfix для production
```bash
# 1. Создать от main
git checkout main
git pull origin main
git checkout -b hotfix/critical-login-error

# 2. Исправить баг
git commit -m "fix(auth): resolve critical login error"

# 3. Создать PR в main
git push origin hotfix/critical-login-error

# 4. После merge в main - также merge в develop
git checkout develop
git merge hotfix/critical-login-error
git push origin develop
```

#### Релиз
```bash
# 1. Создать release branch от develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Обновить версии, финальное тестирование
git commit -m "chore(release): bump version to 1.0.0"
git commit -m "docs(release): update CHANGELOG for v1.0.0"

# 3. Merge в main (создает production deploy)
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# 4. Merge обратно в develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# 5. Удалить release branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

## 📝 COMMIT CONVENTIONS (Conventional Commits)

### Формат коммита

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types (обязательные)

| Type | Описание | Примеры |
|------|----------|---------|
| `feat` | Новая функциональность | `feat(projects): add project creation form` |
| `fix` | Исправление бага | `fix(budget): resolve calculation error` |
| `docs` | Изменения в документации | `docs(api): update API documentation` |
| `style` | Форматирование кода | `style(projects): format with prettier` |
| `refactor` | Рефакторинг | `refactor(auth): simplify login logic` |
| `perf` | Улучшение производительности | `perf(dashboard): optimize stats query` |
| `test` | Добавление/изменение тестов | `test(projects): add unit tests` |
| `build` | Изменения в build системе | `build(deps): update next.js to 14.2` |
| `ci` | Изменения в CI/CD | `ci(github): add staging deploy workflow` |
| `chore` | Другие изменения | `chore(deps): update dependencies` |
| `revert` | Откат изменений | `revert: feat(projects): add project form` |

### Scopes (по модулям)

```
projects         # Projects feature
budget           # Budget feature
logistics        # Logistics feature
construction     # Construction feature
space-planning   # Space planning feature
participants     # Participants feature
ai-assistant     # AI assistant feature
analytics        # Analytics feature
auth             # Authentication
dashboard        # Dashboard
api              # API layer
db               # Database
infra            # Infrastructure
```

### Примеры хороших коммитов

```bash
# ✅ GOOD - Краткое описание с scope
git commit -m "feat(projects): add project creation form"

# ✅ GOOD - С телом для деталей
git commit -m "fix(budget): resolve calculation error

The budget calculation was using wrong exchange rate.
Fixed by using the rate from the database instead of hardcoded value.

Fixes #123"

# ✅ GOOD - Breaking change
git commit -m "feat(api)!: change projects API response structure

BREAKING CHANGE: projects API now returns data in different format.
Update frontend to handle new structure."

# ✅ GOOD - С номером issue
git commit -m "fix(auth): resolve login timeout issue

Fixes #456"

# ❌ BAD - Нет типа
git commit -m "added new feature"

# ❌ BAD - Слишком общее
git commit -m "fix: bug fix"

# ❌ BAD - Неправильный type
git commit -m "update(projects): add form"  # Должен быть feat
```

### Breaking Changes

Для изменений, ломающих обратную совместимость:

```bash
# Вариант 1: ! после type
git commit -m "feat(api)!: change response format"

# Вариант 2: BREAKING CHANGE в footer
git commit -m "feat(api): change response format

BREAKING CHANGE: Response format changed from { data } to { result }"
```

### Auto-generated Changelog

При использовании Conventional Commits, CHANGELOG генерируется автоматически:

```bash
# Установить standard-version
npm install -D standard-version

# Сгенерировать changelog и bump version
npm run release
```

---

## 🔀 PULL REQUEST WORKFLOW

### PR Template

Создать `.github/pull_request_template.md`:

```markdown
## 📝 Описание

<!-- Кратко опишите изменения -->

## 🎯 Тип изменений

- [ ] 🚀 Новая функциональность (feat)
- [ ] 🐛 Исправление бага (fix)
- [ ] 📝 Документация (docs)
- [ ] 🎨 Стилизация кода (style)
- [ ] ♻️ Рефакторинг (refactor)
- [ ] ⚡ Производительность (perf)
- [ ] ✅ Тесты (test)
- [ ] 🔧 Конфигурация (chore)

## 🔗 Связанные Issues

<!-- Closes #123, Fixes #456 -->

## 📸 Скриншоты (если UI изменения)

<!-- Добавьте скриншоты до/после -->

## ✅ Checklist

- [ ] Код следует `.cursorrules`
- [ ] Проведено self-review
- [ ] Комментарии добавлены для сложной логики
- [ ] Документация обновлена
- [ ] Нет warnings в console
- [ ] Unit тесты добавлены/обновлены
- [ ] Тесты проходят локально (`npm run test`)
- [ ] TypeScript компилируется без ошибок (`npm run type-check`)
- [ ] ESLint проходит (`npm run lint`)
- [ ] Проверена accessibility (keyboard navigation, screen reader)
- [ ] Проверена на mobile/tablet/desktop
- [ ] i18n: все тексты через `t()`, переводы добавлены

## 🧪 Как тестировать

<!-- Опишите шаги для тестирования изменений -->

1. 
2. 
3. 

## 📌 Дополнительные заметки

<!-- Любая дополнительная информация для ревьюеров -->
```

### PR Naming Convention

```
feat(projects): add project creation form
fix(budget): resolve calculation error in categories
docs(api): update projects API documentation
refactor(auth): simplify login component logic
```

### PR Labels (настроить в GitHub/GitLab)

```
🚀 feature          # Новая функциональность
🐛 bug              # Исправление бага
📝 documentation    # Документация
🎨 enhancement      # Улучшение существующей функциональности
♻️ refactor         # Рефакторинг
⚡ performance      # Производительность
✅ testing          # Тесты
🔒 security         # Безопасность
🌐 i18n             # Интернационализация
🚧 WIP              # Work in Progress
🔥 critical         # Критичный fix
⏰ urgent           # Срочный
```

### Code Review Process

**Обязательные требования:**
- ✅ Минимум **1 approve** от другого разработчика
- ✅ Все **CI checks прошли** (build, tests, lint)
- ✅ **Нет conflicts** с target branch
- ✅ **Self-review** проведен (автор сам просмотрел diff)

**Reviewer Checklist:**
- [ ] Код следует `.cursorrules`
- [ ] Feature-Sliced Design соблюдена
- [ ] TypeScript типы корректны (нет `any`)
- [ ] Нет хардкода (цвета, тексты, API URLs в .env)
- [ ] i18n используется везде
- [ ] Accessibility соблюдена
- [ ] Нет console.log в production коде
- [ ] Error handling присутствует
- [ ] Loading states реализованы
- [ ] Tests покрывают новую функциональность
- [ ] Performance: нет лишних re-renders
- [ ] Security: нет уязвимостей

**Review Comments Convention:**
```
🔴 BLOCKER: критическая проблема, блокирует merge
🟠 MAJOR: важная проблема, должна быть исправлена
🟡 MINOR: необязательное улучшение
💡 SUGGESTION: предложение, можно проигнорировать
❓ QUESTION: вопрос для понимания
👍 PRAISE: похвала за хороший код
```

**Пример комментария:**
```
🔴 BLOCKER: TypeScript error

Line 45: You're using `any` type which is forbidden per .cursorrules.
Please use proper type or `unknown` if type is truly dynamic.
```

### Merge Strategies

**Для feature → develop:**
- ✅ **Squash and merge** (рекомендуется) - чистая история в develop
- Создает один коммит с сообщением: `feat(projects): add project creation form (#123)`

**Для release/hotfix → main:**
- ✅ **Merge commit** (сохранить историю)
- Сохраняет все коммиты из ветки

**Для main → develop (back-merge):**
- ✅ **Merge commit**

**После merge:**
```bash
# Автоматически удалить feature branch
# Настроить в GitHub/GitLab Settings
```

---

## 🚀 CI/CD PIPELINES (GitHub Actions)

### Frontend CI Pipeline

`.github/workflows/frontend-ci.yml`:

```yaml
name: Frontend CI

on:
  pull_request:
    paths:
      - 'web/**'
      - '.github/workflows/frontend-ci.yml'
  push:
    branches:
      - develop
      - main
    paths:
      - 'web/**'

jobs:
  lint-and-type-check:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install dependencies
        working-directory: ./web
        run: npm ci
      
      - name: Run ESLint
        working-directory: ./web
        run: npm run lint
      
      - name: Type check
        working-directory: ./web
        run: npm run type-check
  
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install dependencies
        working-directory: ./web
        run: npm ci
      
      - name: Run tests
        working-directory: ./web
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./web/coverage/coverage-final.json
          flags: frontend
  
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint-and-type-check, test]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install dependencies
        working-directory: ./web
        run: npm ci
      
      - name: Build
        working-directory: ./web
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
      
      - name: Check bundle size
        working-directory: ./web
        run: |
          BUNDLE_SIZE=$(du -sh .next | cut -f1)
          echo "Bundle size: $BUNDLE_SIZE"
          # Alert if bundle > 5MB
  
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Backend Go CI Pipeline

`.github/workflows/backend-go-ci.yml`:

```yaml
name: Backend Go CI

on:
  pull_request:
    paths:
      - 'backend/services/**/*.go'
      - 'backend/services/**/go.mod'
      - '.github/workflows/backend-go-ci.yml'
  push:
    branches:
      - develop
      - main
    paths:
      - 'backend/services/**/*.go'

jobs:
  lint:
    name: Lint Go Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      
      - name: golangci-lint
        uses: golangci/golangci-lint-action@v4
        with:
          version: latest
          working-directory: backend/services
  
  test:
    name: Test Go Services
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: exponat_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      
      - name: Run tests
        working-directory: backend/services
        run: |
          go test -v -race -coverprofile=coverage.out ./...
          go tool cover -func=coverage.out
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/exponat_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/services/coverage.out
          flags: backend-go
  
  build:
    name: Build Go Services
    runs-on: ubuntu-latest
    needs: [lint, test]
    strategy:
      matrix:
        service: [api-gateway, projects, budget]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      
      - name: Build ${{ matrix.service }}
        working-directory: backend/services/${{ matrix.service }}
        run: |
          go build -v -o bin/app ./cmd
      
      - name: Docker build
        working-directory: backend/services/${{ matrix.service }}
        run: |
          docker build -t exponat/${{ matrix.service }}:${{ github.sha }} .
```

### Deploy to Staging

`.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy-frontend:
    name: Deploy Frontend to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./web
          scope: ${{ secrets.VERCEL_ORG_ID }}
  
  deploy-backend:
    name: Deploy Backend to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Set K8s context
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }}
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install exponat ./infrastructure/helm/exponat \
            -f ./infrastructure/helm/exponat/values-staging.yaml \
            --namespace staging \
            --create-namespace \
            --wait
      
      - name: Run database migrations
        run: |
          kubectl exec -n staging deploy/api-gateway -- /app/migrate up
  
  notify:
    name: Notify deployment
    runs-on: ubuntu-latest
    needs: [deploy-frontend, deploy-backend]
    steps:
      - name: Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Deployed to Staging",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ *Deployed to Staging*\nBranch: `develop`\nCommit: ${{ github.sha }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Deploy to Production

`.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Extract version
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ steps.version.outputs.version }}
          draft: false
          prerelease: false
      
      - name: Deploy Frontend
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./web
      
      - name: Deploy Backend
        run: |
          helm upgrade --install exponat ./infrastructure/helm/exponat \
            -f ./infrastructure/helm/exponat/values-production.yaml \
            --namespace production \
            --set image.tag=${{ steps.version.outputs.version }} \
            --wait \
            --timeout 10m
      
      - name: Health check
        run: |
          curl -f https://api.exponat.site/health || exit 1
      
      - name: Rollback on failure
        if: failure()
        run: |
          helm rollback exponat -n production
```

---

## 🏷️ TAGGING & VERSIONING (Semantic Versioning)

### Формат версий

```
v{MAJOR}.{MINOR}.{PATCH}

v1.0.0    # Первый релиз
v1.1.0    # Новая функциональность (обратно совместимая)
v1.1.1    # Bug fix
v2.0.0    # Breaking change
```

### Когда увеличивать версию

| Тип изменения | Версия | Пример |
|---------------|--------|--------|
| **Breaking change** | MAJOR | `v1.0.0` → `v2.0.0` |
| **New feature** (обратно совместимая) | MINOR | `v1.0.0` → `v1.1.0` |
| **Bug fix** | PATCH | `v1.0.0` → `v1.0.1` |

### Создание тега

```bash
# 1. Убедиться что на main и всё synced
git checkout main
git pull origin main

# 2. Создать annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0

- feat: projects management
- feat: budget tracking
- feat: AI document generation
"

# 3. Push tag (запустит production deployment)
git push origin v1.0.0

# Или push всех тегов
git push origin --tags
```

### Автоматическое версионирование

С `standard-version`:

```bash
# Установить
npm install -D standard-version

# Добавить в package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:patch": "standard-version --release-as patch"
  }
}

# Использование (автоматически определит версию из коммитов)
npm run release

# Или явно указать
npm run release:minor  # 1.0.0 → 1.1.0
npm run release:major  # 1.0.0 → 2.0.0
npm run release:patch  # 1.0.0 → 1.0.1

# Это создаст:
# - Обновит version в package.json
# - Создаст CHANGELOG.md
# - Создаст git commit
# - Создаст git tag

# Затем просто push
git push --follow-tags origin main
```

---

## 🔒 SECRETS MANAGEMENT

### Где хранить секреты

```
❌ НЕ коммитить в Git:
- .env.local
- .env.production
- API keys
- Database passwords
- Private keys

✅ Хранить в:
- GitHub Secrets (для CI/CD)
- Kubernetes Secrets (для runtime)
- HashiCorp Vault (enterprise)
- .env.example (template без значений)
```

### .env файлы

```bash
# ✅ Коммитить (template)
.env.example

# ❌ НЕ коммитить (реальные значения)
.env
.env.local
.env.development
.env.staging
.env.production
```

### .env.example (template)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/exponat_dev

# Redis
REDIS_URL=redis://localhost:6379

# API
NEXT_PUBLIC_API_URL=http://localhost:8080
API_SECRET_KEY=your-secret-key-here

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 1C Integration
ONEC_API_URL=http://your-1c-server/api
ONEC_USERNAME=username
ONEC_PASSWORD=password

# LLM
OPENAI_API_KEY=sk-...
YANDEX_GPT_API_KEY=...

# File Storage
S3_BUCKET=exponat-uploads
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# Monitoring
SENTRY_DSN=https://...
```

### GitHub Secrets

Настроить в: `Settings → Secrets and variables → Actions`

```
# Required secrets
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
KUBE_CONFIG_STAGING
KUBE_CONFIG_PRODUCTION
SLACK_WEBHOOK
DATABASE_URL_PRODUCTION
REDIS_URL_PRODUCTION
SENTRY_DSN
```

### Kubernetes Secrets

```yaml
# infrastructure/kubernetes/base/secrets/api-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
stringData:
  database-url: postgresql://...  # Будет закодирован в base64
  redis-url: redis://...
  jwt-secret: ...
```

**Важно:** Реальные значения не в Git, а применяются через CI/CD или `kubectl create secret`

---

## 📊 MONITORING & OBSERVABILITY

### Логирование коммитов

Каждый коммит должен быть traceable:

```bash
# Автоматически добавлять Jira/GitHub issue
git commit -m "feat(projects): add creation form

Implements requirements from EXPO-123

Refs #456"
```

### Deployment tracking

После каждого деплоя:

```bash
# Создать deployment event в Sentry/DataDog
curl -X POST https://sentry.io/api/0/organizations/exponat/releases/ \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -d '{
    "version": "v1.0.0",
    "refs": [{
      "repository": "exponat/exponat",
      "commit": "'$GITHUB_SHA'"
    }]
  }'
```

### Git hooks для автоматизации

`.git/hooks/commit-msg` (или через Husky):

```bash
#!/bin/sh
# Проверить формат коммита

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Проверить Conventional Commits
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+"; then
  echo "❌ Commit message must follow Conventional Commits format"
  echo "Example: feat(projects): add creation form"
  exit 1
fi

echo "✅ Commit message format is valid"
```

---

## 📚 BEST PRACTICES

### DO ✅

1. **Коммитьте часто** - маленькие, атомарные коммиты лучше больших
2. **Meaningful commit messages** - опишите ЧТО и ПОЧЕМУ, не КАК
3. **Ревьюте свой код** перед созданием PR (self-review)
4. **Обновляйте ветку** перед merge (rebase или merge develop в feature)
5. **Удаляйте старые ветки** после merge
6. **Используйте draft PRs** для work in progress
7. **Пишите тесты** для новой функциональности
8. **Обновляйте документацию** вместе с кодом
9. **Используйте .gitignore** правильно
10. **Проверяйте diff** перед commit (`git diff --staged`)

### DON'T ❌

1. ❌ **НЕ коммитьте в main/develop** напрямую
2. ❌ **НЕ коммитьте секреты** (.env, API keys, passwords)
3. ❌ **НЕ коммитьте generated files** (node_modules, dist, .next, coverage)
4. ❌ **НЕ коммитьте IDE configs** (.vscode, .idea) - используйте .gitignore
5. ❌ **НЕ делайте force push** в shared branches (develop, main)
6. ❌ **НЕ merge без ревью** (кроме hotfixes в исключительных случаях)
7. ❌ **НЕ оставляйте commented code** - удаляйте или используйте Git history
8. ❌ **НЕ коммитьте TODO** без issue - создайте задачу
9. ❌ **НЕ смешивайте refactoring и features** в одном PR
10. ❌ **НЕ делайте огромные PRs** (>500 lines сложно ревьювить)

### Git Tips

```bash
# Исправить последний коммит (если еще не push)
git commit --amend

# Исправить commit message
git commit --amend -m "new message"

# Добавить файлы к последнему коммиту
git add file.ts
git commit --amend --no-edit

# Отменить последний коммит (но оставить изменения)
git reset --soft HEAD~1

# Отменить все uncommitted изменения
git reset --hard HEAD

# Stash изменения (временно спрятать)
git stash
git stash pop  # вернуть

# Удалить все локальные изменения
git clean -fd

# Посмотреть историю с графом
git log --oneline --graph --all

# Найти коммит который сломал код (binary search)
git bisect start
git bisect bad  # current commit is bad
git bisect good v1.0.0  # this commit was good
# Git будет переключать на коммиты, помечайте good/bad
# Найдет проблемный коммит

# Cherry-pick коммит из другой ветки
git cherry-pick <commit-hash>

# Интерактивный rebase (редактировать последние 3 коммита)
git rebase -i HEAD~3
```

---

## 🎓 TRAINING & ONBOARDING

### Новый разработчик должен:

1. ✅ Прочитать этот документ полностью
2. ✅ Прочитать `.cursorrules`
3. ✅ Настроить Git config:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your@email.com"
   git config --global core.autocrlf input  # Unix line endings
   git config --global pull.rebase true      # Rebase при pull
   ```
4. ✅ Установить pre-commit hooks (Husky)
5. ✅ Сделать тестовый PR в учебный репозиторий
6. ✅ Code review 2-3 PR других разработчиков

### Полезные ресурсы

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Версия:** 1.0
**Обновлено:** Март 2026
**Проект:** Экспонат (Exponat)

**Эти правила обязательны для всей команды. Отклонения обсуждаются и документируются.**
