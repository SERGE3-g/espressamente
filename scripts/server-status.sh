#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# server-status.sh — Dashboard DevOps + Gestione interattiva
#
# Uso:
#   bash server-status.sh           # dashboard + menu interattivo
#   bash server-status.sh --short   # solo sistema (non interattivo)
#   bash server-status.sh --logs    # dashboard + log errori
#   bash server-status.sh --watch   # monitoraggio real-time
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colori ───────────────────────────────────────────────────────────────────
RED='\033[0;31m';    GREEN='\033[0;32m';  YELLOW='\033[1;33m'
BLUE='\033[0;34m';   CYAN='\033[0;36m';  MAGENTA='\033[0;35m'
BOLD='\033[1m';      DIM='\033[2m';       RESET='\033[0m'

# ── Opzioni ───────────────────────────────────────────────────────────────────
SHORT=false; SHOW_LOGS=false; WATCH=false
for arg in "$@"; do
  [[ "$arg" == "--short" ]] && SHORT=true
  [[ "$arg" == "--logs"  ]] && SHOW_LOGS=true
  [[ "$arg" == "--watch" ]] && WATCH=true
done

# ── Helpers ───────────────────────────────────────────────────────────────────
hr()   { printf "${DIM}%s${RESET}\n" "$(printf '─%.0s' $(seq 1 70))"; }
hdr()  { echo; printf "${BOLD}${CYAN}▶  %s${RESET}\n" "$1"; hr; }
ok()   { printf "  ${GREEN}✔${RESET}  %s\n" "$1"; }
warn() { printf "  ${YELLOW}⚠${RESET}  %s\n" "$1"; }
err()  { printf "  ${RED}✖${RESET}  %s\n" "$1"; }
info() { printf "  ${DIM}%s${RESET}\n" "$1"; }

container_status() {
  local name="$1"
  local state health
  state=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null || echo "missing")
  health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}—{{end}}' "$name" 2>/dev/null || echo "—")
  case "$state" in
    running) [[ "$health" == "healthy" || "$health" == "—" ]] \
               && printf "${GREEN}%-12s${RESET}" "running" \
               || printf "${YELLOW}%-12s${RESET}" "starting" ;;
    exited|dead) printf "${RED}%-12s${RESET}" "$state" ;;
    missing)     printf "${DIM}%-12s${RESET}" "not found" ;;
    *)           printf "${YELLOW}%-12s${RESET}" "$state" ;;
  esac
}

container_uptime() {
  docker inspect --format '{{.State.StartedAt}}' "$1" 2>/dev/null \
    | xargs -I{} date -d {} +"%d/%m %H:%M" 2>/dev/null || echo "—"
}

ssl_days() {
  local cert="/etc/letsencrypt/live/${1}/fullchain.pem"
  [[ -f "$cert" ]] || { echo "-1"; return; }
  local exp; exp=$(openssl x509 -enddate -noout -in "$cert" 2>/dev/null | cut -d= -f2)
  echo $(( ( $(date -d "$exp" +%s) - $(date +%s) ) / 86400 ))
}

ssl_status() {
  local d="$1"
  if   [[ "$d" -lt 0  ]]; then printf "${DIM}not found${RESET}"
  elif [[ "$d" -lt 14 ]]; then printf "${RED}scade in %d gg${RESET}" "$d"
  elif [[ "$d" -lt 30 ]]; then printf "${YELLOW}scade in %d gg${RESET}" "$d"
  else                          printf "${GREEN}valido (%d gg)${RESET}" "$d"
  fi
}

# ── Progetti definiti ─────────────────────────────────────────────────────────
declare -A PROJECTS
PROJECTS[espressamente-prod]="esp-prod-frontend:3010 esp-prod-backend:8082 esp-prod-db:- esp-prod-redis:-"
PROJECTS[espressamente-staging]="esp-staging-frontend:3011 esp-staging-backend:8081 esp-staging-db:- esp-staging-redis:-"
PROJECTS[jurixsuite-dev]="jurixsuite-frontend-dev:3000 jurixsuite-gateway-dev:8080 jurixsuite-keycloak-dev:8180 jurixsuite-eureka-server-dev:8761 jurixsuite-client-service-dev:- jurixsuite-document-service-dev:- jurixsuite-dossier-service-dev:- jurixsuite-billing-service-dev:- jurixsuite-calendar-service-dev:- jurixsuite-postgres-dev:5432 jurixsuite-redis-dev:6379 jurixsuite-minio-dev:9000"

