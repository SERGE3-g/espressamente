#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# server-status.sh — Dashboard DevOps infrastruttura VPS
#
# Uso:
#   bash server-status.sh          # vista completa
#   bash server-status.sh --short  # riepilogo rapido
#   bash server-status.sh --logs   # ultimi log errori
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colori ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ── Opzioni ───────────────────────────────────────────────────────────────────
SHORT=false
SHOW_LOGS=false
for arg in "$@"; do
  [[ "$arg" == "--short" ]] && SHORT=true
  [[ "$arg" == "--logs"  ]] && SHOW_LOGS=true
done

# ── Helpers ───────────────────────────────────────────────────────────────────
hr()   { printf "${DIM}%s${RESET}\n" "$(printf '─%.0s' $(seq 1 70))"; }
hdr()  { echo; printf "${BOLD}${CYAN}▶  %s${RESET}\n" "$1"; hr; }
ok()   { printf "  ${GREEN}✔${RESET}  %s\n" "$1"; }
warn() { printf "  ${YELLOW}⚠${RESET}  %s\n" "$1"; }
err()  { printf "  ${RED}✖${RESET}  %s\n" "$1"; }
info() { printf "  ${DIM}%s${RESET}\n" "$1"; }

# ── Stato container ───────────────────────────────────────────────────────────
container_status() {
  local name="$1"
  local state
  state=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null || echo "missing")
  local health
  health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}—{{end}}' "$name" 2>/dev/null || echo "—")

  case "$state" in
    running)
      if [[ "$health" == "healthy" || "$health" == "—" ]]; then
        printf "${GREEN}%-12s${RESET}" "running"
      else
        printf "${YELLOW}%-12s${RESET}" "starting"
      fi
      ;;
    exited|dead) printf "${RED}%-12s${RESET}" "$state" ;;
    missing)     printf "${DIM}%-12s${RESET}" "not found" ;;
    *)           printf "${YELLOW}%-12s${RESET}" "$state" ;;
  esac
}

# ── Uptime container ──────────────────────────────────────────────────────────
container_uptime() {
  local name="$1"
  docker inspect --format '{{.State.StartedAt}}' "$name" 2>/dev/null \
    | xargs -I{} date -d {} +"%d/%m %H:%M" 2>/dev/null || echo "—"
}

# ── Giorni alla scadenza SSL ───────────────────────────────────────────────────
ssl_days() {
  local domain="$1"
  local cert="/etc/letsencrypt/live/${domain}/fullchain.pem"
  if [[ -f "$cert" ]]; then
    local exp days
    exp=$(openssl x509 -enddate -noout -in "$cert" 2>/dev/null | cut -d= -f2)
    days=$(( ( $(date -d "$exp" +%s) - $(date +%s) ) / 86400 ))
    echo "$days"
  else
    echo "-1"
  fi
}

