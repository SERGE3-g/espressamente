# Guida al Deploy

## Architettura di Produzione

```
Internet
   │
   ▼
Nginx (nativo sull'host, porta 80/443)
   ├── espressamente.eu      → 127.0.0.1:3010  (frontend)
   │                         → 127.0.0.1:8082/api (backend)
   └── stg.espressamente.eu  → 127.0.0.1:3011  (frontend staging)
                              → 127.0.0.1:8081/api (backend staging)

Docker (produzione):
  esp-prod-frontend   → porta 3010
  esp-prod-backend    → porta 8082
  esp-prod-db         → PostgreSQL (interno)
  esp-prod-redis      → Redis (interno)

Docker (staging):
  esp-staging-frontend → porta 3011
  esp-staging-backend  → porta 8081
  esp-staging-db       → PostgreSQL (interno)
  esp-staging-redis    → Redis (interno)
```

## Server VPS

- **Provider:** IONOS
- **IP:** 217.154.119.208
- **OS:** Ubuntu 22.04 LTS
- **Deploy dir:** `/opt/espressamente/`

```
/opt/espressamente/
├── repo/          # Clone del repository GitHub
├── production/
│   └── .env.production
└── staging/
    └── .env.staging
```

## Setup Iniziale Server

Lo script `scripts/server-setup.sh` esegue tutto il setup dal zero:

```bash
# Sul server come root (una volta sola):
bash /opt/espressamente/repo/scripts/server-setup.sh
```

Lo script installa: Docker, Nginx, Certbot, UFW, clona il repo.

### Setup manuale passo per passo

**1. Docker**
```bash
curl -fsSL https://get.docker.com | sh
```

**2. Nginx**
```bash
apt install -y nginx
cp /opt/espressamente/repo/docker/nginx/nginx.conf /etc/nginx/nginx.conf
cp /opt/espressamente/repo/docker/nginx/espressamente.eu.conf /etc/nginx/sites-enabled/
cp /opt/espressamente/repo/docker/nginx/stg.espressamente.eu.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

**3. SSL (Let's Encrypt)**
```bash
apt install -y certbot
# Ferma Nginx temporaneamente per la challenge standalone
systemctl stop nginx
certbot certonly --standalone -d espressamente.eu -d www.espressamente.eu
certbot certonly --standalone -d stg.espressamente.eu
systemctl start nginx
```

I certificati vengono salvati in `/etc/letsencrypt/live/espressamente.eu/`.

Rinnovo automatico:
```bash
certbot renew --dry-run   # test
# Il cron di certbot gestisce il rinnovo automatico
```

**4. Firewall (UFW)**
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## File di Configurazione

### Nginx

I file sono in `docker/nginx/`:

**`nginx.conf`** — Config globale (copia in `/etc/nginx/nginx.conf`):
- worker_processes: auto
- gzip compression
- rate limiting: 10 req/s per IP
- client max body: 20M
- include sites-enabled/*

**`espressamente.eu.conf`** (produzione):
```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name espressamente.eu www.espressamente.eu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name espressamente.eu www.espressamente.eu;

    ssl_certificate /etc/letsencrypt/live/espressamente.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/espressamente.eu/privkey.pem;

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8082;
    }
}
```

**`stg.espressamente.eu.conf`** (staging):
- Stesso schema ma porte 3011/8081

### Variables d'ambiente

Copiare i file `.env.*.example` e riempire i valori reali:

```bash
# Produzione
cp .env.production.example /opt/espressamente/production/.env.production
nano /opt/espressamente/production/.env.production

# Staging
cp .env.staging.example /opt/espressamente/staging/.env.staging
nano /opt/espressamente/staging/.env.staging
```

**Variabili richieste:**

```bash
# Database
DB_USERNAME=<user>
DB_PASSWORD=<password>

# JWT (genera con: openssl rand -base64 64)
JWT_SECRET=<secret>

# Mail (Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<email>@gmail.com
MAIL_PASSWORD=<app-password>     # NON la password account, usa App Password
NOTIFICATION_EMAIL=<destinatario>

# Storage
STORAGE_TYPE=local               # oppure s3

# Docker (per i deploy scripts)
TAG=latest                       # oppure staging
REPO_OWNER=serge3-g
```

**Nota Gmail App Password:** per generarla, vai su account Google → Sicurezza → Verifica in due passaggi → Password per le app.

## CI/CD (GitHub Actions)

### Panoramica

```
Push su develop ──► CI (lint+test) ──► CD (build+push) ──► Deploy Staging
Push su master  ──► CI (lint+test) ──► CD (build+push) ──► Deploy Prod (disabilitato)
```

### GitHub Secrets necessari

| Secret | Valore |
|--------|--------|
| `VPS_HOST` | `217.154.119.208` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Chiave privata SSH (es. `~/.ssh/espressamente_deploy`) |
| `GHCR_TOKEN` | GitHub PAT con scope `read:packages` |

**Generare la chiave SSH deploy:**
```bash
# Sulla macchina locale
ssh-keygen -t ed25519 -C "github-actions-espressamente" -f ~/.ssh/espressamente_deploy

# Copiare la chiave pubblica sul server
ssh-copy-id -i ~/.ssh/espressamente_deploy.pub root@217.154.119.208

