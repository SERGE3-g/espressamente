#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# server-setup.sh — Setup iniziale del VPS IONOS per Espressamente
#
# Da eseguire UNA SOLA VOLTA come root sul server:
#   curl -fsSL https://raw.githubusercontent.com/SERGE3-g/espressamente/master/scripts/server-setup.sh | bash
#
# Prerequisiti:
#   - Ubuntu 22.04 / Debian 12
#   - Accesso root
#   - DNS già configurato:
#       espressamente.eu     → IP del server
#       www.espressamente.eu → IP del server
#       stg.espressamente.eu → IP del server
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO="https://github.com/SERGE3-g/espressamente"
DEPLOY_DIR="/opt/espressamente"
APP_USER="espressamente"

echo "=========================================="
echo "  Espressamente — Setup VPS"
echo "=========================================="

# ── 0. Verifica root ─────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo "Errore: eseguire come root" && exit 1
fi

# ── 1. Aggiornamento sistema ──────────────────────────────────────────────────
echo "[1/8] Aggiornamento pacchetti..."
apt-get update -q && apt-get upgrade -y -q

# ── 2. Dipendenze base ────────────────────────────────────────────────────────
echo "[2/8] Installazione dipendenze base..."
apt-get install -y -q \
  curl wget git unzip ca-certificates gnupg lsb-release \
  ufw fail2ban

# ── 3. Docker ─────────────────────────────────────────────────────────────────
echo "[3/8] Installazione Docker..."
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -q
  apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
  echo "Docker installato: $(docker --version)"
else
  echo "Docker già installato: $(docker --version)"
fi

# ── 4. Nginx ──────────────────────────────────────────────────────────────────
echo "[4/8] Installazione Nginx..."
apt-get install -y -q nginx
systemctl enable nginx

# ── 5. Certbot (Let's Encrypt) ────────────────────────────────────────────────
echo "[5/8] Installazione Certbot..."
apt-get install -y -q python3-certbot-nginx

# ── 6. Firewall UFW ───────────────────────────────────────────────────────────
echo "[6/8] Configurazione UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
echo "UFW status:"
ufw status

# ── 7. Struttura directory ────────────────────────────────────────────────────
echo "[7/8] Creazione struttura directory..."
mkdir -p "${DEPLOY_DIR}/production"
mkdir -p "${DEPLOY_DIR}/staging"
mkdir -p /var/www/certbot

# ── 8. Configurazione Nginx ───────────────────────────────────────────────────
echo "[8/8] Configurazione Nginx..."

# Clona il repo per ottenere i file di configurazione nginx
if [[ ! -d "${DEPLOY_DIR}/repo/.git" ]]; then
  git clone "${REPO}" "${DEPLOY_DIR}/repo"
else
  git -C "${DEPLOY_DIR}/repo" pull
fi

# Copia nginx.conf principale
cp "${DEPLOY_DIR}/repo/docker/nginx/nginx.conf" /etc/nginx/nginx.conf

# Copia virtual host configs
cp "${DEPLOY_DIR}/repo/docker/nginx/espressamente.eu.conf" \
   /etc/nginx/sites-available/espressamente.eu
cp "${DEPLOY_DIR}/repo/docker/nginx/stg.espressamente.eu.conf" \
   /etc/nginx/sites-available/stg.espressamente.eu

# Abilita i siti
ln -sf /etc/nginx/sites-available/espressamente.eu \
       /etc/nginx/sites-enabled/espressamente.eu
ln -sf /etc/nginx/sites-available/stg.espressamente.eu \
       /etc/nginx/sites-enabled/stg.espressamente.eu

# Rimuovi default nginx
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

echo ""
echo "=========================================="
echo "  Setup completato!"
echo "=========================================="
echo ""
echo "Prossimi passi:"
echo ""
echo "1. Crea i file di ambiente sul server:"
echo "   cp ${DEPLOY_DIR}/repo/.env.production.example ${DEPLOY_DIR}/production/.env.production"
echo "   cp ${DEPLOY_DIR}/repo/.env.staging.example   ${DEPLOY_DIR}/staging/.env.staging"
echo "   # Poi modifica i file con i valori reali"
echo ""
echo "2. Ottieni i certificati SSL:"
echo "   certbot --nginx -d espressamente.eu -d www.espressamente.eu"
echo "   certbot --nginx -d stg.espressamente.eu"
echo ""
echo "3. Configura i GitHub Secrets (Settings → Secrets):"
echo "   VPS_HOST     = 217.154.119.208"
echo "   VPS_USER     = root"
echo "   VPS_SSH_KEY  = <chiave privata SSH>"
echo "   GHCR_TOKEN   = <GitHub PAT con scope read:packages>"
echo ""
echo "4. Aggiungi la chiave pubblica SSH agli Authorized Keys:"
echo "   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys"
echo ""
echo "5. Fai il primo deploy manuale per testare:"
echo "   bash ${DEPLOY_DIR}/repo/scripts/deploy-prod.sh"
echo "   bash ${DEPLOY_DIR}/repo/scripts/deploy-staging.sh"