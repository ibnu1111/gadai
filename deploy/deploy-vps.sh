#!/usr/bin/env bash
# Deploy script: pull latest git, install deps if needed, then reload PM2.
# Usage (from local):
#   ssh root@72.62.245.42 'bash -s' < deploy/deploy-vps.sh
# Or copy this file to the VPS and run it directly.
#
# Required env (or edit defaults below):
#   APP_DIR  - absolute path to the project on the VPS (default: /var/www/gadai)
#   BRANCH   - git branch to deploy (default: main)
#   PM2_NAME - PM2 app name (default: gadai - matches ecosystem.config.js)

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/gadai}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-gadai}"

# Colors for output (skip if NO_COLOR is set or non-TTY).
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_OK='\033[0;32m'; C_WARN='\033[0;33m'; C_ERR='\033[0;31m'; C_RST='\033[0m'
else
  C_OK=''; C_WARN=''; C_ERR=''; C_RST=''
fi
log()  { printf "${C_OK}[deploy]${C_RST} %s\n" "$*"; }
warn() { printf "${C_WARN}[deploy]${C_RST} %s\n" "$*"; }
die()  { printf "${C_ERR}[deploy]${C_RST} %s\n" "$*" >&2; exit 1; }

[ -d "$APP_DIR" ] || die "APP_DIR not found: $APP_DIR. Set APP_DIR=/path/to/gadai and re-run."

cd "$APP_DIR"

# --- Sanity checks ----------------------------------------------------------
[ -d .git ]      || die "Not a git repo: $APP_DIR"
[ -f package.json ] || die "No package.json in $APP_DIR"
command -v pm2  >/dev/null 2>&1 || die "pm2 not found on PATH. Install: npm i -g pm2"
command -v node >/dev/null 2>&1 || die "node not found on PATH"

# --- 1. Pull latest code ----------------------------------------------------
log "Fetching origin/$BRANCH..."
git fetch --prune origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")
if [ "$LOCAL" = "$REMOTE" ]; then
  warn "Already up to date with origin/$BRANCH ($LOCAL). Continuing anyway in case node_modules or build is stale."
else
  log "Updating $LOCAL -> $REMOTE"
  git pull --ff-only origin "$BRANCH" || die "git pull failed. Resolve manually (likely local divergence)."
fi

# --- 2. Install deps if package.json changed -------------------------------
# Cheap heuristic: if package-lock.json is newer than node_modules/.package-lock.json, reinstall.
if [ -f package-lock.json ]; then
  if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
    log "Installing dependencies (npm ci)..."
    npm ci --no-audit --no-fund
  else
    log "Dependencies up to date, skipping install."
  fi
else
  warn "No package-lock.json found. Skipping dependency install."
fi

# --- 3. Prisma ---------------------------------------------------------------
if [ -f prisma/schema.prisma ]; then
  log "Running prisma generate..."
  npx --yes prisma generate >/dev/null
  if grep -q "provider" prisma/schema.prisma; then
    log "Applying prisma migrations (deploy)..."
    npx --yes prisma migrate deploy || warn "prisma migrate deploy failed - check DATABASE_URL and run manually."
  fi
fi

# --- 4. Build ---------------------------------------------------------------
log "Building Next.js (next build)..."
npm run build

# --- 5. Restart PM2 (zero-downtime) ----------------------------------------
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  log "Reloading pm2 app '$PM2_NAME' (zero-downtime)..."
  pm2 reload "$PM2_NAME"
else
  warn "pm2 app '$PM2_NAME' not found. Starting it for the first time..."
  pm2 start ecosystem.config.js --env production
  pm2 save
fi

pm2 status "$PM2_NAME"

log "Done. Tail logs with: pm2 logs $PM2_NAME"
