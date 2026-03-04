# REST API Reference

Base URL:
- **Locale:** `http://localhost:8080/api`
- **Staging:** `https://stg.espressamente.eu/api`
- **Produzione:** `https://espressamente.eu/api`

Swagger UI disponibile su `/api/swagger-ui.html`

---

## Autenticazione

Gli endpoint pubblici non richiedono autenticazione.

Gli endpoint admin (`/v1/admin/**`) richiedono un JWT nel header:
```
Authorization: Bearer <token>
```

---

## Prodotti

### Lista prodotti

```
GET /v1/products
```

**Query parameters:**

| Param | Tipo | Default | Descrizione |
|-------|------|---------|-------------|
| `page` | integer | `0` | Numero pagina (0-based) |
| `size` | integer | `12` | Elementi per pagina |
| `type` | string | — | `CAFFE`, `MACCHINA`, `ACCESSORIO` |
| `sort` | string | `name` | `name`, `price_asc`, `price_desc`, `newest` |

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Arabica Etiopia",
      "slug": "arabica-etiopia",
      "description": "...",
      "price": 12.50,
      "type": "CAFFE",
      "featured": true,
      "active": true,
      "images": ["url1", "url2"],
      "features": { "intensita": "media", "origine": "Etiopia" },
      "category": { "id": 1, "name": "Caffè Specialty", "slug": "caffe-specialty" },
      "brand": { "id": 1, "name": "illy", "slug": "illy" },
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "totalElements": 42,
  "totalPages": 4,
  "number": 0,
  "size": 12
}
```

---

### Prodotto per slug

```
GET /v1/products/{slug}
```

**Response:** oggetto `Product` (come sopra, singolo elemento)

**404** se non trovato.

---

### Prodotti in evidenza

```
GET /v1/products/featured
```

**Response:** array di `Product` con `featured: true`

---

### Ricerca prodotti

```
GET /v1/products/search?q={query}&page=0&size=12&sort=name
```

**Query parameters:**

| Param | Tipo | Descrizione |
|-------|------|-------------|
| `q` | string | Testo da cercare (nome, descrizione) |
| `page` | integer | Numero pagina |
| `size` | integer | Elementi per pagina |
| `sort` | string | Ordinamento |

**Response:** `PagedResponse<Product>`

---

### Prodotti per categoria

```
GET /v1/products/by-category/{categorySlug}?page=0&size=12&sort=name
```

**Response:** `PagedResponse<Product>`

---

### Prodotti per brand

```
GET /v1/products/by-brand/{brandSlug}?page=0&size=12&sort=name
```

**Response:** `PagedResponse<Product>`

---

## Categorie

### Lista categorie

```
GET /v1/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Caffè Specialty",
    "slug": "caffe-specialty",
    "description": "...",
    "productCount": 12
  }
]
```

---

## Brand

### Lista brand

```
GET /v1/brands
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "illy",
    "slug": "illy",
    "description": "...",
    "logoUrl": "https://...",
    "productCount": 8
  }
]
```

---

### Brand per slug

```
GET /v1/brands/{slug}
```

**Response:** oggetto `Brand` singolo + lista prodotti del brand.

---

## Pagine CMS

### Pagina per slug

```
GET /v1/pages/{slug}
```

Slugs disponibili: `chi-siamo`, ecc.

**Response:**
```json
{
  "id": 1,
  "slug": "chi-siamo",
  "title": "Chi Siamo",
  "content": "<p>HTML del contenuto...</p>",
  "metaDescription": "...",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**404** se non trovato (il frontend usa un fallback statico).

---

## Contatti

### Form contatti

```
POST /v1/contact
Content-Type: application/json
```

**Request body:**
```json
{
  "fullName": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+39 333 1234567",
  "subject": "Richiesta informazioni",
  "message": "Vorrei sapere...",
  "contactType": "INFO"
}
```

**contactType:** `INFO`, `PREVENTIVO`, `ASSISTENZA`, `ALTRO`

**Response 200:**
```json
{
  "success": true,
  "message": "Richiesta inviata con successo"
}
```

**Effetti collaterali:**
- Salva la richiesta nel DB (tabella `contact_requests`)
- Invia email di notifica a `NOTIFICATION_EMAIL`

---

### Richiesta assistenza tecnica

```
POST /v1/service-request
Content-Type: application/json
```

**Request body:**
```json
{
  "fullName": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+39 333 1234567",
  "machineBrand": "De'Longhi",
  "machineModel": "Magnifica Start",
  "purchaseYear": 2022,
  "issueDescription": "La macchina non scalda...",
  "urgency": "NORMALE"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Richiesta assistenza inviata"
}
```

---

## Tipi e Enum

### ProductType
```
CAFFE       - Prodotti caffè
MACCHINA    - Macchine per caffè
ACCESSORIO  - Accessori
```

### ContactType
```
INFO         - Richiesta informazioni
PREVENTIVO   - Richiesta preventivo
ASSISTENZA   - Assistenza tecnica
ALTRO        - Altro
```

### RequestStatus
```
NUOVO         - Appena ricevuta
IN_LAVORAZIONE - In gestione
COMPLETATO    - Gestita
ARCHIVIATO    - Archiviata
```

---

## Errori

Tutti gli errori usano il formato standard:

```json
{
  "timestamp": "2025-01-15T10:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with slug: xyz",
  "path": "/api/v1/products/xyz"
}
```

| Status | Significato |
|--------|-------------|
| 200 | OK |
| 400 | Bad Request (validazione fallita) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Admin Endpoints (Autenticati)

> Richiedono `Authorization: Bearer <jwt>`

### Prodotti

```
POST   /v1/admin/products          # Crea prodotto
PUT    /v1/admin/products/{id}     # Aggiorna prodotto
DELETE /v1/admin/products/{id}     # Soft delete
```

### Dashboard

```
GET /v1/admin/dashboard    # Statistiche: prodotti, richieste, ecc.
```

---

## Note CORS

Gli endpoint API accettano richieste da:
- `http://localhost:3010` (sviluppo)
- `https://espressamente.eu` (produzione)
- `https://stg.espressamente.eu` (staging)

Configurato tramite `CORS_ORIGINS` nel backend.