declare -A PROJECT_DIR
PROJECT_DIR[espressamente-prod]="/opt/espressamente/repo"
PROJECT_DIR[espressamente-staging]="/opt/espressamente/repo"
PROJECT_DIR[jurixsuite-dev]="/opt/JurixSuite"

declare -A PROJECT_COMPOSE
PROJECT_COMPOSE[espressamente-prod]="docker/docker-compose.prod.yml --env-file /opt/espressamente/production/.env.production"
PROJECT_COMPOSE[espressamente-staging]="docker/docker-compose.staging.yml --env-file /opt/espressamente/staging/.env.staging"
PROJECT_COMPOSE[jurixsuite-dev]="docker-compose.yml"

declare -A PROJECT_LABEL
PROJECT_LABEL[espressamente-prod]="${BOLD}${BLUE}● ESPRESSAMENTE — Produzione${RESET}  ${DIM}(espressamente.eu)${RESET}"
PROJECT_LABEL[espressamente-staging]="${BOLD}${YELLOW}● ESPRESSAMENTE — Staging${RESET}  ${DIM}(stg.espressamente.eu)${RESET}"
PROJECT_LABEL[jurixsuite-dev]="${BOLD}${MAGENTA}● JURIXSUITE — Dev${RESET}  ${DIM}(dev.jurixsuite.it)${RESET}"

PROJECT_ORDER="espressamente-prod espressamente-staging jurixsuite-dev"

