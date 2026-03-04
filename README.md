# Espressamente

Piattaforma e-commerce per negozio di caffè specializzato — [espressamente.eu](https://espressamente.eu)

## Stack

| Layer | Tecnologia | Versione |
|-------|-----------|---------|
| Backend | Java + Spring Boot | 17 / 3.4.3 |
| Frontend | Next.js + React + TypeScript | 16.1.6 / 19 / 5.7 |
| Database | PostgreSQL + Flyway | 16 |
| Styling | Tailwind CSS | 4.0 |
| Auth | JWT (JJWT) | 0.12.5 |
| Storage | AWS S3 / MinIO | — |
| CI/CD | GitHub Actions + GHCR | — |
| Infra | Docker Compose + Nginx | — |

## Struttura

```
espressamente/
├── backend/          # Spring Boot API (porta 8080)
├── frontend/         # Next.js app (porta 3010)
├── docker/           # Docker Compose + Nginx config
├── scripts/          # Script deploy server
├── docs/             # Documentazione dettagliata
├── .github/          # CI/CD GitHub Actions
└── README.md
```

## Quick Start (sviluppo locale)

```bash
# 1. Avvia infrastruttura (DB, Redis, MinIO, MailHog)
docker compose -f docker/docker-compose.yml up -d

# 2. Backend
cd backend && ./mvnw spring-boot:run
# → http://localhost:8080/api
# → http://localhost:8080/api/swagger-ui.html

# 3. Frontend
cd frontend && npm install && npm run dev
# → http://localhost:3010
```

Vedi [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) per la guida completa.

## Ambienti

| Ambiente | Branch | URL | Deploy |
|----------|--------|-----|--------|
| Produzione | `master` | https://espressamente.eu | automatico (disabilitato) |
| Staging | `develop` | https://stg.espressamente.eu | automatico |
| Locale | — | http://localhost:3010 | manuale |

## Documentazione

- [DEVELOPMENT.md](docs/DEVELOPMENT.md) — Setup locale, workflow, convenzioni
- [DEPLOY.md](docs/DEPLOY.md) — Deploy VPS, CI/CD, Nginx, SSL
- [API.md](docs/API.md) — Riferimento REST API
