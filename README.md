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

**Kong** поднимается вместе со стеком из корневого `docker compose up -d` (конфиг: `infrastructure/kong/kong.yml`). Фронтенд в Docker собирается с `NEXT_PUBLIC_*` на `http://localhost:8000`.

- Proxy: http://localhost:8000  
- Admin API: http://localhost:8001  
- Прямой доступ к сервисам (без Kong): dashboard `8080`, projects `8081`  

Подробности: [docs/kong-setup.md](docs/kong-setup.md).

### Keycloak и вход (OIDC)

Локально Keycloak поднимается отдельно (порт **8090**): `docker compose -f infrastructure/keycloak/docker-compose.keycloak.yml up -d`.  
Инструкции: [docs/keycloak-setup.md](docs/keycloak-setup.md).

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [GitOps Rules](docs/GITOPS_RULES.md)
- [Kong setup](docs/kong-setup.md)
- [Keycloak setup](docs/keycloak-setup.md)
- [Code Style](cursorrules)

## Contributing
1. Read [GITOPS_RULES.md](docs/GITOPS_RULES.md)
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat(scope): description"`
4. Push & create PR

## License
Proprietary
