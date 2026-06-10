#!/bin/bash
# scripts/deploy.sh
# Executar na VPS após push para main:  bash scripts/deploy.sh
set -e

APP_DIR="/var/www/inp-psicotecnico"
REPO="https://github.com/SEU_USER/inp-psicotecnico.git"
LOG="$APP_DIR/logs/deploy.log"

echo "──────────────────────────────────────"
echo "🚀 Deploy INP Psicotécnico — $(date)"
echo "──────────────────────────────────────" | tee -a "$LOG"

cd "$APP_DIR"

echo "📥 Pull do repositório..." | tee -a "$LOG"
git pull origin main

echo "📦 Backend — instalar dependências..." | tee -a "$LOG"
cd "$APP_DIR/backend"
npm ci --production=false

echo "⚙️  Backend — gerar Prisma client..." | tee -a "$LOG"
npx prisma generate

echo "🗃️  Backend — executar migrações..." | tee -a "$LOG"
npx prisma migrate deploy

echo "🔨 Backend — build TypeScript..." | tee -a "$LOG"
npm run build

echo "📦 Frontend — instalar dependências..." | tee -a "$LOG"
cd "$APP_DIR/frontend"
npm ci

echo "🔨 Frontend — build Next.js..." | tee -a "$LOG"
npm run build

echo "🔄 PM2 — reiniciar processos..." | tee -a "$LOG"
cd "$APP_DIR"
pm2 reload ecosystem.config.js --env production

echo "✅ Deploy concluído com sucesso — $(date)" | tee -a "$LOG"
echo "──────────────────────────────────────" | tee -a "$LOG"