# Il contenuto di ~/.ssh/espressamente_deploy (privata) va in VPS_SSH_KEY
cat ~/.ssh/espressamente_deploy
```

### Workflow CI (`.github/workflows/ci.yml`)

Trigger: push/PR su `master`, `main`, `develop`

**Job frontend:**
1. Node.js 20, cache npm
2. `tsc --noEmit` — TypeScript check
3. `npm run lint` — ESLint
4. `npm run build` — build produzione

**Job backend:**
1. Java 17, cache Maven
2. PostgreSQL 16 service container
3. `mvn test -q` — unit + integration tests

### Workflow CD (`.github/workflows/cd.yml`)

Trigger: push su `master`, `main`, `develop`

**Job setup:** calcola `image_tag` e `environment` in base al branch.

**Job build-and-push:**
- Buildx con cache GitHub Actions (veloce per rebuild)
- Frontend: build con `NEXT_PUBLIC_API_URL` corretto (prod vs staging)
- Backend: build standard
- Push su `ghcr.io/serge3-g/espressamente-{frontend,backend}:{tag}`

**Job deploy-staging** (se `develop`):
```bash
# Sul server via SSH (appleboy/ssh-action)
export GHCR_TOKEN="..."
export TAG="<commit-sha>"
export REPO_OWNER="serge3-g"
bash /opt/espressamente/repo/scripts/deploy-staging.sh
```

**Job deploy-prod** (se `master`):
- Attualmente disabilitato: `if: false`
- Per abilitare, rimuovere quella riga da `cd.yml`

### Script di Deploy

**`scripts/deploy-staging.sh`:**
1. `git checkout develop && git pull --ff-only`
2. `docker login ghcr.io`
3. `docker compose pull` (scarica nuove immagini)
4. `docker compose up -d --remove-orphans`
5. `docker image prune -f`

**`scripts/deploy-prod.sh`:** identico per produzione.

## Docker

### Immagini GHCR

Le immagini vengono pubblicate automaticamente dal CD:

```
ghcr.io/serge3-g/espressamente-frontend:latest     # produzione
ghcr.io/serge3-g/espressamente-frontend:staging    # staging
ghcr.io/serge3-g/espressamente-frontend:<sha>      # commit specifico

ghcr.io/serge3-g/espressamente-backend:latest
ghcr.io/serge3-g/espressamente-backend:staging
ghcr.io/serge3-g/espressamente-backend:<sha>
```

### Comandi utili sul server

```bash
# Vedere tutti i container
docker ps

# Log di un container
docker logs esp-prod-frontend --tail 50 -f
docker logs esp-prod-backend --tail 50 -f
docker logs esp-staging-backend --tail 50 -f

# Restart di un singolo container
docker compose -f /opt/espressamente/repo/docker/docker-compose.staging.yml \
  --env-file /opt/espressamente/staging/.env.staging \
  up -d --force-recreate backend

# Fermare tutto lo staging
docker compose -f /opt/espressamente/repo/docker/docker-compose.staging.yml down

# Fermare e cancellare i volumi (reset DB)
docker compose -f /opt/espressamente/repo/docker/docker-compose.staging.yml down -v

# Verificare variabili d'ambiente in un container
docker exec esp-staging-backend env | grep -E "SPRING|MAIL|DB"
```

### Dockerfile Backend

```
Stage 1: maven:3.9-eclipse-temurin-17
  - mvn package -DskipTests -q
Stage 2: eclipse-temurin:17-jre-alpine
  - COPY app.jar
  - USER spring (UID 1001)
  - EXPOSE 8080
  - ENTRYPOINT java -jar app.jar
```

### Dockerfile Frontend

```
Stage 1: node:20-alpine
  - npm ci

Stage 2: node:20-alpine
  - npm run build (Next.js standalone output)

Stage 3: node:20-alpine
  - COPY .next/standalone + .next/static + public
  - USER nextjs (UID 1001)
  - EXPOSE 3010
  - CMD node server.js
```

## Abilitare il Deploy di Produzione

Quando lo staging è stato validato:

1. Rimuovere `if: false` da `.github/workflows/cd.yml` (job `deploy-prod`)
2. Merge `develop → master`
3. Verificare che il job "Deploy Produzione" sia verde

```bash
# Su develop, dopo la validazione staging:
git checkout master
git merge develop --no-ff -m "chore: promote staging to production"
git push origin master
```

## Troubleshooting

### Container non si avvia

```bash
docker logs <container-name> --tail 50
```

Cause comuni:
- DB non raggiungibile: verificare healthcheck su `esp-*-db`
- Variabili d'ambiente mancanti: `docker inspect <container> | grep -A 20 Env`
- Porta già in uso: `ss -tlnp | grep <porta>`

### Database non esiste

Se il DB viene ricreato da zero (nuovi volumi), Flyway applica le migration automaticamente. Se il DB è corrotto:

```bash
docker compose -f docker/docker-compose.staging.yml down -v
docker compose -f docker/docker-compose.staging.yml --env-file .env.staging up -d
```

### Email non arrivano

1. Verificare credenziali: `docker exec esp-*-backend env | grep MAIL`
2. Verificare log: `docker logs esp-*-backend | grep -i mail`
3. Gmail: assicurarsi di usare **App Password** (non password account)
4. Verificare che STARTTLS sia abilitato in `application.yml`:
   ```yaml
   mail.smtp.starttls.enable: true
   mail.smtp.auth: true
   ```

### Nginx non passa il traffico

```bash
nginx -t                    # test configurazione
systemctl status nginx      # stato servizio
journalctl -u nginx --tail 20  # log recenti
```

### SSL scaduto / non rinnovato

```bash
certbot renew
systemctl reload nginx
```
