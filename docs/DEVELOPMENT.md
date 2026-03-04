# Guida allo Sviluppo Locale

## Prerequisiti

- **Java 17** (JDK) — [Adoptium](https://adoptium.net/)
- **Node.js 20.9+** — [nodejs.org](https://nodejs.org/)
- **Maven 3.9+** (o usa `./mvnw` incluso)
- **Docker Desktop** — per i servizi di supporto

## Setup Iniziale

### 1. Clona il repository

```bash
git clone https://github.com/SERGE3-g/espressamente.git
cd espressamente
```

### 2. Avvia i servizi Docker

```bash
docker compose -f docker/docker-compose.yml up -d
```

Servizi avviati:

| Servizio | Porta | Credenziali |
|---------|-------|-------------|
| PostgreSQL | 5432 | sergeguea / lamiapassword1 |
| Redis | 6379 | — |
| MinIO (S3) | 9095 (API), 9096 (console) | minioadmin / minioadmin |
| MailHog (SMTP fake) | 1025 (SMTP), 8025 (WebUI) | — |

### 3. Avvia il backend

```bash
cd backend
./mvnw spring-boot:run
```

- API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/api-docs

Flyway esegue automaticamente le migration al primo avvio.

### 4. Avvia il frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:3010

## Struttura Backend

```
backend/src/main/java/it/espressamente/api/
├── EspressamenteApplication.java
├── config/
│   ├── SecurityConfig.java       # Spring Security + CORS
│   ├── WebConfig.java            # WebMvcConfigurer
│   └── JsonbConverter.java       # JSONB ↔ Java
├── controller/
│   ├── ProductController.java    # GET /v1/products/**
│   ├── CategoryController.java   # GET /v1/categories
│   ├── BrandController.java      # GET /v1/brands/**
│   ├── PageController.java       # GET /v1/pages/{slug}
│   └── ContactController.java    # POST /v1/contact, /v1/service-request
├── dto/
│   ├── request/                  # DTO input (validazione Bean Validation)
│   └── response/                 # DTO output (Jackson serialization)
├── model/
│   ├── entity/                   # JPA Entities (BaseEntity → Product, Brand, etc.)
│   └── enums/                    # ProductType, ContactType, RequestStatus
├── repository/                   # Spring Data JPA (7 repository)
├── service/
│   ├── ProductService.java       # Business logic prodotti
│   ├── ContactService.java       # Business logic contatti/assistenza
│   └── EmailService.java         # Invio email (JavaMailSender)
└── exception/
    ├── GlobalExceptionHandler.java
    └── ResourceNotFoundException.java
```

### Database Migrations

Le migration Flyway si trovano in `backend/src/main/resources/db/migration/`:

| File | Contenuto |
|------|-----------|
| `V1__initial_schema.sql` | Tabelle: categories, brands, products, contact_requests, service_requests, pages, admin_users |
| `V2__seed_products.sql` | Dati di esempio |

Per aggiungere una migration:
```bash
# Crea il file con il prossimo numero di versione
touch backend/src/main/resources/db/migration/V3__descrizione.sql
```

### Variabili d'ambiente Backend

Tutte le variabili hanno un default per sviluppo locale. In `application.yml`:

```yaml
DB_HOST: localhost
DB_USERNAME: sergeguea
DB_PASSWORD: lamiapassword1
JWT_SECRET: espressamente-dev-secret-key-...
MAIL_HOST: localhost
MAIL_PORT: 1025
STORAGE_TYPE: local
CORS_ORIGINS: http://localhost:3010
NOTIFICATION_EMAIL: info@espressamente.it
```

## Struttura Frontend

```
frontend/src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (font, providers)
│   ├── page.tsx                  # Home
│   ├── not-found.tsx             # 404
│   ├── caffe/                    # Catalogo caffè
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── macchine/                 # Catalogo macchine/accessori
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── brand/[slug]/page.tsx     # Pagina brand
│   ├── assistenza/page.tsx       # Form assistenza tecnica
│   ├── contatti/page.tsx         # Form contatti
│   └── chi-siamo/page.tsx        # CMS dinamico
├── components/
│   ├── ui/                       # Componenti base riusabili
│   │   ├── Button.tsx            # variants: primary/secondary/outline, sizes: sm/md/lg
│   │   ├── Input.tsx             # label, error, helperText
│   │   ├── Textarea.tsx          # label, error
│   │   ├── Select.tsx            # label, options, placeholder, error
│   │   ├── Skeleton.tsx          # shimmer loading
│   │   ├── Pagination.tsx        # URL-based pagination
│   │   └── Logo.tsx
│   ├── layout/
│   │   ├── Header.tsx            # Nav con active link (usePathname)
│   │   └── Footer.tsx            # Footer con versione app
│   ├── products/
│   │   ├── ProductGrid.tsx       # Grid 1/2/4 colonne
│   │   ├── FilterBar.tsx         # Filtri pill (client, aggiorna URL)
│   │   └── SortDropdown.tsx
│   ├── cards/
│   │   └── ProductCard.tsx
│   ├── forms/
│   │   ├── ContactForm.tsx       # react-hook-form + Zod
│   │   └── ServiceRequestForm.tsx
│   └── sections/                 # Sezioni homepage
│       ├── HeroSection.tsx
│       ├── CategoriesSection.tsx
│       ├── FeaturedProducts.tsx
│       ├── AssistenzaBanner.tsx
│       ├── BrandsSection.tsx     # Embla carousel
│       └── ProductCarousel.tsx   # Embla carousel
├── lib/
│   ├── api.ts                    # Client API centralizzato
│   └── providers.tsx             # React Query provider
├── types/
│   └── index.ts                  # TypeScript types globali
└── styles/
    └── globals.css               # Tailwind v4 + design system
```

### Pattern architetturali

**Server Components** (default in Next.js 14+):
```typescript
// app/caffe/page.tsx — data fetching lato server
export default async function CaffePage({ searchParams }) {
  const params = await searchParams
  const products = await api.products.getAll(...)
  return <ProductGrid products={products} />
}
```

**Client Components** (solo quando necessario):
```typescript
"use client"  // in cima al file
// Per interattività: FilterBar, Pagination, form, ecc.
```

**Pagine dinamiche** (force-dynamic per evitare pre-render a build time):
```typescript
export const dynamic = "force-dynamic"
```

### API Client

`src/lib/api.ts` — wrapper centralizzato per tutte le chiamate API:

```typescript
// SSR (Node.js): usa API_URL (http://backend:8080/api in Docker)
// Client-side: usa NEXT_PUBLIC_API_URL (URL pubblico)
const API_BASE =
  typeof window === "undefined"
    ? process.env.API_URL
    : process.env.NEXT_PUBLIC_API_URL

export const api = {
  products: { getAll, getBySlug, getFeatured, getByCategory, getByBrand, search },
  categories: { getAll },
  brands: { getAll, getBySlug },
  pages: { getBySlug },
  contact: { submit },
  service: { submit },
}
```

### Design System

Colori brand (warm brown, definiti in `globals.css` con Tailwind v4 `@theme`):

| Token | Hex | Uso |
|-------|-----|-----|
| `brand-50` | `#faf6f1` | Sfondi chiari |
| `brand-200` | `#e8d5c0` | Bordi, dividers |
| `brand-500` | `#a0704d` | Accenti |
| `brand-700` | `#5c3d2e` | Testo su chiaro |
| `brand-900` | `#2c1810` | Testo principale |

Font: `font-heading` = Georgia (serif), `font-body` = Inter (sans)

## Variabili d'ambiente Frontend

**Build-time** (passate a Docker come ARG):
```
NEXT_PUBLIC_API_URL=https://stg.espressamente.eu/api  # staging
NEXT_PUBLIC_API_URL=https://espressamente.eu/api      # prod
```

**Runtime** (passate dal docker-compose):
```
API_URL=http://backend:8080/api   # per SSR dentro Docker
NODE_ENV=production
```

## Testing

### Backend

```bash
cd backend
./mvnw test
```

I test usano un database PostgreSQL di test. In CI usa un service container PostgreSQL.

### Frontend

```bash
cd frontend
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript check
npm run build       # Build completo
```

## Git Workflow

```
main/master ─────────────────────────────► Produzione
                                           (deploy disabilitato)
develop ─────────────────────────────────► Staging
  │                                        (deploy automatico)
  ├── feature/nome-feature
  ├── fix/nome-bug
  └── chore/nome-task
```

1. Crea branch da `develop`
2. Apri PR verso `develop`
3. CI deve passare (lint, typecheck, build, test)
4. Merge in `develop` → deploy automatico su staging
5. Quando staging è validato → merge `develop → master` → deploy prod
