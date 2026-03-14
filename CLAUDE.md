# CLAUDE.md — Espressamente Project

> **Versione corrente: v2.0.0** — rilasciata 2026-03-14
> Release: https://github.com/SERGE3-g/espressamente/releases/tag/v2.0.0

## Panoramica
Piattaforma e-commerce per negozio di caffè specializzato.
- **Frontend pubblico**: Next.js 16 + TypeScript + Tailwind v4 (porta 3010)
- **Admin Dashboard**: Next.js 16 + TypeScript + shadcn/ui (porta 3020) — `admin/`
- **Backend**: Spring Boot 3.4.3 + Java 17 + PostgreSQL (porta 8080) — architettura modulare
- **Server VPS**: 217.154.119.208 (IONOS Ubuntu 24.04)
- **SSH**: `ssh -i ~/.ssh/espressamente_deploy root@217.154.119.208`

> Piano completo fase 2: vedi `docs/ROADMAP.md`

## Branch Strategy
- `master` → Produzione (espressamente.eu) — deploy **disabilitato** (`if: false` in cd.yml)
- `develop` → Staging (stg.espressamente.eu) — deploy automatico via GitHub Actions

## Ambienti sul Server

### Espressamente Produzione (SPENTO — non avviare)
```bash
docker compose -f /opt/espressamente/repo/docker/docker-compose.prod.yml \
  --env-file /opt/espressamente/production/.env.production up -d
```
- Frontend: 127.0.0.1:3010 | Backend: 127.0.0.1:8082 | DB: 127.0.0.1:5433

### Espressamente Staging (ATTIVO)
```bash
docker compose -f /opt/espressamente/repo/docker/docker-compose.staging.yml \
  --env-file /opt/espressamente/staging/.env.staging up -d
```
- Frontend: 127.0.0.1:3011 | Backend: 127.0.0.1:8081 | DB: 127.0.0.1:5434

### JurixSuite Dev (ATTIVO)
```bash
cd /opt/JurixSuite && docker compose up -d
```

### DevTools — pgAdmin (ATTIVO)
```bash
docker compose -f /opt/espressamente/repo/docker/docker-compose.tools.yml \
  --env-file /opt/espressamente/tools/.env up -d
```
- URL: https://pgadmin.espressamente.eu
- Login: gueaserge2@gmail.com / changeme123

## Comandi Utili Server

```bash
# Dashboard DevOps completa
bash /opt/espressamente/repo/scripts/server-status.sh

# Git pull repo
git -C /opt/espressamente/repo pull --ff-only

# Log container
docker logs <container-name> --tail 50 -f

# pgpass (credenziali pgAdmin)
/opt/espressamente/repo/docker/pgadmin/pgpass   # chmod 600, owner 5050
```

## Nginx
- Config globale: `/etc/nginx/nginx.conf`
- Virtual hosts: `/etc/nginx/sites-enabled/`
  - `espressamente.eu.conf`
  - `stg.espressamente.eu.conf`
  - `admin.espressamente.eu.conf` → 127.0.0.1:3020
  - `admin.stg.espressamente.eu.conf` → 127.0.0.1:3012
  - `pgadmin.espressamente.eu.conf` (Basic Auth: /etc/nginx/.htpasswd-pgadmin)

