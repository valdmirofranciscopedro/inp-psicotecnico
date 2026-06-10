#!/bin/bash
# scripts/setup-local.sh
# Configura o ambiente de desenvolvimento local
# Executar: bash scripts/setup-local.sh

set -e
echo "🔧 Setup do ambiente de desenvolvimento INP Psicotécnico"
echo ""

# ─── Verificar Node.js ────────────────────────────────
NODE_VER=$(node -v 2>/dev/null | cut -c2- | cut -d. -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 20 ]; then
  echo "❌ Node.js 20+ é necessário. Instale em https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# ─── Instalar dependências ────────────────────────────
echo ""
echo "📦 Instalando dependências do backend..."
cd backend && npm install && cd ..

echo "📦 Instalando dependências do frontend..."
cd frontend && npm install && cd ..

# ─── Configurar ficheiros .env ───────────────────────
echo ""
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "📝 Criado backend/.env — EDITE com as suas credenciais!"
else
  echo "✅ backend/.env já existe"
fi

if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.example frontend/.env.local
  echo "📝 Criado frontend/.env.local"
else
  echo "✅ frontend/.env.local já existe"
fi

# ─── Criar pasta de uploads ───────────────────────────
mkdir -p backend/uploads
mkdir -p logs

echo ""
echo "✅ Setup concluído!"
echo ""
echo "⚠️  Passos seguintes:"
echo "   1. Editar backend/.env com o DATABASE_URL, RESEND_API_KEY, JWT_SECRET"
echo "   2. Certificar que PostgreSQL e Redis estão a correr"
echo "   3. cd backend && npx prisma migrate dev --name init"
echo "   4. cd backend && npm run prisma:seed"
echo "   5. Em dois terminais:"
echo "      Terminal 1: cd backend && npm run dev"
echo "      Terminal 2: cd frontend && npm run dev"
echo ""
echo "   App: http://localhost:3000"
echo "   Admin: http://localhost:3000/admin/login  (admin@inp.co.ao / INP@Admin2025!)"
echo "   API: http://localhost:4000/health"
