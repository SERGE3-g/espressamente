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
  local name="$1" state health
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

# ── Configurazione progetti ───────────────────────────────────────────────────
declare -A PROJECTS PROJECT_DIR PROJECT_COMPOSE PROJECT_LABEL PROJECT_DB PROJECT_DBNAME PROJECT_DBUSER

PROJECTS[espressamente-prod]="esp-prod-frontend:3010 esp-prod-backend:8082 esp-prod-db:5433 esp-prod-redis:-"
PROJECTS[espressamente-staging]="esp-staging-frontend:3011 esp-staging-backend:8081 esp-staging-db:5434 esp-staging-redis:-"
PROJECTS[jurixsuite-dev]="jurixsuite-frontend-dev:3000 jurixsuite-gateway-dev:8080 jurixsuite-keycloak-dev:8180 jurixsuite-eureka-server-dev:8761 jurixsuite-client-service-dev:- jurixsuite-document-service-dev:- jurixsuite-dossier-service-dev:- jurixsuite-billing-service-dev:- jurixsuite-calendar-service-dev:- jurixsuite-postgres-dev:5432 jurixsuite-redis-dev:6379 jurixsuite-minio-dev:9000"

PROJECT_DIR[espressamente-prod]="/opt/espressamente/repo"
PROJECT_DIR[espressamente-staging]="/opt/espressamente/repo"
PROJECT_DIR[jurixsuite-dev]="/opt/JurixSuite"

PROJECT_COMPOSE[espressamente-prod]="docker/docker-compose.prod.yml --env-file /opt/espressamente/production/.env.production"
PROJECT_COMPOSE[espressamente-staging]="docker/docker-compose.staging.yml --env-file /opt/espressamente/staging/.env.staging"
PROJECT_COMPOSE[jurixsuite-dev]="docker-compose.yml"

PROJECT_LABEL[espressamente-prod]="${BOLD}${BLUE}● ESPRESSAMENTE — Produzione${RESET}  ${DIM}(espressamente.eu)${RESET}"
PROJECT_LABEL[espressamente-staging]="${BOLD}${YELLOW}● ESPRESSAMENTE — Staging${RESET}  ${DIM}(stg.espressamente.eu)${RESET}"
PROJECT_LABEL[jurixsuite-dev]="${BOLD}${MAGENTA}● JURIXSUITE — Dev${RESET}  ${DIM}(dev.jurixsuite.it)${RESET}"

# Container DB, database, utente per ogni progetto
PROJECT_DB[espressamente-prod]="esp-prod-db"
PROJECT_DB[espressamente-staging]="esp-staging-db"
PROJECT_DB[jurixsuite-dev]="jurixsuite-postgres-dev"

PROJECT_DBNAME[espressamente-prod]="espressamente_db"
PROJECT_DBNAME[espressamente-staging]="espressamente_db"
PROJECT_DBNAME[jurixsuite-dev]="jurixsuite"

PROJECT_DBUSER[espressamente-prod]="POSTGRES_USER"
PROJECT_DBUSER[espressamente-staging]="POSTGRES_USER"
PROJECT_DBUSER[jurixsuite-dev]="POSTGRES_USER"

PROJECT_ORDER="espressamente-prod espressamente-staging jurixsuite-dev"

TOOLS_COMPOSE="/opt/espressamente/repo/docker/docker-compose.tools.yml"
PGADMIN_PORT=5050

# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD
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

  # pgAdmin
  echo
  local pgadmin_state pgadmin_color
  pgadmin_state=$(docker inspect --format '{{.State.Status}}' devtools-pgadmin 2>/dev/null || echo "missing")
  if [[ "$pgadmin_state" == "running" ]]; then
    pgadmin_color="${GREEN}"
    printf "  ${BOLD}${CYAN}● DEVTOOLS${RESET}\n"
    hr
    printf "  ${BOLD}%-35s${RESET} ${GREEN}%-12s${RESET} %-10s %s\n" \
      "devtools-pgadmin" "running" "$PGADMIN_PORT" "$(container_uptime devtools-pgadmin)"
    printf "  ${DIM}  → SSH tunnel: ssh -L %s:127.0.0.1:%s root@SERVER  → http://localhost:%s${RESET}\n" \
      "$PGADMIN_PORT" "$PGADMIN_PORT" "$PGADMIN_PORT"
  else
    printf "  ${BOLD}${CYAN}● DEVTOOLS${RESET}  ${DIM}(pgAdmin non avviato — usa menu opzione 7)${RESET}\n"
  fi

  local total stopped
  total=$(docker ps -q | wc -l)
  stopped=$(docker ps -aq --filter status=exited | wc -l)
  echo
  printf "  ${DIM}Running: %s  |  Stoppati: %s  |  Immagini: %s  |  Volumi: %s${RESET}\n" \
    "$total" "$stopped" \
    "$(docker images --format '{{.Repository}}' | wc -l)" \
    "$(docker volume ls -q | wc -l)"

  # ── Nginx ──────────────────────────────────────────────────────────────────
  hdr "NGINX"
  local nginx_st; nginx_st=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
  if [[ "$nginx_st" == "active" ]]; then
    ok "nginx in esecuzione ($(nginx -v 2>&1 | grep -oP 'nginx/\K[^ ]+'))"
  else
    err "nginx NON in esecuzione"
  fi
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
      local cert="${certdir}fullchain.pem"; [[ -f "$cert" ]] || continue
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
  }' | sort -t' ' -k1 -n | head -25

  # ── Firewall ───────────────────────────────────────────────────────────────
  hdr "FIREWALL (UFW)"
  local ufw_st; ufw_st=$(ufw status 2>/dev/null | head -1 | awk '{print $2}' || echo "unknown")
  if [[ "$ufw_st" == "active" ]]; then
    ok "UFW attivo"
  else
    warn "UFW non attivo"
  fi
  ufw status 2>/dev/null | grep -E "ALLOW|DENY" | while read -r line; do info "  $line"; done

  # ── Log errori ─────────────────────────────────────────────────────────────
  if $SHOW_LOGS; then
    hdr "LOG ERRORI RECENTI"
    for proj in $PROJECT_ORDER; do
      echo
      printf "  ${BOLD}%s:${RESET}\n" "$proj"
      local first_c; first_c=$(echo "${PROJECTS[$proj]}" | awk '{print $1}' | cut -d: -f1)
      docker logs "$first_c" --tail 10 2>&1 \
        | grep -iE "error|exception|warn" | head -5 \
        | while IFS= read -r line; do printf "  ${RED}%s${RESET}\n" "$line"; done \
        || info "  nessun errore recente"
    done
  fi

  # ── Footer ─────────────────────────────────────────────────────────────────
  echo; hr
  printf "  ${DIM}%s  |  --watch monitor  |  --logs errori  |  --short rapido${RESET}\n" \
    "$(date '+%d/%m/%Y %H:%M:%S')"
  echo
}

