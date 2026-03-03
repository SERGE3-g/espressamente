#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-prod.sh — Deploy produzione (espressamente.eu)
#
# Eseguire sul server come root oppure via CI (GitHub Actions SSH).
# Variabili d'ambiente richieste:
#   GHCR_TOKEN  — GitHub PAT con scope read:packages
#   TAG         — SHA del commit o "latest" (default: latest)
#   REPO_OWNER  — owner del repo GitHub in minuscolo (default: serge3-g)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

DEPLOY_DIR="/opt/espressamente"
COMPOSE_FILE="${DEPLOY_DIR}/repo/docker/docker-compose.prod.yml"
ENV_FILE="${DEPLOY_DIR}/production/.env.production"
TAG="${TAG:-latest}"
REPO_OWNER="${REPO_OWNER:-serge3-g}"

echo "==> Deploy PRODUZIONE (tag: ${TAG})"

# ── Aggiorna i file di configurazione dal repo ────────────────────────────────
echo "--> git pull..."
git -C "${DEPLOY_DIR}/repo" pull --ff-only

# ── Login GHCR ───────────────────────────────────────────────────────────────
if [[ -n "${GHCR_TOKEN:-}" ]]; then
  echo "--> Login ghcr.io..."
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${REPO_OWNER}" --password-stdin
fi

# ── Pull nuove immagini ───────────────────────────────────────────────────────
echo "--> Pull immagini (tag: ${TAG})..."
TAG="${TAG}" REPO_OWNER="${REPO_OWNER}" \
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" pull

# ── Avvia / aggiorna i container ─────────────────────────────────────────────
echo "--> docker compose up -d..."
TAG="${TAG}" REPO_OWNER="${REPO_OWNER}" \
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans

# ── Pulizia immagini vecchie ──────────────────────────────────────────────────
echo "--> Pulizia immagini non utilizzate..."
docker image prune -f

echo "==> Deploy PRODUZIONE completato!"
