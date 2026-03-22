# Экспонат (Exponat)

SaaS-платформа для управления выставками

## Quick Start

### Prerequisites
- Node.js 20+
- Go 1.22+
- Python 3.11+
- Docker & Docker Compose

### Development

```bash
# Clone
git clone https://github.com/your-org/exponat.git
cd exponat

# Setup environment
cp .env.example .env.local

# Start services
docker compose up -d

# Frontend
cd web
npm install
npm run dev
```

### API Gateway (Kong)

Используется **Kong Gateway** (Open Source), декларативная конфигурация в `infrastructure/kong/kong.yml`.

Локально (после `docker compose up` в корне):

```bash
cd infrastructure/kong
docker compose -f docker-compose.kong.yml up -d
```

- Proxy: http://localhost:8000  
- Admin API: http://localhost:8001  

Подробности: [docs/kong-setup.md](docs/kong-setup.md).

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [GitOps Rules](docs/GITOPS_RULES.md)
- [Kong setup](docs/kong-setup.md)
- [Code Style](cursorrules)

## Contributing
1. Read [GITOPS_RULES.md](docs/GITOPS_RULES.md)
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat(scope): description"`
4. Push & create PR

## License
Proprietary
