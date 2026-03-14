# ROADMAP — Espressamente v2

> Documento di pianificazione per la seconda fase del progetto.
> Aggiornato: 2026-03-07

---

## Obiettivi della fase 2

1. **Ristrutturazione backend** in architettura modulare (modular monolith / logical microservices)
2. **Nuova funzionalità: Comodato d'uso** macchine da caffè
3. **Admin Dashboard** — applicazione Next.js separata per la gestione completa del sito
4. **Autenticazione JWT** per le API admin

---

## 1. Ristrutturazione Backend — Architettura Modulare

### Approccio scelto: Modular Monolith + DB condiviso

Il backend Spring Boot viene riorganizzato in **moduli logici indipendenti**, ma resta un unico processo con un unico database PostgreSQL condiviso.
Questo approccio è ideale per la scala attuale del progetto: zero complessità operativa, transazioni normali, nessuna duplicazione dati.

### Moduli previsti

| Modulo | Package | Responsabilità |
|--------|---------|----------------|
| `product-module` | `it.espressamente.product` | Prodotti, categorie, brand |
| `cms-module` | `it.espressamente.cms` | Pagine statiche, contenuti |
| `contact-module` | `it.espressamente.contact` | Form contatto, richieste assistenza, comodato |
| `auth-module` | `it.espressamente.auth` | Autenticazione admin, JWT, gestione utenti |
| `notification-module` | `it.espressamente.notification` | Email service centralizzato |

### Struttura directory backend

```
backend/src/main/java/it/espressamente/
├── product/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   └── dto/
├── cms/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   └── dto/
├── contact/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/          # ContactRequest, ServiceRequest, ComodatoRequest
│   └── dto/
├── auth/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/          # AdminUser
│   ├── dto/
│   └── security/       # JWT filter, SecurityConfig
├── notification/
│   └── service/        # EmailService centralizzato
└── common/
    ├── dto/            # ApiResponse, PagedResponse
    ├── exception/      # GlobalExceptionHandler, ResourceNotFoundException
    └── config/         # WebConfig, JsonbConverter
```

### Task di refactoring

- [ ] Creare struttura di package modulare
- [ ] Spostare entity, repository, service, controller nei rispettivi moduli
- [ ] Centralizzare EmailService in `notification-module`
- [ ] Mantenere compatibilità API (stesso versioning `/v1/`)
- [ ] Aggiungere test di integrazione per ogni modulo

---

## 2. Nuova Funzionalità: Comodato d'uso

### Descrizione

Il cliente offre macchine da caffè in **comodato gratuito**: la macchina viene data al cliente senza costo, in cambio dell'acquisto continuativo del caffè. Ispirato a: https://www.caffebonetti.it/comodato/

### Funzionalità

- Il cliente visita la pagina `/comodato` sul sito
- Visualizza i vantaggi del servizio e i modelli disponibili
- Compila il form di richiesta
- L'admin riceve notifica email e gestisce la richiesta dalla dashboard

### DB — Nuova tabella `comodato_requests`

