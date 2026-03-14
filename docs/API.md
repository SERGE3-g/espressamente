# Espressamente API — Documentazione v2.0.0

> Backend: Spring Boot 3.4.3 | Java 17 | PostgreSQL
> Base URL: `https://espressamente.eu/api` (prod) | `https://stg.espressamente.eu/api` (staging) | `http://localhost:8080/api` (local)

---

## Autenticazione

### Flow JWT

```
1. POST /v1/auth/login          → accessToken (15 min) + cookie refresh_token (7 gg)
2. Autorizzazione: Bearer <accessToken> su tutte le richieste /v1/admin/**
3. POST /v1/auth/refresh        → nuovo accessToken (refresh token ruotato automaticamente)
4. POST /v1/auth/logout         → revoca refresh token, cancella cookie
```

### Headers richiesti per endpoint admin

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Formato risposta standard

```json
{
  "success": true,
  "message": "Operazione completata",
  "data": { ... }
}
```

### Ruoli disponibili

| Ruolo | Accesso |
|-------|---------|
| `SUPER_ADMIN` | Tutto — utenti, import, audit |
| `STORE_MANAGER` | CRM, fatture, magazzino, prodotti |
| `EMPLOYEE` | Solo lettura dashboard e catalogo |

---

## 🔐 Auth

### `POST /v1/auth/login`
```json
// Request
{ "username": "admin", "password": "admin123" }

// Response 200
{
  "data": {
    "accessToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@espressamente.eu",
    "role": "SUPER_ADMIN",
    "storeId": null,
    "storeName": null
  }
}

// Response 401 — credenziali errate
// Response 423 — account bloccato (5 tentativi falliti)
// Response 429 — IP bloccato (10 tentativi in 15 min)
```

### `POST /v1/auth/forgot-password`
```json
{ "email": "admin@espressamente.eu" }
// Risposta sempre 200 (non rivela se l'email esiste)
// Email inviata con token valido 30 min
```

### `POST /v1/auth/reset-password`
```json
{ "token": "uuid-token", "newPassword": "NuovaPassword123!" }
```

---

## ☕ Prodotti (Pubblico)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/v1/products` | Lista paginata. Query: `type`, `page`, `size` |
| GET | `/v1/products/featured` | Prodotti in evidenza |
| GET | `/v1/products/search?q=...` | Ricerca full-text |
| GET | `/v1/products/by-category/{slug}` | Per categoria |
| GET | `/v1/products/by-brand/{slug}` | Per brand |
| GET | `/v1/products/{slug}` | Dettaglio prodotto |

### Tipi prodotto (`productType`)
`CAFFE` | `MACCHINA` | `ACCESSORIO`

---

## 🏷️ Categorie & Brand (Pubblico)

```
GET /v1/categories          Lista categorie
GET /v1/categories/{slug}   Dettaglio
GET /v1/brands              Lista brand
GET /v1/brands/{slug}       Dettaglio
```

---

## 📄 CMS Pagine (Pubblico)

```
GET /v1/pages               Solo pagine published=true
GET /v1/pages/{slug}        Dettaglio (solo se published)
```

---

## 📬 Form Pubblici

### `POST /v1/contact`
```json
{
  "fullName": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+39 333 1234567",
  "companyName": "Bar Roma",
  "subject": "Informazioni",
  "message": "...",
  "contactType": "GENERALE",
  "privacyConsent": true
}
```

### `POST /v1/service-request`
```json
{
  "fullName": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+39 333 1234567",
  "machineType": "Automatica",
  "machineBrand": "De'Longhi",
  "machineModel": "Magnifica S",
  "issueDescription": "...",
  "preferredDate": "2026-04-01",
  "privacyConsent": true
}
```

### `POST /v1/comodato`
```json
{
  "clientType": "AZIENDA",
  "vatNumber": "IT01234567890",
  "fullName": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+39 333 1234567",
  "companyName": "Bar Roma Srl",
  "address": "Via Roma 1",
  "city": "Roma",
  "province": "RM",
  "machineName": "De'Longhi Magnifica S",
  "deliveryType": "CONSEGNA",
  "privacyConsent": true
}
```

---

## 📊 Admin — Dashboard

```
GET  /v1/admin/stats                         Statistiche generali
POST /v1/admin/upload                        Upload immagine (multipart, field: file, max 10MB)
GET  /v1/admin/audit?page=0&size=50          Audit log (SUPER_ADMIN)
PUT  /v1/admin/settings/password             Cambio password
```

---

## 🛍️ Admin — Prodotti `(SUPER_ADMIN)`

| Metodo | Endpoint | Body |
|--------|----------|------|
| GET | `/v1/admin/products` | — |
| POST | `/v1/admin/products` | ProductRequest |
| PUT | `/v1/admin/products/{id}` | ProductRequest |
| DELETE | `/v1/admin/products/{id}` | — |

```json
// ProductRequest
{
  "sku": "CAF-001",
  "name": "Arabica Colombia",
  "shortDescription": "...",
  "description": "<p>HTML...</p>",
  "productType": "CAFFE",
  "price": 12.90,
  "priceLabel": "250g",
  "categoryId": 1,
  "brandId": 1,
  "images": ["/api/uploads/img.jpg"],
  "features": [{ "label": "Origine", "value": "Colombia" }],
  "isFeatured": false,
  "isActive": true,
  "sortOrder": 0
}
```

---