ssl_status() {
  local days="$1"
  if   [[ "$days" -lt 0  ]]; then printf "${DIM}not found${RESET}"
  elif [[ "$days" -lt 14 ]]; then printf "${RED}scade in %d gg${RESET}" "$days"
  elif [[ "$days" -lt 30 ]]; then printf "${YELLOW}scade in %d gg${RESET}" "$days"
  else                             printf "${GREEN}valido (%d gg)${RESET}" "$days"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# INTESTAZIONE
# ─────────────────────────────────────────────────────────────────────────────
clear
echo
printf "${BOLD}${MAGENTA}  ╔══════════════════════════════════════════════════════════╗${RESET}\n"
printf "${BOLD}${MAGENTA}  ║         SERVER STATUS — $(date '+%d/%m/%Y %H:%M:%S')         ║${RESET}\n"
printf "${BOLD}${MAGENTA}  ╚══════════════════════════════════════════════════════════╝${RESET}\n"

# ─────────────────────────────────────────────────────────────────────────────
# SISTEMA
# ─────────────────────────────────────────────────────────────────────────────
hdr "SISTEMA"

HOSTNAME=$(hostname -f 2>/dev/null || hostname)
IP_PUB=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
UPTIME=$(uptime -p 2>/dev/null | sed 's/up //')
LOAD=$(cut -d' ' -f1-3 /proc/loadavg)
CPU_CORES=$(nproc)
KERNEL=$(uname -r)

printf "  %-18s ${BOLD}%s${RESET}\n"  "Hostname:"   "$HOSTNAME"
printf "  %-18s ${BOLD}%s${RESET}\n"  "IP pubblico:" "$IP_PUB"
printf "  %-18s %s\n"                 "Uptime:"     "$UPTIME"
printf "  %-18s %s  ${DIM}(%s core)${RESET}\n" "Load avg:" "$LOAD" "$CPU_CORES"
printf "  %-18s %s\n"                 "Kernel:"     "$KERNEL"

# RAM
MEM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
MEM_USED=$(free -m  | awk '/^Mem:/{print $3}')
MEM_PCT=$(( MEM_USED * 100 / MEM_TOTAL ))
MEM_COLOR=$( [[ $MEM_PCT -gt 85 ]] && echo "$RED" || ([[ $MEM_PCT -gt 65 ]] && echo "$YELLOW" || echo "$GREEN") )
printf "  %-18s ${MEM_COLOR}%s MB / %s MB (%s%%)${RESET}\n" "RAM:" "$MEM_USED" "$MEM_TOTAL" "$MEM_PCT"

# Disco
DISK_INFO=$(df -h / | awk 'NR==2{print $3" / "$2" ("$5")"}')
DISK_PCT=$(df / | awk 'NR==2{print $5}' | tr -d '%')
DISK_COLOR=$( [[ $DISK_PCT -gt 85 ]] && echo "$RED" || ([[ $DISK_PCT -gt 70 ]] && echo "$YELLOW" || echo "$GREEN") )
printf "  %-18s ${DISK_COLOR}%s${RESET}\n" "Disco (/):" "$DISK_INFO"

$SHORT && { echo; exit 0; }

# ─────────────────────────────────────────────────────────────────────────────
# PROGETTI DOCKER
# ─────────────────────────────────────────────────────────────────────────────
hdr "PROGETTI DOCKER"

# ── Espressamente Produzione ──────────────────────────────────────────────────
echo
printf "  ${BOLD}${BLUE}● ESPRESSAMENTE — Produzione${RESET}  ${DIM}(espressamente.eu)${RESET}\n"
printf "  %-30s %-12s %-10s %s\n" "Container" "Stato" "Porta" "Avviato"
hr

for svc in "esp-prod-frontend:3010" "esp-prod-backend:8082" "esp-prod-db:-" "esp-prod-redis:-"; do
  name="${svc%%:*}"
  port="${svc##*:}"
  state=$(container_status "$name")
  started=$(container_uptime "$name")
  printf "  ${BOLD}%-30s${RESET} %b %-10s %s\n" "$name" "$state" "$port" "$started"
done

# ── Espressamente Staging ─────────────────────────────────────────────────────
echo
printf "  ${BOLD}${YELLOW}● ESPRESSAMENTE — Staging${RESET}  ${DIM}(stg.espressamente.eu)${RESET}\n"
printf "  %-30s %-12s %-10s %s\n" "Container" "Stato" "Porta" "Avviato"
hr

for svc in "esp-staging-frontend:3011" "esp-staging-backend:8081" "esp-staging-db:-" "esp-staging-redis:-"; do
  name="${svc%%:*}"
  port="${svc##*:}"
  state=$(container_status "$name")
  started=$(container_uptime "$name")
  printf "  ${BOLD}%-30s${RESET} %b %-10s %s\n" "$name" "$state" "$port" "$started"
done

# ── Altri progetti Docker ─────────────────────────────────────────────────────
OTHER=$(docker ps --format '{{.Names}}' 2>/dev/null \
  | grep -v '^esp-' || true)

if [[ -n "$OTHER" ]]; then
  echo
  printf "  ${BOLD}${MAGENTA}● ALTRI CONTAINER${RESET}\n"
  printf "  %-30s %-15s %-20s %s\n" "Container" "Stato" "Immagine" "Porte"
  hr
  while IFS= read -r cname; do
    cstate=$(docker inspect --format '{{.State.Status}}' "$cname" 2>/dev/null)
    cimage=$(docker inspect --format '{{.Config.Image}}' "$cname" 2>/dev/null | cut -c1-20)
    cports=$(docker inspect --format '{{range $p,$b := .NetworkSettings.Ports}}{{$p}} {{end}}' "$cname" 2>/dev/null | head -c 40)
    state_colored=""
    case "$cstate" in
      running) state_colored="${GREEN}running${RESET}" ;;
      exited)  state_colored="${RED}exited${RESET}" ;;
      *)       state_colored="${YELLOW}${cstate}${RESET}" ;;
    esac
    printf "  ${BOLD}%-30s${RESET} %-20b %-20s %s\n" "$cname" "$state_colored" "$cimage" "$cports"
  done <<< "$OTHER"
fi

# ── Riepilogo Docker ──────────────────────────────────────────────────────────
echo
TOTAL=$(docker ps -q | wc -l)
STOPPED=$(docker ps -aq --filter status=exited | wc -l)
IMAGES=$(docker images --format '{{.Repository}}' | wc -l)
VOLUMES=$(docker volume ls -q | wc -l)
printf "  ${DIM}Totale running: %s  |  Stoppati: %s  |  Immagini: %s  |  Volumi: %s${RESET}\n" \
  "$TOTAL" "$STOPPED" "$IMAGES" "$VOLUMES"

# ─────────────────────────────────────────────────────────────────────────────
# NGINX
# ─────────────────────────────────────────────────────────────────────────────
hdr "NGINX"

NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
if [[ "$NGINX_STATUS" == "active" ]]; then
  ok "nginx è in esecuzione"
else
  err "nginx NON è in esecuzione (stato: $NGINX_STATUS)"
fi

NGINX_VER=$(nginx -v 2>&1 | grep -oP 'nginx/\K[^ ]+' || echo "—")
info "versione: $NGINX_VER"
echo

if [[ -d /etc/nginx/sites-enabled ]]; then
  printf "  %-35s %-20s %s\n" "Virtual Host" "Config" "SSL"
  hr
  for conf in /etc/nginx/sites-enabled/*.conf; do
    [[ -f "$conf" ]] || continue
    fname=$(basename "$conf" .conf)
    domain=$(grep -m1 'server_name' "$conf" 2>/dev/null | awk '{print $2}' | tr -d ';' || echo "$fname")
    days=$(ssl_days "$fname")
    ssl_info=$(ssl_status "$days")
    printf "  %-35s %-20s %b\n" "$domain" "$(basename "$conf")" "$ssl_info"
  done
fi

# ─────────────────────────────────────────────────────────────────────────────
# CERTIFICATI SSL
# ─────────────────────────────────────────────────────────────────────────────
hdr "CERTIFICATI SSL"

if [[ -d /etc/letsencrypt/live ]]; then
  printf "  %-35s %-20s %s\n" "Dominio" "Scadenza" "Stato"
  hr
  for certdir in /etc/letsencrypt/live/*/; do
    [[ -d "$certdir" ]] || continue
    domain=$(basename "$certdir")
    [[ "$domain" == "README" ]] && continue
    cert="${certdir}fullchain.pem"
    if [[ -f "$cert" ]]; then
      exp=$(openssl x509 -enddate -noout -in "$cert" 2>/dev/null | cut -d= -f2)
      days=$(ssl_days "$domain")
      printf "  %-35s %-20s %b\n" "$domain" "$exp" "$(ssl_status "$days")"
    fi
  done
else
  warn "Nessun certificato Let's Encrypt trovato"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PORTE IN ASCOLTO
# ─────────────────────────────────────────────────────────────────────────────
hdr "PORTE IN ASCOLTO"

printf "  %-10s %-20s %s\n" "Porta" "Processo" "Indirizzo"
hr
ss -tlnp 2>/dev/null | awk 'NR>1 {
  split($4, addr, ":")
  port = addr[length(addr)]
  proc = $NF
  gsub(/users:\(\(/, "", proc)
  gsub(/\)\)/, "", proc)
  split(proc, p, ",")
  pname = p[1]
  gsub(/"/, "", pname)
  printf "  %-10s %-20s %s\n", port, pname, $4
}' | sort -t' ' -k1 -n | head -20

# ─────────────────────────────────────────────────────────────────────────────
# FIREWALL
# ─────────────────────────────────────────────────────────────────────────────
hdr "FIREWALL (UFW)"

UFW_STATUS=$(ufw status 2>/dev/null | head -1 | awk '{print $2}' || echo "unknown")
if [[ "$UFW_STATUS" == "active" ]]; then
  ok "UFW attivo"
  ufw status 2>/dev/null | grep -E "ALLOW|DENY" | while read -r line; do
    info "  $line"
  done
else
  warn "UFW non attivo (stato: $UFW_STATUS)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# LOG ERRORI (opzionale o con --logs)
# ─────────────────────────────────────────────────────────────────────────────
if $SHOW_LOGS; then
  hdr "LOG ERRORI RECENTI"

  echo
  printf "  ${BOLD}${BLUE}esp-prod-backend (ultimi errori):${RESET}\n"
  docker logs esp-prod-backend --tail 5 2>&1 | grep -iE "error|exception|warn" | head -5 \
    | while IFS= read -r line; do printf "  ${RED}%s${RESET}\n" "$line"; done || info "nessun errore recente"

  echo
  printf "  ${BOLD}${YELLOW}esp-staging-backend (ultimi errori):${RESET}\n"
  docker logs esp-staging-backend --tail 5 2>&1 | grep -iE "error|exception|warn" | head -5 \
    | while IFS= read -r line; do printf "  ${YELLOW}%s${RESET}\n" "$line"; done || info "nessun errore recente"

  echo
  printf "  ${BOLD}Nginx (ultimi errori):${RESET}\n"
  tail -5 /var/log/nginx/error.log 2>/dev/null \
    | while IFS= read -r line; do printf "  ${DIM}%s${RESET}\n" "$line"; done || info "nessun errore recente"
fi

# ─────────────────────────────────────────────────────────────────────────────
# FOOTER
# ─────────────────────────────────────────────────────────────────────────────
echo
hr
printf "  ${DIM}Aggiornato: $(date '+%d/%m/%Y %H:%M:%S')  |  Usa --logs per i log errori  |  --short per riepilogo rapido${RESET}\n"
echo