```sql
CREATE TABLE comodato_requests (
    id              BIGSERIAL PRIMARY KEY,
    -- Dati richiedente
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    company_name    VARCHAR(150),              -- opzionale (aziende/bar)
    -- Indirizzo
    address         VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    province        VARCHAR(5),
    -- Preferenze
    machine_id      BIGINT REFERENCES products(id),  -- macchina richiesta
    delivery_type   VARCHAR(20) NOT NULL,             -- CONSEGNA / RITIRO
    notes           TEXT,
    -- Gestione
    status          VARCHAR(20) NOT NULL DEFAULT 'NUOVO',
    internal_notes  TEXT,
    -- Audit
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Backend

- [ ] Entity `ComodatoRequest` con enum `DeliveryType` (CONSEGNA / RITIRO)
- [ ] Aggiungere `COMODATO` a `RequestStatus` enum
- [ ] `ComodatoRepository` con query per status
- [ ] `ComodatoService` — salvataggio + email notifica admin
- [ ] `ComodatoController` — endpoint pubblico `POST /v1/comodato` + admin `GET/PATCH /v1/admin/comodato`
- [ ] DTO: `ComodatoFormRequest` (validazione), `ComodatoResponse`
- [ ] Migration Flyway: `V3__add_comodato.sql`
- [ ] Email template per notifica admin

### Frontend pubblico

- [ ] Nuova pagina `app/comodato/page.tsx`
  - Hero section con titolo e descrizione servizio
  - Sezione vantaggi (4 card: consegna gratuita, assistenza tecnica, ampia scelta caffè, flessibilità)
  - Sezione "Come funziona" (3 step: scegli la macchina → compila il form → riceviamo e ti contattiamo)
  - Griglia macchine disponibili (filtrata da prodotti con tipo MACCHINA)
  - Form richiesta comodato (`ComodatoForm.tsx`)
- [ ] Aggiungere voce "Comodato" nel menu `Header.tsx`
- [ ] Componente `ComodatoForm.tsx` (react-hook-form + zod)
  - Campi: nome, email, telefono, azienda (opzionale), città, indirizzo, macchina scelta, tipo consegna, note
  - Selezione macchina visuale (card con immagine e nome)

---

## 3. Admin Dashboard

### Stack tecnico

- **Framework**: Next.js 16 + TypeScript + Tailwind CSS v4
- **UI Library**: shadcn/ui (componenti accessibili e personalizzabili)
- **Form**: react-hook-form + zod
- **Stato**: React Context / Zustand (per auth state)
- **Porta locale**: 3020
- **Directory**: `admin/` (nella root del progetto)

### Autenticazione

- Login con email + password → backend ritorna JWT access token + refresh token
- Token salvato in `httpOnly cookie` (sicuro, non accessibile via JS)
- Middleware Next.js protegge tutte le route `/dashboard/*`
- Logout pulisce i cookie

### Struttura pagine

```
admin/src/app/
├── (auth)/
│   └── login/
│       └── page.tsx          # Pagina login
├── (dashboard)/
│   ├── layout.tsx            # Layout con sidebar + topbar
│   ├── page.tsx              # Overview / stats
│   ├── prodotti/
│   │   ├── page.tsx          # Lista prodotti (tabella + filtri)
│   │   ├── nuovo/
│   │   │   └── page.tsx      # Form creazione prodotto
│   │   └── [id]/
│   │       └── page.tsx      # Form modifica prodotto
│   ├── categorie/
│   │   └── page.tsx          # CRUD categorie
│   ├── brand/
│   │   └── page.tsx          # CRUD brand
│   ├── comodato/
│   │   ├── page.tsx          # Lista richieste comodato
│   │   └── [id]/
│   │       └── page.tsx      # Dettaglio richiesta comodato
│   ├── contatti/
│   │   ├── page.tsx          # Lista richieste contatto
│   │   └── [id]/
│   │       └── page.tsx      # Dettaglio richiesta contatto
│   ├── assistenza/
│   │   ├── page.tsx          # Lista richieste assistenza
│   │   └── [id]/
│   │       └── page.tsx      # Dettaglio richiesta assistenza
│   ├── pagine/
│   │   ├── page.tsx          # Lista pagine CMS
│   │   └── [id]/
│   │       └── page.tsx      # Editor pagina CMS (rich text)
│   └── impostazioni/
│       └── page.tsx          # Impostazioni account admin
```

### Componenti dashboard

```
admin/src/components/
├── layout/
│   ├── Sidebar.tsx           # Navigazione laterale
│   ├── Topbar.tsx            # Header con utente + logout
│   └── DashboardLayout.tsx   # Wrapper layout
├── ui/                       # shadcn/ui components
├── stats/
│   └── StatsCard.tsx         # Card con metrica (es. "12 nuove richieste")
├── tables/
│   ├── ProductsTable.tsx
│   ├── RequestsTable.tsx
│   └── DataTable.tsx         # Tabella generica con ordinamento + filtri
├── forms/
│   ├── ProductForm.tsx        # Form prodotto (nuovo/modifica)
│   ├── CategoryForm.tsx
│   ├── BrandForm.tsx
│   └── PageEditorForm.tsx    # Editor CMS con rich text
└── shared/
    ├── StatusBadge.tsx        # Badge colorato per status richieste
    ├── ConfirmDialog.tsx      # Dialog conferma eliminazione
    └── ImageUpload.tsx        # Upload immagini prodotto
```

### Funzionalità per sezione

#### Overview (/)
- Contatori: prodotti attivi, nuove richieste contatto, nuove richieste assistenza, nuove richieste comodato
- Ultime 5 richieste ricevute per tipo
- Stato servizi (staging / prod)

#### Prodotti
- Lista paginata con filtro per tipo, categoria, brand
- Creazione / modifica prodotto con:
  - Upload immagini (drag & drop)
  - Editor features (aggiungi/rimuovi coppie label-value)
  - Selezione categoria e brand
  - Toggle featured / active
- Eliminazione soft (is_active = false)

#### Categorie & Brand
- CRUD completo
- Riordinamento drag & drop (sort_order)
- Upload logo/immagine

#### Richieste (Contatto / Assistenza / Comodato)
- Lista con filtro per status e data
- Cambio status con dropdown
- Note interne (campo notes)
- Vista dettaglio completa
- Export CSV

#### Pagine CMS
- Lista pagine con toggle published
- Editor rich text (TipTap o Quill)
- Preview anteprima

#### Impostazioni
- Modifica password admin
- Modifica email notifiche

---

## 4. Autenticazione JWT — Backend

### Task

- [ ] Implementare `JwtService` (generazione + validazione token, HS256)
- [ ] Implementare `JwtAuthFilter` (OncePerRequestFilter)
- [ ] Implementare `AuthController` — endpoint:
  - `POST /v1/auth/login` → ritorna `{ accessToken, refreshToken, expiresIn }`
  - `POST /v1/auth/refresh` → rinnova access token
  - `POST /v1/auth/logout` → invalida refresh token (blacklist o DB flag)
- [ ] `UserDetailsService` che carica `AdminUser` da DB
- [ ] Aggiornare `SecurityConfig` con il JWT filter
- [ ] Aggiungere `refresh_tokens` table in DB (o flag `token_invalidated_at` su AdminUser)

---

## 5. Sicurezza e Protezione Dati

### 5a. Cifratura campi sensibili nel DB

I dati personali raccolti tramite form (contatto, assistenza, comodato) vengono cifrati nel DB con AES-256.

**Campi da cifrare:**
- `full_name`, `email`, `phone` nelle tabelle `contact_requests`, `service_requests`, `comodato_requests`
- `address`, `city` in `comodato_requests`

**Implementazione:**
- `EncryptionService` — wrapper AES-256-GCM con chiave da env var `DB_ENCRYPTION_KEY`
- `JPA AttributeConverter` (`EncryptedStringConverter`) — cifra/decifra trasparente a livello ORM
- Annotazione custom `@Encrypted` applicata ai campi sensibili delle entity
- La chiave non è mai nel codice — solo in env var (min 32 byte, base64)

**Task:**
- [ ] `EncryptionService` con AES-256-GCM
- [ ] `EncryptedStringConverter` (JPA AttributeConverter)
- [ ] Applicare `@Convert` ai campi sensibili di `ContactRequest`, `ServiceRequest`, `ComodatoRequest`
- [ ] Aggiungere `DB_ENCRYPTION_KEY` a `.env.staging`, `.env.production`, CLAUDE.md Note
- [ ] Migration per re-cifrare i dati esistenti (script one-shot)

### 5b. Log accessi admin (Audit Log)

Ogni operazione effettuata da un admin viene registrata: chi ha fatto cosa, su quale risorsa, quando e da quale IP.

**Nuova tabella `admin_audit_logs`:**

```sql
CREATE TABLE admin_audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT REFERENCES admin_users(id),
    admin_email   VARCHAR(150) NOT NULL,
    action        VARCHAR(20)  NOT NULL,  -- VIEW, CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    resource_type VARCHAR(50)  NOT NULL,  -- PRODUCT, CONTACT_REQUEST, SERVICE_REQUEST, COMODATO, PAGE, ecc.
    resource_id   BIGINT,
    detail        TEXT,                   -- es. "status: NUOVO → IN_LAVORAZIONE"
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_audit_created ON admin_audit_logs(created_at DESC);
```

**Implementazione:**
- `AuditService` con metodo `log(action, resourceType, resourceId, detail)`
- Chiamato nei service layer (non nel controller) per ogni operazione admin
- Visibile nella dashboard admin (sezione "Log attività")

**Task:**
- [ ] Entity `AdminAuditLog` + migration `V4__add_audit_log.sql`
- [ ] `AuditService`
- [ ] Integrare nei service admin (ContactService, ProductService, ComodatoService, ecc.)
- [ ] Pagina "Log attività" nella admin dashboard

### 5c. Pagine legali (già implementate ✓)

- [x] `privacy-policy` — Privacy Policy GDPR compliant
- [x] `cookie-policy` — Cookie Policy con tabella cookie e istruzioni browser
- [x] `termini-di-spedizione-e-consegna` — Termini spedizioni, resi, garanzia
- [x] Link legali nel Footer
- [ ] **Cookie banner** — mostrare al primo accesso, salvare consenso in cookie `cookie_consent`
- [ ] **Checkbox consenso** nei form (contatto, assistenza, comodato) — campo obbligatorio

---

## 6. Upload Immagini

Attualmente le immagini dei prodotti sono URL stringa. Serve gestione upload reale.

### Approccio

- **Locale**: le immagini vengono salvate in una cartella `uploads/` servita da Spring Boot come static resource
- **Produzione** (futuro): migrare a object storage (es. Cloudflare R2 o S3-compatible)

### Task

- [ ] Endpoint `POST /v1/admin/upload` → accetta multipart/form-data, salva file, ritorna URL
- [ ] Configurare Spring Boot per servire `/uploads/**` come static content
- [ ] Componente `ImageUpload.tsx` nella dashboard (drag & drop + preview)
- [ ] Aggiornare `ProductForm.tsx` per usare upload reale

---

## 6. Deploy & Infrastruttura

### Nuovi ambienti da configurare

| Servizio | Staging | Produzione |
|----------|---------|------------|
| Admin Dashboard | `admin.stg.espressamente.eu` | `admin.espressamente.eu` |

### Task

- [ ] Creare `Dockerfile` per la admin dashboard
- [ ] Aggiornare `docker-compose.staging.yml` con il servizio `admin` (porta 3020)
- [ ] Aggiornare `docker-compose.prod.yml` con il servizio `admin`
- [ ] Creare Nginx config `admin.espressamente.eu.conf` (+ Basic Auth iniziale)
- [ ] Aggiornare GitHub Actions CI/CD per buildare e deployare anche la admin dashboard
- [ ] Certificato SSL per `admin.espressamente.eu` e `admin.stg.espressamente.eu`

---

## Priorità e ordine di sviluppo

### Fase 2a — Backend fondamenta (fare prima)
1. Implementare JWT auth nel backend
2. Ristrutturare backend in moduli
3. Aggiungere comodato (entity + controller + migration)

### Fase 2b — Frontend pubblico
4. Pagina `/comodato` con form
5. Aggiornare navigazione

### Fase 2c — Admin Dashboard
6. Setup progetto admin (Next.js + shadcn/ui)
7. Login + auth middleware
8. Overview e stats
9. Gestione prodotti (CRUD completo + upload immagini)
10. Gestione richieste (contatto, assistenza, comodato)
11. CMS pagine

### Fase 2d — Deploy
12. Containerizzare admin dashboard
13. Deploy su staging + Nginx config
14. Test completo staging
15. Deploy su produzione

---

## Note tecniche

- Tutto lo sviluppo avviene in locale prima del push
- Il DB è condiviso tra tutti i moduli (no DB separati)
- JWT secret via environment variable `JWT_SECRET` (min 256 bit)
- Admin dashboard punta allo stesso backend (`http://localhost:8080/api`)
- Le immagini in locale vengono servite da `http://localhost:8080/uploads/`
- shadcn/ui scelto per la dashboard perché: componenti accessibili, personalizzabili, non impone design system rigido