## 👥 Admin — CRM Clienti `(SUPER_ADMIN, STORE_MANAGER)`

| Metodo | Endpoint | Note |
|--------|----------|------|
| GET | `/v1/admin/customers?search=&clientType=&page=0&size=20` | Ricerca in-memory post-decrypt |
| GET | `/v1/admin/customers/{id}` | |
| POST | `/v1/admin/customers` | |
| PUT | `/v1/admin/customers/{id}` | |
| DELETE | `/v1/admin/customers/{id}` | |
| GET | `/v1/admin/customers/{id}/interactions` | |
| POST | `/v1/admin/customers/{id}/interactions` | |
| DELETE | `/v1/admin/customers/{id}/interactions/{iid}` | |

> **Nota:** I campi `fullName`, `email`, `phone` sono cifrati AES-256-GCM nel DB. La ricerca avviene in-memory dopo decrypt.

---

## 🧾 Admin — Fatture `(SUPER_ADMIN, STORE_MANAGER)`

| Metodo | Endpoint | Note |
|--------|----------|------|
| GET | `/v1/admin/invoices` | Filtri: status, search, dateFrom, dateTo |
| GET | `/v1/admin/invoices/{id}` | |
| POST | `/v1/admin/invoices` | |
| PUT | `/v1/admin/invoices/{id}` | |
| PATCH | `/v1/admin/invoices/{id}/status?status=INVIATA` | |
| DELETE | `/v1/admin/invoices/{id}` | |
| GET | `/v1/admin/invoices/{id}/pdf` | Ritorna PDF binary |
| POST | `/v1/admin/invoices/{id}/send-email` | Invia PDF al cliente |
| GET | `/v1/admin/invoices/export/csv` | Export CSV |

### Ciclo stati fattura
```
BOZZA → INVIATA → PAGATA
              ↓
           SCADUTA
BOZZA/INVIATA → ANNULLATA
```

> Al pagamento (`PAGATA`) viene creata automaticamente una registrazione ENTRATA in Contabilità e uno SCARICO in Magazzino.

---

## 💰 Admin — Contabilità `(SUPER_ADMIN, STORE_MANAGER)`

```
GET  /v1/admin/accounting                           Lista con filtri
GET  /v1/admin/accounting/summary?from=&to=         Riepilogo totali
GET  /v1/admin/accounting/profit-loss?from=&to=     Conto economico
GET  /v1/admin/accounting/export/csv                Export CSV
POST /v1/admin/accounting                           Nuova registrazione
PUT  /v1/admin/accounting/{id}
DELETE /v1/admin/accounting/{id}
```

---

## 📦 Admin — Magazzino `(SUPER_ADMIN, STORE_MANAGER)`

```
GET  /v1/admin/warehouse/stock                  Giacenze correnti
GET  /v1/admin/warehouse/low-stock              Prodotti sotto soglia
GET  /v1/admin/warehouse/movements?productId=   Storico movimenti
POST /v1/admin/warehouse/adjust                 Movimento manuale
POST /v1/admin/warehouse/import                 Import bulk CSV/XLSX (SUPER_ADMIN)
```

### Tipi movimento (`movementType`)
`CARICO` | `SCARICO` | `RETTIFICA` | `VENDITA` | `RESO`

### Formato CSV import
```csv
sku,quantity,reorderPoint
CAF-001,100,10
MAC-001,5,2
```

---

## 👤 Admin — Dipendenti `(SUPER_ADMIN)`

```
GET    /v1/admin/users
GET    /v1/admin/users/{id}
POST   /v1/admin/users
PUT    /v1/admin/users/{id}
PATCH  /v1/admin/users/{id}/toggle-active
GET    /v1/admin/users/stores
```

---

## 📥 Admin — Richieste

```
GET   /v1/admin/contacts?status=&page=0                    Lista contatti
PATCH /v1/admin/contacts/{id}/status?status=IN_PROGRESS    Cambia stato

GET   /v1/admin/service-requests?page=0                    Lista assistenza
PATCH /v1/admin/service-requests/{id}/status?status=...    Cambia stato

GET   /v1/admin/comodato?status=&page=0                    Lista comodato
GET   /v1/admin/comodato/{id}                              Dettaglio
PATCH /v1/admin/comodato/{id}/status?status=...&internalNotes=...
```

### Valori stato (`RequestStatus`)
`PENDING` | `IN_PROGRESS` | `COMPLETED` | `CLOSED`

---

## Codici di errore

| Codice | Significato |
|--------|-------------|
| 400 | Validazione fallita (campo mancante o non valido) |
| 401 | Token mancante, scaduto o credenziali errate |
| 403 | Ruolo non sufficiente |
| 404 | Risorsa non trovata |
| 409 | Conflitto (es. SKU duplicato) |
| 423 | Account bloccato (troppi tentativi falliti) |
| 429 | IP bloccato per brute force |
| 500 | Errore server interno |

---

## Note di sicurezza

- **Access token:** 15 minuti, trasmesso nell'header `Authorization: Bearer`
- **Refresh token:** 7 giorni, httpOnly cookie, ruotato ad ogni refresh
- **Brute force:** 5 tentativi/15min per username, 10 per IP → lockout + email alert admin
- **Campi cifrati:** fullName, email, phone, address nei modelli Customer/Contact/Service/Comodato (AES-256-GCM)
- **CORS:** configurato per i domini `espressamente.eu` e `stg.espressamente.eu`
