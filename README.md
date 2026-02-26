# ☕ Espressamente

**espressamente.it** — Sito vetrina per negozio di caffè specializzato.

## Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Backend | Java 17 + Spring Boot 3 |
| Frontend | Next.js 16 (React 19) + TypeScript |
| Database | PostgreSQL 16 (`espressamente_db`) |
| ORM | Spring Data JPA / Hibernate |
| Migrazioni DB | Flyway |
| Styling | Tailwind CSS 4 |
| Storage | AWS S3 / MinIO |
| CI/CD | GitHub Actions |

## Struttura Progetto

```
espressamente/
├── backend/          # Java Spring Boot 3 API
├── frontend/         # Next.js 16 App
├── docker/           # Docker Compose per sviluppo locale
├── docs/             # Documentazione progetto
└── README.md
```

## Quick Start

### Prerequisiti
- Java 17 (JDK)
- Node.js 20.9+
- PostgreSQL 16
- pnpm (consigliato)

### Database
```bash
createdb espressamente_db
```

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
API disponibile su `http://localhost:8080/api`

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```
App disponibile su `http://localhost:3010`


### Docker (sviluppo)
```bash
docker compose -f docker/docker-compose.yml up -d
```

## Autori

Espressamente Team
