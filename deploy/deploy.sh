#!/bin/bash
# Dijalankan di VPS oleh GitHub Actions (lihat .github/workflows/deploy-vps.yml) setiap
# push ke main. Sesuaikan APP_DIR dengan lokasi clone repo di VPS.
set -euo pipefail

APP_DIR="/var/www/gadai"
cd "$APP_DIR"

echo "==> git pull"
git pull origin main

echo "==> install dependencies"
npm ci

echo "==> prisma generate + db push"
npx prisma generate
npx prisma db push

echo "==> build"
npm run build

echo "==> reload pm2 (zero-downtime)"
pm2 reload ecosystem.config.js --env production --update-env

echo "==> deploy selesai"