# ─────────────────────────────────────────────────────────────────────────────
# MONITORAGGIO REAL-TIME
# ─────────────────────────────────────────────────────────────────────────────
show_monitor() {
  local interval=5
  printf "${BOLD}${CYAN}  Monitor real-time — aggiornamento ogni ${interval}s (Ctrl+C per uscire)${RESET}\n"
  while true; do
    [[ -t 1 ]] && clear
    echo
    printf "${BOLD}${MAGENTA}  ╔══════════════════════════════════════════════════════════╗${RESET}\n"
    printf "${BOLD}${MAGENTA}  ║    MONITOR — $(date '+%d/%m/%Y %H:%M:%S')  [Ctrl+C exit]       ║${RESET}\n"
    printf "${BOLD}${MAGENTA}  ╚══════════════════════════════════════════════════════════╝${RESET}\n"

    hdr "SISTEMA"
    local load mem_total mem_used mem_pct mem_color
    load=$(cut -d' ' -f1-3 /proc/loadavg)
    mem_total=$(free -m | awk '/^Mem:/{print $2}')
    mem_used=$(free -m  | awk '/^Mem:/{print $3}')
    mem_pct=$(( mem_used * 100 / mem_total ))
    mem_color=$( [[ $mem_pct -gt 85 ]] && echo "$RED" || ([[ $mem_pct -gt 65 ]] && echo "$YELLOW" || echo "$GREEN") )
    printf "  Load: ${BOLD}%s${RESET}  |  RAM: ${mem_color}%s/%s MB (%s%%)${RESET}  |  Uptime: %s\n" \
      "$load" "$mem_used" "$mem_total" "$mem_pct" "$(uptime -p | sed 's/up //')"

    hdr "CONTAINER STATS (CPU / RAM)"
    printf "  ${BOLD}%-38s %-10s %-18s %-8s %s${RESET}\n" "Container" "Stato" "RAM usata" "RAM%" "CPU%"
    hr
    while IFS='|' read -r name cpu mem memp; do
      local cstate color
      cstate=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null || echo "—")
      color="${GREEN}"; [[ "$cstate" != "running" ]] && color="${RED}"
      printf "  ${BOLD}%-38s${RESET} ${color}%-10s${RESET} %-18s %-8s %s\n" \
        "$name" "$cstate" "$mem" "$memp" "$cpu"
    done < <(docker stats --no-stream --format '{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}' 2>/dev/null | sort)

    echo
    local nginx_st; nginx_st=$(systemctl is-active nginx 2>/dev/null)
    if [[ "$nginx_st" == "active" ]]; then
      printf "  ${GREEN}✔${RESET}  Nginx ${GREEN}active${RESET}\n"
    else
      printf "  ${RED}✖${RESET}  Nginx ${RED}${nginx_st}${RESET}\n"
    fi

    echo
    printf "  ${DIM}Prossimo aggiornamento in ${interval}s... (Ctrl+C per uscire)${RESET}\n"
    sleep "$interval"
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# AZIONI
# ─────────────────────────────────────────────────────────────────────────────

# Scelta progetto (helper riusabile)
pick_project() {
  echo
  printf "  ${DIM}Seleziona progetto:${RESET}\n"
  local i=1; local projs=()
  for proj in $PROJECT_ORDER; do
    printf "    ${BOLD}[%s]${RESET} %s\n" "$i" "$proj"
    projs+=("$proj"); (( i++ ))
  done
  echo
  read -rp "  Numero [1-${#projs[@]}]: " pidx
  echo "${projs[$((pidx-1))]}"
}

action_restart() {
  local proj="$1"
  local dir="${PROJECT_DIR[$proj]}"
  local composefile="${dir}/${PROJECT_COMPOSE[$proj]%% *}"
  local extraargs; extraargs=$(echo "${PROJECT_COMPOSE[$proj]}" | grep -oP '(?<=\.yml ).*' || true)
  echo
  printf "  ${YELLOW}⚡ Riavvio %s...${RESET}\n" "$proj"
  docker compose -f "$composefile" $extraargs up -d --remove-orphans
  printf "  ${GREEN}✔ Riavvio completato.${RESET}\n"
}