# ─────────────────────────────────────────────────────────────────────────────
# FUNZIONE: mostra dashboard
# ─────────────────────────────────────────────────────────────────────────────
show_dashboard() {
  [[ -t 1 ]] && clear
  echo
  printf "${BOLD}${MAGENTA}  ╔══════════════════════════════════════════════════════════╗${RESET}\n"
  printf "${BOLD}${MAGENTA}  ║         SERVER STATUS — $(date '+%d/%m/%Y %H:%M:%S')         ║${RESET}\n"
  printf "${BOLD}${MAGENTA}  ╚══════════════════════════════════════════════════════════╝${RESET}\n"

  # ── Sistema ────────────────────────────────────────────────────────────────
  hdr "SISTEMA"
  local uptime load mem_total mem_used mem_pct mem_color disk_info disk_pct disk_color
  uptime=$(uptime -p 2>/dev/null | sed 's/up //')
  load=$(cut -d' ' -f1-3 /proc/loadavg)
  mem_total=$(free -m | awk '/^Mem:/{print $2}')
  mem_used=$(free -m  | awk '/^Mem:/{print $3}')
  mem_pct=$(( mem_used * 100 / mem_total ))
  mem_color=$( [[ $mem_pct -gt 85 ]] && echo "$RED" || ([[ $mem_pct -gt 65 ]] && echo "$YELLOW" || echo "$GREEN") )
  disk_info=$(df -h / | awk 'NR==2{print $3" / "$2" ("$5")"}')
  disk_pct=$(df / | awk 'NR==2{print $5}' | tr -d '%')
  disk_color=$( [[ $disk_pct -gt 85 ]] && echo "$RED" || ([[ $disk_pct -gt 70 ]] && echo "$YELLOW" || echo "$GREEN") )

  printf "  %-18s ${BOLD}%s${RESET}\n"  "Hostname:"    "$(hostname -f 2>/dev/null || hostname)"
  printf "  %-18s ${BOLD}%s${RESET}\n"  "IP pubblico:" "$(curl -s --max-time 3 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
  printf "  %-18s %s\n"                 "Uptime:"      "$uptime"
  printf "  %-18s %s  ${DIM}($(nproc) core)${RESET}\n" "Load avg:" "$load"
  printf "  %-18s %s\n"                 "Kernel:"      "$(uname -r)"
  printf "  %-18s ${mem_color}%s MB / %s MB (%s%%)${RESET}\n" "RAM:" "$mem_used" "$mem_total" "$mem_pct"
  printf "  %-18s ${disk_color}%s${RESET}\n" "Disco (/):" "$disk_info"

  $SHORT && { echo; return; }

  # ── Progetti Docker ────────────────────────────────────────────────────────
  hdr "PROGETTI DOCKER"

  for proj in $PROJECT_ORDER; do
    echo
    printf "  %b\n" "${PROJECT_LABEL[$proj]}"
    printf "  %-35s %-12s %-10s %s\n" "Container" "Stato" "Porta" "Avviato"
    hr
    for svc in ${PROJECTS[$proj]}; do
      local name="${svc%%:*}" port="${svc##*:}"
      local state started
      state=$(container_status "$name")
      started=$(container_uptime "$name")
      printf "  ${BOLD}%-35s${RESET} %b %-10s %s\n" "$name" "$state" "$port" "$started"
    done
  done

  # Altri container non classificati
  local other
  other=$(docker ps --format '{{.Names}}' 2>/dev/null \
    | grep -vE '^(esp-|jurixsuite-)' || true)
  if [[ -n "$other" ]]; then
    echo
    printf "  ${BOLD}● ALTRI CONTAINER${RESET}\n"
    hr
    while IFS= read -r cname; do
      local cstate cimage
      cstate=$(docker inspect --format '{{.State.Status}}' "$cname" 2>/dev/null)
      cimage=$(docker inspect --format '{{.Config.Image}}' "$cname" 2>/dev/null | cut -c1-30)
      local sc="${YELLOW}${cstate}${RESET}"; [[ "$cstate" == "running" ]] && sc="${GREEN}running${RESET}"
      printf "  ${BOLD}%-35s${RESET} %b  %s\n" "$cname" "$sc" "$cimage"
    done <<< "$other"
  fi

  local total stopped images
  total=$(docker ps -q | wc -l)
  stopped=$(docker ps -aq --filter status=exited | wc -l)
  images=$(docker images --format '{{.Repository}}' | wc -l)
  echo
  printf "  ${DIM}Running: %s  |  Stoppati: %s  |  Immagini: %s  |  Volumi: %s${RESET}\n" \
    "$total" "$stopped" "$images" "$(docker volume ls -q | wc -l)"

  # ── Nginx ──────────────────────────────────────────────────────────────────
  hdr "NGINX"
  local nginx_st; nginx_st=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
  [[ "$nginx_st" == "active" ]] && ok "nginx in esecuzione ($(nginx -v 2>&1 | grep -oP 'nginx/\K[^ ]+'))" \
                                 || err "nginx NON in esecuzione"
  if [[ -d /etc/nginx/sites-enabled ]]; then
    echo
    printf "  %-35s %s\n" "Virtual Host" "SSL"
    hr
    for conf in /etc/nginx/sites-enabled/*.conf; do
      [[ -f "$conf" ]] || continue
      local fname domain days
      fname=$(basename "$conf" .conf)
      domain=$(grep -m1 'server_name' "$conf" 2>/dev/null | awk '{print $2}' | tr -d ';' || echo "$fname")
      days=$(ssl_days "$fname")
      printf "  %-35s %b\n" "$domain" "$(ssl_status "$days")"
    done
  fi

  # ── SSL ────────────────────────────────────────────────────────────────────
  hdr "CERTIFICATI SSL"
  if [[ -d /etc/letsencrypt/live ]]; then
    printf "  %-35s %-28s %s\n" "Dominio" "Scadenza" "Stato"
    hr
    for certdir in /etc/letsencrypt/live/*/; do
      [[ -d "$certdir" ]] || continue
      local domain; domain=$(basename "$certdir")
      [[ "$domain" == "README" ]] && continue
      local cert="${certdir}fullchain.pem"
      [[ -f "$cert" ]] || continue
      local exp days
      exp=$(openssl x509 -enddate -noout -in "$cert" 2>/dev/null | cut -d= -f2)
      days=$(ssl_days "$domain")
      printf "  %-35s %-28s %b\n" "$domain" "$exp" "$(ssl_status "$days")"
    done
  fi

  # ── Porte ──────────────────────────────────────────────────────────────────
  hdr "PORTE IN ASCOLTO"
  printf "  %-10s %-20s %s\n" "Porta" "Processo" "Indirizzo"
  hr
  ss -tlnp 2>/dev/null | awk 'NR>1 {
    split($4,a,":"); port=a[length(a)]; proc=$NF
    gsub(/users:\(\(/,"",proc); gsub(/\)\)/,"",proc)
    split(proc,p,","); pname=p[1]; gsub(/"/,"",pname)
    printf "  %-10s %-20s %s\n", port, pname, $4
  }' | sort -t' ' -k1 -n | head -20

  # ── Firewall ───────────────────────────────────────────────────────────────
  hdr "FIREWALL (UFW)"
  local ufw_st; ufw_st=$(ufw status 2>/dev/null | head -1 | awk '{print $2}' || echo "unknown")
  [[ "$ufw_st" == "active" ]] && ok "UFW attivo" || warn "UFW non attivo"
  ufw status 2>/dev/null | grep -E "ALLOW|DENY" | while read -r line; do info "  $line"; done

  # ── Log errori ─────────────────────────────────────────────────────────────
  if $SHOW_LOGS; then
    hdr "LOG ERRORI RECENTI"
    for proj in $PROJECT_ORDER; do
      echo
      printf "  ${BOLD}%s:${RESET}\n" "$proj"
      local first_container; first_container=$(echo "${PROJECTS[$proj]}" | awk '{print $1}' | cut -d: -f1)
      docker logs "$first_container" --tail 10 2>&1 \
        | grep -iE "error|exception|warn" | head -5 \
        | while IFS= read -r line; do printf "  ${RED}%s${RESET}\n" "$line"; done \
        || info "  nessun errore recente"
    done
  fi

  # ── Footer ─────────────────────────────────────────────────────────────────
  echo; hr
  printf "  ${DIM}%s  |  --watch monitoraggio  |  --logs errori  |  --short rapido${RESET}\n" \
    "$(date '+%d/%m/%Y %H:%M:%S')"
  echo
}