## GitHub Secrets necessari
`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `GHCR_TOKEN`

---

## TODO — Da completare

### Fase 2a — Backend fondamenta
- [x] **JWT Auth** — JwtService, JwtAuthFilter, AuthController (login/refresh/logout) ✓
  - Access token: 15 min | Refresh token: 7 giorni (httpOnly cookie, rotazione)
  - Migration V3: tabella `refresh_tokens`
  - Credenziali dev: admin / admin123
- [x] **Refactoring modulare** — ristrutturato package in 9 moduli (common, auth, product, cms, contact, customer, invoice, admin, notification) ✓
- [x] **Comodato** — entity ComodatoRequest, migration V4, controller, service, email notifica ✓

### Fase 2b — Frontend pubblico
- [x] **Pagina /comodato** — hero, vantaggi, come funziona, cosa è incluso, ComodatoForm ✓
- [x] **Menu navigazione** — voce "Comodato" aggiunta in Header.tsx ✓

### Fase 2c — Admin Dashboard (app separata `admin/`, porta 3020)
- [x] **Setup progetto** — Next.js + shadcn/ui + configurazione base ✓
- [x] **Auth** — pagina login, middleware protezione route, gestione JWT cookie ✓
- [x] **Overview** — stats (prodotti, richieste nuove per tipo), ultime richieste ✓
- [x] **Prodotti CRUD** — lista, creazione, modifica, eliminazione ✓
- [x] **Categorie & Brand CRUD** — con riordinamento sort_order ✓
- [x] **Richieste Comodato** — lista, dettaglio, cambio status, note interne ✓
- [x] **Richieste Contatto** — lista, dettaglio, cambio status ✓
- [x] **Richieste Assistenza** — lista, dettaglio, cambio status ✓
- [x] **CMS Pagine** — lista, editor rich text (TipTap), toggle published ✓
- [x] **Impostazioni** — modifica password ✓
- [x] **Redesign completo** — palette brand warm, sidebar collapsabile, toast, dialog, skeleton ✓

### Fase 2d — Sicurezza e protezione dati
- [x] **Cifratura DB** — `EncryptionService` AES-256-GCM + `EncryptedStringConverter` (JPA) su campi sensibili (nome, email, telefono, indirizzo) in Customer, ContactRequest, ServiceRequest, ComodatoRequest ✓
  - Chiave via `DB_ENCRYPTION_KEY` env var (32 byte base64) — se assente, cifratura disabilitata (dev)
  - Search clienti: in-memory dopo decrypt (JPQL LIKE non funziona su campi cifrati)
  - Migration V10: colonne TEXT per ospitare base64 cifrato
- [x] **Audit log** — tabella `admin_audit_logs`, `AuditService`, `AdminAuditController`, pagina `/audit` ✓
  - Migration V11: tabella `admin_audit_logs`
- [x] **Privacy Policy** — pagina `/privacy-policy` GDPR compliant ✓
- [x] **Cookie Policy** — pagina `/cookie-policy` ✓
- [x] **Termini spedizioni** — pagina `/termini-di-spedizione-e-consegna` ✓
- [x] **Link legali Footer** — Privacy, Cookie, Spedizioni ✓
- [x] **Cookie banner** — `CookieBanner.tsx`, consenso al primo accesso, `cookie_consent` localStorage + cookie ✓
- [x] **Checkbox consenso** nei form contatto ✓, assistenza ✓ (aggiunto), comodato ✓
  - ServiceFormRequest: aggiunto campo `privacyConsent`; Migration V12 aggiunge colonna a `service_requests`

### Fase 2e — Upload immagini
- [x] **Backend** — `AdminUploadController` `POST /v1/admin/upload`, static `/uploads/**` via WebConfig ✓
- [x] **Frontend dashboard** — `ImageUpload.tsx` (drag & drop + preview), integrato in `ProductForm.tsx` ✓

### Fase 2f — Deploy
- [x] **Dockerfile admin** — `admin/Dockerfile` multi-stage Node 20 Alpine, porta 3020 ✓
- [x] **docker-compose** — servizio `admin` in staging (porta 3012) e prod (porta 3020) ✓
- [x] **Nginx** — `admin.espressamente.eu.conf` + `admin.stg.espressamente.eu.conf` ✓
- [ ] **SSL** — certificati per admin.espressamente.eu e admin.stg.espressamente.eu
- [x] **GitHub Actions** — CI (typecheck + build) + CD (build & push immagine admin) ✓
- [x] **CORS** — domini admin aggiunti a `CORS_ORIGINS` in staging e prod ✓

### Alta priorità (infrastruttura)
- [x] **Testare pgAdmin 2FA** — email reset password funziona via Gmail SMTP ✓
- [ ] **Testare connessione pgAdmin** a tutti i DB (Staging ✓, Prod spento, JurixSuite)
- [ ] **Validare staging completamente** — tutte le funzionalità (prodotti, form, email, ecc.)

### Prima del go-live produzione
- [ ] **Abilitare deploy prod** — rimuovere `if: false` da `.github/workflows/cd.yml` (job `deploy-prod`)
- [ ] **Merge develop → master** per triggerare il primo deploy prod automatico
- [ ] **Avviare container prod** sul server
- [ ] **Rimettere repo privato** su GitHub

### Fase 3e — Ruoli, Negozi e Gestione Dipendenti
- [x] **Migration V14** — tabella `stores` + campi `role`/`store_id` su `admin_users` ✓
- [x] **Entity Store** — name, address, city, phone, email ✓
- [x] **Enum UserRole** — SUPER_ADMIN, STORE_MANAGER, EMPLOYEE ✓
- [x] **AdminUser aggiornato** — role (enum) + store (ManyToOne) ✓
- [x] **JWT con ruolo** — claim `role` nel token, `extractRole()` in JwtService ✓
- [x] **AdminUserDetailsService** — carica ruolo dal DB (non più hardcoded ADMIN) ✓
- [x] **AuthResponse** — restituisce role, storeId, storeName al login ✓
- [x] **CRUD Dipendenti** — AdminUserController `/v1/admin/users` (lista, dettaglio, crea, modifica, toggle attivo) ✓
- [x] **Lista negozi** — endpoint `/v1/admin/users/stores` ✓
- [x] **@PreAuthorize** — solo SUPER_ADMIN può gestire utenti, `@EnableMethodSecurity` ✓
- [x] **Dashboard admin** — pagine `/dipendenti` (lista, nuovo, modifica), EmployeeForm, Sidebar aggiornata ✓
- [x] **Auth store** — ruolo e negozio nello stato Zustand, helper `isSuperAdmin()` ✓

### Manutenzione server
- [ ] **Riavviare il server** per applicare l'aggiornamento del kernel (6.8.0-87 → 6.8.0-101)
  - Prima del reboot: verificare che tutti i container abbiano `restart: unless-stopped` ✓
  - Comando: `reboot` (i container si riavviano automaticamente)
- [ ] **Rinnovare certificati SSL scaduti** per JurixSuite:
  - `dev.jurixsuite.it` — scaduto
  - `staging.jurixsuite.it` — scaduto

### Fase 3a — CMS Enhancement
- [x] **Editor TipTap potenziato** — Image, Underline, TextAlign, Color, Highlight, YouTube, CodeBlock, Placeholder, CharacterCount ✓
- [x] **LinkDialog** — dialog per inserimento link (sostituisce window.prompt) ✓
- [x] **Delete pagine** — endpoint DELETE backend + UI con conferma Dialog ✓
- [x] **Ricerca/filtro pagine** — search per titolo, filtro published/bozza ✓
- [x] **Campi SEO** — metaTitle + metaDescription nel form di creazione/modifica ✓

### Fase 3b — CRM Service (Anagrafica Clienti)
- [x] **Migration V6** — tabelle `customers`, `customer_interactions` + FK `customer_id` su richieste esistenti ✓
- [x] **Backend CRM** — Customer entity, CustomerInteraction entity, enums (ClientType, InteractionType) ✓
- [x] **CRUD Clienti** — AdminCustomerController `/v1/admin/customers` (lista, dettaglio, crea, modifica, disattiva) ✓
- [x] **Interazioni** — AdminCustomerInteractionController `/v1/admin/customers/{id}/interactions` ✓
- [x] **Link richieste** — collegamento comodato/contatto/assistenza a profilo cliente ✓
- [x] **Dashboard clienti** — `/clienti` lista con search/filtri, `/clienti/nuovo` form, `/clienti/[id]` dettaglio con tabs ✓
- [x] **Sidebar** — sezione "CRM" con voce "Clienti" ✓

### Fase 3c — Billing Service (Fatturazione)
- [x] **Migration V7** — tabelle `invoices`, `invoice_items` + sequence numerazione ✓
- [x] **Backend Fatturazione** — Invoice entity, InvoiceItem entity, enums (InvoiceStatus, PaymentMethod) ✓
- [x] **CRUD Fatture** — AdminInvoiceController `/v1/admin/invoices` (CRUD + send/pay/cancel) ✓
- [x] **Numerazione automatica** — formato FAT-YYYY-NNNN progressivo ✓
- [x] **Ciclo stato** — BOZZA → INVIATA → PAGATA / SCADUTA / ANNULLATA ✓
- [x] **Dashboard fatture** — `/fatture` lista, `/fatture/nuovo` creazione con items dinamici, `/fatture/[id]` dettaglio ✓
- [x] **CustomerSelector** — componente search-as-you-type per selezionare cliente ✓
- [x] **Sidebar** — sezione "Finanze" con voce "Fatture" ✓

### Fase 3d — Accounting Service (Contabilità)
- [x] **Migration V8** — tabella `accounting_entries` ✓
- [x] **Backend Contabilità** — AccountingEntry entity, enums (AccountingType, AccountingCategory) ✓
- [x] **CRUD Registrazioni** — AdminAccountingController `/v1/admin/accounting` (CRUD + summary) ✓
- [x] **Riepilogo finanziario** — endpoint `/v1/admin/accounting/summary` (entrate, uscite, bilancio per periodo) ✓
- [x] **Auto-registrazione** — quando fattura pagata → crea automaticamente ENTRATA in contabilità ✓
- [x] **Dashboard contabilità** — `/contabilita` cards riepilogo + tabella registrazioni con filtri ✓
- [x] **Sidebar** — voce "Contabilità" sotto "Finanze" ✓

### Fase 3f — Audit Log, RBAC, Warehouse
- [x] **Audit log fix** — AuditService.log() iniettato in tutti i service admin (Customer, Invoice, Accounting, User, Settings, Upload) ✓
- [x] **RBAC backend** — `@PreAuthorize` su tutti i controller admin (SUPER_ADMIN, STORE_MANAGER, EMPLOYEE) ✓
- [x] **RBAC frontend** — sidebar filtrata per ruolo, route guard in layout.tsx, `hasRole()` in auth store ✓
- [x] **Migration V15** — tabelle `warehouse_stock`, `warehouse_movements` ✓
- [x] **Warehouse backend** — WarehouseStock, WarehouseMovement entity, MovementType enum, WarehouseService, AdminWarehouseController ✓
- [x] **Warehouse API** — GET /stock, GET /low-stock, POST /adjust, GET /movements ✓
- [x] **Invoice integration** — scarico automatico magazzino quando fattura diventa PAGATA ✓
- [x] **Dashboard magazzino** — `/magazzino` con tabs giacenze/movimenti/scorte basse/import, dialog nuovo movimento ✓
- [x] **SKU prodotti** — Migration V16: campo `sku` (codice univoco) su products, visibile in ProductForm e tabella giacenze ✓
- [x] **Import bulk** — WarehouseImportService (CSV + XLSX via OpenCSV + Apache POI), endpoint POST `/v1/admin/warehouse/import` ✓
- [x] **Selettore prodotto fatture** — "Collega prodotto" per ogni riga fattura, auto-compila descrizione + prezzo ✓

### Fase 4a — Redesign Login Admin
- [x] **Split layout** — metà sinistra hero visuale (gradiente caffè/brand + steam animation), metà destra form login ✓
- [x] **Animazioni** — staggered fade-in, shake su errore, steam su icona, grain texture, glow pulse ✓
- [x] **Glass morphism** — card `bg-white/70 backdrop-blur-xl` su sfondo brand ✓
- [x] **Branding** — logo Espressamente, "Area Amministrazione", Georgia serif, warm palette ✓
- [x] **Mobile responsive** — single column con logo condensato su mobile ✓
- [x] **Security badge** — "Connessione protetta" con icona Lock ✓

### Fase 4a-bis — Reset Password
- [x] **Migration V17** — campi `password_reset_token` + `password_reset_token_expiry` su `admin_users` ✓
- [x] **Backend** — `POST /v1/auth/forgot-password` (genera token UUID, invia email) + `POST /v1/auth/reset-password` (valida token, aggiorna password) ✓
  - Token scade dopo 30 minuti, risposta uniforme per non rivelare se l'email esiste
  - Audit: PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS
- [x] **Email HTML** — template branded con pulsante "Reimposta Password" via `EmailService.sendPasswordResetEmail()` ✓
- [x] **Frontend** — link "Password dimenticata?" nel login, pagina `/forgot-password`, pagina `/reset-password?token=...` ✓
- [x] **Middleware** — rotte pubbliche `/forgot-password` e `/reset-password` aggiunte in `proxy.ts` ✓

### Fase 4b — Hardening Sicurezza E2E
- [ ] **CSP header** — aggiungere `Content-Security-Policy` in Nginx (protezione XSS)
- [x] **Cookie flags** — `Secure` (via `app.cookie.secure`), `SameSite=Strict` in prod / `Lax` in dev, `HttpOnly` ✓
- [x] **Brute force protection** — max 5 tentativi per username in 15 minuti, poi 429 Too Many Requests ✓
- [x] **Account lockout** — blocco temporaneo 15 min con auto-reset, in-memory ConcurrentHashMap ✓
- [x] **Audit login failures** — LOGIN_FAILED, LOGIN_SUCCESS, ACCOUNT_LOCKED in `admin_audit_logs` ✓
- [ ] **CORS restrittivo prod** — limitare `allowed-origins` ai soli domini di produzione
- [ ] **JWT secret rotation** — strategia per ruotare il secret senza invalidare sessioni attive
- [ ] **Password policy** — minimo 12 caratteri, complessità, no password comuni (backend validation)

### Manutenzione / miglioramenti futuri
- [ ] Configurare **backup automatico DB** (cron + pg_dump)
- [ ] Aggiungere **monitoring alerting** (uptime check)
- [ ] Valutare **pgAdmin prod network** quando prod è attivo
- [ ] **Export CSV** richieste dalla dashboard

---

## Architettura Moduli

### Package Structure (feature-based)
```
it.espressamente.api/
├── common/        → BaseEntity, ApiResponse, config (Security, Web, Encryption), exception
├── auth/          → AuthController, JwtService, JwtAuthFilter, AdminUser, RefreshToken, Store, UserRole
├── product/       → Product, Brand, Category + controller/service/repository (pubblico + admin)
├── cms/           → Page + controller/service/repository (pubblico + admin)
├── contact/       → ContactRequest, ServiceRequest, ComodatoRequest + form submission
├── customer/      → Customer CRM, CustomerInteraction + CRUD admin
├── invoice/       → Invoice, InvoiceItem, AccountingEntry + fatturazione e contabilità
├── admin/         → Dashboard stats, settings, upload, audit log
├── warehouse/     → WarehouseStock, WarehouseMovement + gestione giacenze
└── notification/  → EmailService
```

### Database Schema (Flyway Migrations)
| Versione | Contenuto |
|----------|-----------|
| V1 | Schema iniziale (products, categories, brands, pages, contact_requests, service_requests, admin_users) |
| V2 | Seed data |
| V3 | Tabella `refresh_tokens` (JWT) |
| V4 | Tabella `comodato_requests` |
| V5 | Campi aggiuntivi (client_type, vat_number, privacy_consent) |
| V6 | **CRM** — `customers`, `customer_interactions` + FK su richieste esistenti |
| V7 | **Billing** — `invoices`, `invoice_items` + sequence numerazione |
| V8 | **Accounting** — `accounting_entries` |
| V9 | Fix — colonna `updated_at` aggiunta a `customer_interactions` e `invoice_items` |
| V10 | **Cifratura** — colonne TEXT su customers, contact_requests, service_requests, comodato_requests |
| V11 | **Audit** — tabella `admin_audit_logs` |
| V12 | Fix — colonna `privacy_consent` su `service_requests` |
| V13 | Fix — URL upload |
| V14 | **Ruoli & Negozi** — tabella `stores`, campi `role`/`store_id` su `admin_users` |
| V15 | **Warehouse** — tabelle `warehouse_stock`, `warehouse_movements` |
| V16 | **SKU** — campo `sku` (unique) su `products` |
| V17 | **Reset Password** — campi `password_reset_token`, `password_reset_token_expiry` su `admin_users` |

### API Endpoints
```
Pubblici (GET):
  /v1/products/**     — catalogo prodotti
  /v1/categories/**   — categorie
  /v1/brands/**       — brand
  /v1/pages/**        — pagine CMS

Form submission (POST):
  /v1/contact          — form contatto
  /v1/service-request  — richiesta assistenza
  /v1/comodato         — richiesta comodato

Auth:
  /v1/auth/login       — login admin
  /v1/auth/refresh     — refresh token
  /v1/auth/logout           — logout
  /v1/auth/forgot-password  — richiesta reset password (email)
  /v1/auth/reset-password   — reset password con token

Admin (autenticati JWT):
  /v1/admin/stats               — dashboard statistics
  /v1/admin/products/**         — CRUD prodotti
  /v1/admin/categories/**       — CRUD categorie
  /v1/admin/brands/**           — CRUD brand
  /v1/admin/pages/**            — CRUD pagine CMS
  /v1/admin/settings/password   — cambio password
  /v1/admin/customers/**        — CRM: CRUD clienti + interazioni
  /v1/admin/invoices/**         — Billing: CRUD fatture + stati
  /v1/admin/accounting/**       — Accounting: CRUD registrazioni + riepilogo
  /v1/admin/users/**            — Gestione dipendenti (SUPER_ADMIN only)
  /v1/admin/users/stores        — Lista negozi
  /v1/admin/warehouse/stock     — Giacenze magazzino
  /v1/admin/warehouse/low-stock — Scorte basse
  /v1/admin/warehouse/adjust    — Movimento magazzino (POST)
  /v1/admin/warehouse/movements — Storico movimenti
  /v1/admin/warehouse/import    — Import bulk da CSV/XLSX (POST, SUPER_ADMIN)
```

### Admin Dashboard Routes
```
/login              — pagina login
/                   — overview con statistiche
/prodotti           — lista prodotti + /nuovo + /[id]
/categorie          — CRUD categorie (dialog inline)
/brand              — CRUD brand (dialog inline)
/comodato           — richieste comodato + /[id] dettaglio
/contatti           — richieste contatto
/assistenza         — richieste assistenza
/pagine             — CMS pagine + /nuovo + /[slug] editor
/clienti            — CRM: lista clienti + /nuovo + /[id] dettaglio
/fatture            — Billing: lista fatture + /nuovo + /[id] dettaglio
/contabilita        — Accounting: registro + riepilogo
/dipendenti         — gestione dipendenti + /nuovo + /[id] (SUPER_ADMIN)
/magazzino          — Warehouse: giacenze, movimenti, scorte basse
/impostazioni       — profilo + cambio password
```

### Entità e Relazioni
```
Customer ──< ComodatoRequest
Customer ──< ContactRequest
Customer ──< ServiceRequest
Customer ──< CustomerInteraction
Customer ──< Invoice ──< InvoiceItem ──> Product (opzionale)
Invoice  ──< AccountingEntry (auto-creata al pagamento)
Customer ──< AccountingEntry (opzionale)
AdminUser ──< CustomerInteraction
AdminUser ──< RefreshToken
AdminUser ──> Store (opzionale, STORE_MANAGER/EMPLOYEE)
Store    ──< AdminUser
Category ──< Product
Brand    ──< Product
Product  ──< WarehouseStock ──> Store (opzionale)
Product  ──< WarehouseMovement ──> Store (opzionale)
Invoice  ──> WarehouseMovement (scarico automatico al pagamento)
```

## Build & Environment

### Java / Backend
- **Java 17 obbligatorio** — SEMPRE verificare con `java -version` prima di compilare. MAI usare Java 21 o 24.
- JAVA_HOME: `/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home`
- Build: `JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home mvn clean compile`
- Run locale: `cd backend && bash run.sh` (profilo `local`)
- Spring profiles: `local` (dev), `staging`, `prod`

### Node / Frontend
- Node 22+ con npm
- Frontend pubblico: `cd frontend && npm run dev` (porta 3010)
- Admin dashboard: `cd admin && npm run dev` (porta 3020)
- Build check: `npx next build`

### Docker (Server VPS)
- Volumi: verificare path case-sensitive (Ubuntu è case-sensitive, macOS no)
- Tutte le porte su `127.0.0.1`

## Disciplina di Sviluppo

### Dopo ogni modifica
- **Compilare subito** dopo ogni file modificato — non accumulare modifiche senza verificare
- Backend: `mvn compile` dopo ogni edit Java
- Frontend: `npx next build` dopo modifiche significative
- Se un fix introduce un bug secondario, **fermarsi e fixare prima di procedere**

### Full-stack changes
- Quando si modifica un endpoint backend, verificare SEMPRE che il frontend (types, API calls) sia allineato
- Controllare: DTO → API response → frontend type → componente che lo usa

### Comunicazione
- Quando l'utente contesta una scelta, **cambiare subito** senza difendere la posizione
- Non spiegare a lungo il perché — fare la modifica e basta
- Proattivamente controllare controller/endpoint mancanti prima di iniziare lavoro frontend che ne dipende

## Note Importanti
- Le password DB sono nel pgpass sul server, NON committate in git
- `.env.staging` e `.env.production` sono in `.gitignore` — vivono solo sul server
- Il backend usa il profilo Spring `staging` (non `prod`) in staging
- `NEXT_PUBLIC_API_URL` è baked al build time — cambiarlo richiede rebuild immagine
- JurixSuite occupa la porta 8080 — il backend prod espressamente usa 8082
- Tutte le porte Docker sono legate a `127.0.0.1` (non esposte a internet)
- DB condiviso tra tutti i moduli (no DB separati per microservizio)
- JWT secret via env var `JWT_SECRET` (min 256 bit) — non committare mai
- `DB_ENCRYPTION_KEY` via env var (32 byte base64) — non committare mai
- Admin dashboard in `admin/` — app Next.js separata, porta 3020 in locale
- Pagine legali: `/privacy-policy`, `/cookie-policy`, `/termini-di-spedizione-e-consegna`