action_update() {
  local proj="$1"
  local dir="${PROJECT_DIR[$proj]}"
  local composefile="${dir}/${PROJECT_COMPOSE[$proj]%% *}"
  local extraargs; extraargs=$(echo "${PROJECT_COMPOSE[$proj]}" | grep -oP '(?<=\.yml ).*' || true)
  echo
  printf "  ${CYAN}⬇  Aggiornamento %s...${RESET}\n" "$proj"
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
  printf "  ${DIM}Tipo di log:${RESET}\n"
  printf "    ${BOLD}[1]${RESET} Singolo container (live -f)\n"
  printf "    ${BOLD}[2]${RESET} Intero progetto (tutti i container, live -f)\n"
  printf "    ${BOLD}[3]${RESET} Solo errori (ultimi 100 righe)\n"
  echo
  read -rp "  Scelta [1-3]: " logtype

  case "$logtype" in
    1)
      echo
      printf "  ${DIM}Seleziona container:${RESET}\n"
      local i=1; local containers=()
      for svc in ${PROJECTS[$proj]}; do
        local name="${svc%%:*}"
        printf "    ${BOLD}[%s]${RESET} %s\n" "$i" "$name"
        containers+=("$name"); (( i++ ))
      done
      echo
      read -rp "  Numero [1-${#containers[@]}]: " cidx
      local cname="${containers[$((cidx-1))]}"
      echo
      printf "  ${BOLD}Log live di %s${RESET} ${DIM}(Ctrl+C per uscire)${RESET}\n" "$cname"
      hr
      docker logs "$cname" --tail 50 -f 2>&1
      ;;
    2)
      local dir="${PROJECT_DIR[$proj]}"
      local composefile="${dir}/${PROJECT_COMPOSE[$proj]%% *}"
      local extraargs; extraargs=$(echo "${PROJECT_COMPOSE[$proj]}" | grep -oP '(?<=\.yml ).*' || true)
      echo
      printf "  ${BOLD}Log live di tutti i container — %s${RESET} ${DIM}(Ctrl+C per uscire)${RESET}\n" "$proj"
      hr
      docker compose -f "$composefile" $extraargs logs --tail 30 -f 2>&1
      ;;
    3)
      echo
      printf "  ${BOLD}Errori recenti — %s${RESET}\n" "$proj"
      hr
      for svc in ${PROJECTS[$proj]}; do
        local cname="${svc%%:*}"
        local errors
        errors=$(docker logs "$cname" --tail 100 2>&1 | grep -iE "error|exception|fatal" | tail -5 || true)
        if [[ -n "$errors" ]]; then
          printf "  ${BOLD}%s:${RESET}\n" "$cname"
          echo "$errors" | while IFS= read -r line; do printf "  ${RED}  %s${RESET}\n" "$line"; done
        fi
      done
      ;;
  esac
}

action_query() {
  local proj="$1"
  local dbcontainer="${PROJECT_DB[$proj]}"
  local dbname="${PROJECT_DBNAME[$proj]}"
  local user_env="${PROJECT_DBUSER[$proj]}"

  # Recupera utente dall'env del container
  local db_user
  db_user=$(docker exec "$dbcontainer" env 2>/dev/null | grep "^${user_env}=" | cut -d= -f2 || echo "postgres")

  local cstate
  cstate=$(docker inspect --format '{{.State.Status}}' "$dbcontainer" 2>/dev/null || echo "missing")
  if [[ "$cstate" != "running" ]]; then
    echo
    err "Il container $dbcontainer non è in esecuzione (stato: $cstate)"
    return
  fi

  echo
  printf "  ${BOLD}${CYAN}Query Database — %s${RESET}\n" "$proj"
  printf "  ${DIM}Container: %s  |  DB: %s  |  Utente: %s${RESET}\n" "$dbcontainer" "$dbname" "$db_user"
  hr
  echo
  printf "  ${DIM}Modalità:${RESET}\n"
  printf "    ${BOLD}[1]${RESET} Shell psql interattiva\n"
  printf "    ${BOLD}[2]${RESET} Esegui query singola\n"
  printf "    ${BOLD}[3]${RESET} Lista tabelle\n"
  printf "    ${BOLD}[4]${RESET} Dimensioni tabelle\n"
  printf "    ${BOLD}[5]${RESET} Connessioni attive\n"
  echo
  read -rp "  Scelta [1-5]: " qchoice

  case "$qchoice" in
    1)
      printf "  ${DIM}Avvio psql... (\\q per uscire)${RESET}\n\n"
      docker exec -it "$dbcontainer" psql -U "$db_user" -d "$dbname"
      ;;
    2)
      echo
      read -rp "  SQL> " sql_query
      echo
      docker exec -it "$dbcontainer" psql -U "$db_user" -d "$dbname" -c "$sql_query"
      ;;
    3)
      echo
      docker exec -it "$dbcontainer" psql -U "$db_user" -d "$dbname" \
        -c "\dt" 2>&1
      ;;
    4)
      echo
      docker exec -it "$dbcontainer" psql -U "$db_user" -d "$dbname" -c "
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS dimensione,
          pg_total_relation_size(schemaname||'.'||tablename) AS bytes
        FROM pg_tables
        WHERE schemaname NOT IN ('pg_catalog','information_schema')
        ORDER BY bytes DESC;" 2>&1
      ;;
    5)
      echo
      docker exec -it "$dbcontainer" psql -U "$db_user" -d "$dbname" -c "
        SELECT pid, usename, application_name, client_addr, state, query_start
        FROM pg_stat_activity
        WHERE datname = current_database()
        ORDER BY query_start;" 2>&1
      ;;
  esac
}