# ─────────────────────────────────────────────────────────────────────────────
# FUNZIONE: monitoraggio real-time
# ─────────────────────────────────────────────────────────────────────────────
show_monitor() {
  local interval=5
  printf "${BOLD}${CYAN}  Monitoraggio real-time (aggiornamento ogni ${interval}s — Ctrl+C per uscire)${RESET}\n"
  while true; do
    [[ -t 1 ]] && clear
    echo
    printf "${BOLD}${MAGENTA}  ╔══════════════════════════════════════════════════════════╗${RESET}\n"
    printf "${BOLD}${MAGENTA}  ║        MONITOR — $(date '+%d/%m/%Y %H:%M:%S')  [Ctrl+C exit]      ║${RESET}\n"
    printf "${BOLD}${MAGENTA}  ╚══════════════════════════════════════════════════════════╝${RESET}\n"

    # Sistema
    hdr "SISTEMA"
    local load mem_used mem_total mem_pct mem_color
    load=$(cut -d' ' -f1-3 /proc/loadavg)
    mem_total=$(free -m | awk '/^Mem:/{print $2}')
    mem_used=$(free -m  | awk '/^Mem:/{print $3}')
    mem_pct=$(( mem_used * 100 / mem_total ))
    mem_color=$( [[ $mem_pct -gt 85 ]] && echo "$RED" || ([[ $mem_pct -gt 65 ]] && echo "$YELLOW" || echo "$GREEN") )
    printf "  Load avg: ${BOLD}%s${RESET}  |  RAM: ${mem_color}%s/%s MB (%s%%)${RESET}  |  Uptime: %s\n" \
      "$load" "$mem_used" "$mem_total" "$mem_pct" "$(uptime -p | sed 's/up //')"

    # Container stats
    hdr "CONTAINER STATS"
    printf "  ${BOLD}%-35s %-12s %-12s %-12s %s${RESET}\n" "Container" "Stato" "CPU%" "RAM" "RAM%"
    hr
    while IFS='|' read -r name cpu mem memp; do
      local cstate
      cstate=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null || echo "—")
      local color="$GREEN"; [[ "$cstate" != "running" ]] && color="$RED"
      printf "  ${BOLD}%-35s${RESET} ${color}%-12s${RESET} %-12s %-12s %s\n" \
        "$name" "$cstate" "$cpu" "$mem" "$memp"
    done < <(docker stats --no-stream --format '{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}' 2>/dev/null | sort)

    # Nginx
    echo
    local nginx_st; nginx_st=$(systemctl is-active nginx 2>/dev/null)
    [[ "$nginx_st" == "active" ]] \
      && printf "  ${GREEN}✔${RESET}  Nginx ${GREEN}active${RESET}\n" \
      || printf "  ${RED}✖${RESET}  Nginx ${RED}${nginx_st}${RESET}\n"

    echo
    printf "  ${DIM}Prossimo aggiornamento in ${interval}s...${RESET}\n"
    sleep "$interval"
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# FUNZIONI AZIONE
# ─────────────────────────────────────────────────────────────────────────────
action_restart() {
  local proj="$1"
  local dir="${PROJECT_DIR[$proj]}"
  local compose="${PROJECT_COMPOSE[$proj]}"
  echo
  printf "  ${YELLOW}⚡ Riavvio ${proj}...${RESET}\n"
  docker compose -f "${dir}/${compose%% *}" \
    $(echo "$compose" | grep -oP '(?<=\.yml ).*' || true) \
    --project-directory "$dir" \
    restart 2>/dev/null \
  || docker compose -f "${dir}/${compose%% *}" \
       $(echo "$compose" | grep -oP '(?<=\.yml ).*' || true) \
       --project-directory "$dir" \
       up -d --remove-orphans
  printf "  ${GREEN}✔ Riavvio completato.${RESET}\n"
}

