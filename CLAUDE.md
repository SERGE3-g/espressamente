# CLAUDE.md — Espressamente Project

## Panoramica
Piattaforma e-commerce per negozio di caffè specializzato.
- **Frontend**: Next.js 16 + TypeScript + Tailwind v4 (porta 3010)
- **Backend**: Spring Boot 3.4.3 + Java 17 + PostgreSQL (porta 8080)
- **Server VPS**: 217.154.119.208 (IONOS Ubuntu 24.04)
- **SSH**: `ssh -i ~/.ssh/espressamente_deploy root@217.154.119.208`

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
- Login: admin@espressamente.eu / changeme123

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
  - `pgadmin.espressamente.eu.conf` (Basic Auth: /etc/nginx/.htpasswd-pgadmin)

## GitHub Secrets necessari
`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `GHCR_TOKEN`

---

## TODO — Da completare

### Alta priorità
- [ ] **Testare pgAdmin 2FA** — verificare che l'email arrivi con SMTP Gmail configurato
- [ ] **Testare connessione pgAdmin** a tutti i DB (Staging ✓, Prod spento, JurixSuite)
- [ ] **Validare staging completamente** — tutte le funzionalità (prodotti, form, email, ecc.)

### Prima del go-live produzione
- [ ] **Abilitare deploy prod** — rimuovere `if: false` da `.github/workflows/cd.yml` (job `deploy-prod`)
- [ ] **Merge develop → master** per triggerare il primo deploy prod automatico
- [ ] **Avviare container prod** sul server
- [ ] **Rimettere repo privato** su GitHub (era stato messo pubblico temporaneamente per il clone)

### Manutenzione server
- [ ] **Riavviare il server** per applicare l'aggiornamento del kernel (6.8.0-87 → 6.8.0-101)
  - Prima del reboot: verificare che tutti i container abbiano `restart: unless-stopped` ✓
  - Comando: `reboot` (i container si riavviano automaticamente)
- [ ] **Rinnovare certificati SSL scaduti** per JurixSuite:
  - `dev.jurixsuite.it` — scaduto
  - `staging.jurixsuite.it` — scaduto

### Miglioramenti futuri
- [ ] Aggiungere **Nginx config per JurixSuite** a `server-status.sh` (sezione Virtual Host)
- [ ] Configurare **backup automatico DB** (cron + pg_dump)
- [ ] Aggiungere **monitoring alerting** (es. uptime check via cron o servizio esterno)
- [ ] Valutare **pgAdmin prod network** — aggiungere rete `espressamente-prod_default` a devtools quando prod è attivo

## Note Importanti
- Le password DB sono nel pgpass sul server, NON committate in git
- `.env.staging` e `.env.production` sono in `.gitignore` — vivono solo sul server
- Il backend usa il profilo Spring `staging` (non `prod`) in staging
- `NEXT_PUBLIC_API_URL` è baked al build time — cambiarlo richiede rebuild immagine
- JurixSuite occupa la porta 8080 — il backend prod espressamente usa 8082
- Tutte le porte Docker sono legate a `127.0.0.1` (non esposte a internet)