action_pgadmin() {
  local pgadmin_state
  pgadmin_state=$(docker inspect --format '{{.State.Status}}' devtools-pgadmin 2>/dev/null || echo "missing")

  echo
  printf "  ${BOLD}${CYAN}pgAdmin 4${RESET}\n"
  hr
  echo

  if [[ "$pgadmin_state" == "running" ]]; then
    ok "pgAdmin è in esecuzione (porta $PGADMIN_PORT)"
  else
    warn "pgAdmin non è in esecuzione (stato: $pgadmin_state)"
    echo
    printf "  Avviare pgAdmin? ${BOLD}[s/n]${RESET}: "
    read -rn1 ans; echo
    if [[ "$ans" == "s" || "$ans" == "S" ]]; then
      docker compose -f "$TOOLS_COMPOSE" up -d
      ok "pgAdmin avviato"
    else
      return
    fi
  fi

  echo
  printf "  ${BOLD}Accesso dal Mac (SSH tunnel):${RESET}\n"
  printf "  ${CYAN}  ssh -L %s:127.0.0.1:%s -i ~/.ssh/espressamente_deploy root@217.154.119.208${RESET}\n" \
    "$PGADMIN_PORT" "$PGADMIN_PORT"
  printf "  Poi apri: ${BOLD}http://localhost:%s${RESET}\n" "$PGADMIN_PORT"
  echo
  printf "  ${BOLD}Database preconfigurati:${RESET}\n"
  printf "  ${DIM}  Espressamente Staging  → host.docker.internal:5434${RESET}\n"
  printf "  ${DIM}  Espressamente Prod     → host.docker.internal:5433${RESET}\n"
  printf "  ${DIM}  JurixSuite Dev         → host.docker.internal:5432${RESET}\n"
  echo
  printf "  ${DIM}Credenziali pgAdmin: admin@espressamente.eu / (da .env)${RESET}\n"
}

# ─────────────────────────────────────────────────────────────────────────────
# MENU INTERATTIVO
# ─────────────────────────────────────────────────────────────────────────────
show_menu() {
  while true; do
    echo
    printf "${BOLD}${CYAN}  ╔══════════════════════════════════════════════════╗${RESET}\n"
    printf "${BOLD}${CYAN}  ║          AZIONI DISPONIBILI                     ║${RESET}\n"
    printf "${BOLD}${CYAN}  ╠══════════════════════════════════════════════════╣${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[1]${RESET} Riavvia progetto                            ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[2]${RESET} Aggiorna progetto  (pull + up)              ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[3]${RESET} Log container  (live / progetto / errori)   ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[4]${RESET} Query Database  (psql interattivo)          ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[5]${RESET} Monitoraggio real-time  (CPU/RAM/stats)     ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[6]${RESET} pgAdmin  (avvia / SSH tunnel)               ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[7]${RESET} Aggiorna dashboard                          ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ║${RESET}  ${BOLD}[0]${RESET} Esci                                        ${BOLD}${CYAN}║${RESET}\n"
    printf "${BOLD}${CYAN}  ╚══════════════════════════════════════════════════╝${RESET}\n"
    echo
    read -rp "  Scelta: " choice

    local proj
    case "$choice" in
      1) proj=$(pick_project); action_restart "$proj" ;;
      2) proj=$(pick_project); action_update  "$proj" ;;
      3) proj=$(pick_project); action_logs    "$proj" ;;
      4) proj=$(pick_project); action_query   "$proj" ;;
      5) show_monitor ;;
      6) action_pgadmin ;;
      7) show_dashboard ;;
      0) echo; printf "  ${DIM}Uscita.${RESET}\n"; echo; exit 0 ;;
      *) warn "Scelta non valida" ;;
    esac

    if [[ "$choice" =~ ^[1-4]$ ]]; then
      echo
      read -rp "  Premi INVIO per tornare al menu..." _
      show_dashboard
    fi
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if $WATCH; then
  show_monitor
else
  show_dashboard
  if [[ -t 0 && -t 1 ]] && ! $SHORT; then
    show_menu
  fi
fi