action_update() {
  local proj="$1"
  local dir="${PROJECT_DIR[$proj]}"
  local compose="${PROJECT_COMPOSE[$proj]}"
  local composefile="${dir}/${compose%% *}"
  local extraargs; extraargs=$(echo "$compose" | grep -oP '(?<=\.yml ).*' || true)

  echo
  printf "  ${CYAN}⬇  Aggiornamento ${proj}...${RESET}\n"

  # Git pull solo per espressamente
  if [[ "$proj" == espressamente* ]]; then
    printf "  ${DIM}→ git pull...${RESET}\n"
    git -C "$dir" pull --ff-only
  fi

  printf "  ${DIM}→ docker compose pull...${RESET}\n"
  docker compose -f "$composefile" $extraargs pull

  printf "  ${DIM}→ docker compose up -d...${RESET}\n"
  docker compose -f "$composefile" $extraargs up -d --remove-orphans

  printf "  ${DIM}→ pulizia immagini obsolete...${RESET}\n"
  docker image prune -f

  printf "  ${GREEN}✔ Aggiornamento completato.${RESET}\n"
}

action_logs() {
  local proj="$1"
  echo
  printf "  ${DIM}Seleziona container:${RESET}\n"
  local i=1
  local containers=()
  for svc in ${PROJECTS[$proj]}; do
    local name="${svc%%:*}"
    printf "    ${BOLD}[%s]${RESET} %s\n" "$i" "$name"
    containers+=("$name")
    (( i++ ))
  done
  echo
  read -rp "  Numero container [1-${#containers[@]}]: " choice
  local cname="${containers[$((choice-1))]}"
  echo
  printf "  ${BOLD}Log di %s (ultimi 50):${RESET}\n" "$cname"
  hr
  docker logs "$cname" --tail 50 -f 2>&1
}

# ─────────────────────────────────────────────────────────────────────────────
# MENU INTERATTIVO
# ─────────────────────────────────────────────────────────────────────────────
show_menu() {
  while true; do
    echo
    printf "${BOLD}${CYAN}  ╔══════════════════ AZIONI DISPONIBILI ══════════════════╗${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}                                                         ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}   ${BOLD}[1]${RESET} Riavvia progetto                                  ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}   ${BOLD}[2]${RESET} Aggiorna progetto  (pull + up)                   ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}   ${BOLD}[3]${RESET} Visualizza log container                          ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}   ${BOLD}[4]${RESET} Monitoraggio real-time                            ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}   ${BOLD}[5]${RESET} Aggiorna dashboard                                ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}   ${BOLD}[0]${RESET} Esci                                              ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}                                                         ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ╚═════════════════════════════════════════════════════════╝${RESET}\n"
    echo
    read -rp "  Scelta: " choice

    case "$choice" in
      1|2|3)
        echo
        printf "  ${DIM}Seleziona progetto:${RESET}\n"
        local i=1; local projs=()
        for proj in $PROJECT_ORDER; do
          printf "    ${BOLD}[%s]${RESET} %s\n" "$i" "$proj"
          projs+=("$proj")
          (( i++ ))
        done
        echo
        read -rp "  Numero progetto [1-${#projs[@]}]: " pidx
        local selected="${projs[$((pidx-1))]}"
        case "$choice" in
          1) action_restart "$selected" ;;
          2) action_update  "$selected" ;;
          3) action_logs    "$selected" ;;
        esac
        echo
        read -rp "  Premi INVIO per tornare al menu..." _
        show_dashboard
        ;;
      4) show_monitor ;;
      5) show_dashboard ;;
      0) echo; printf "  ${DIM}Uscita.${RESET}\n"; echo; exit 0 ;;
      *) warn "Scelta non valida" ;;
    esac
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if $WATCH; then
  show_monitor
else
  show_dashboard
  # Menu interattivo solo se siamo in un terminale reale
  if [[ -t 0 && -t 1 ]] && ! $SHORT; then
    show_menu
  fi
fi
