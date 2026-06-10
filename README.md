# INP Psicotécnico — Plataforma de Inscrição

Plataforma de inscrição online para o teste psicotécnico exclusivo para ex-estudantes do Instituto Nacional de Petróleos (INP), Angola.

**URL de produção:** `https://inscricoes.inp.co.ao`

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Base de dados | PostgreSQL 15 + Prisma ORM |
| Cache / Filas | Redis + BullMQ |
| Email | Resend (SMTP transaccional) |
| Uploads | Armazenamento local (VPS) + validação |
| Servidor web | Nginx (reverse proxy + SSL) |
| Processo | PM2 (cluster mode) |
| CDN / Protecção | Cloudflare |
| CI/CD | GitHub Actions |

---

## Estrutura do projecto

```
inp-psicotecnico/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── config/       # Configurações (DB, email, upload)
│   │   ├── controllers/  # Lógica dos endpoints
│   │   ├── middleware/   # Auth, validação, rate limit, upload
│   │   ├── routes/       # Rotas da API
│   │   ├── services/     # Serviços (email, ficheiros)
│   │   ├── utils/        # Helpers
│   │   └── validators/   # Schemas de validação (Zod)
│   ├── prisma/           # Schema e migrações da BD
│   └── uploads/          # Ficheiros enviados pelos candidatos
├── frontend/             # Next.js 14
│   └── src/
│       ├── app/          # App Router (páginas)
│       ├── components/   # Componentes React
│       ├── lib/          # Clientes API, helpers
│       └── types/        # Tipos TypeScript
├── nginx/                # Config do Nginx
├── scripts/              # Scripts de deploy e manutenção
└── .github/workflows/    # CI/CD GitHub Actions
```

---

## Pré-requisitos (máquina local)

- Node.js >= 20.x
- npm >= 10.x
- PostgreSQL 15 (local ou Docker)
- Redis 7 (local ou Docker)
- Git

---

## Instalação local (desenvolvimento)

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USER/inp-psicotecnico.git
cd inp-psicotecnico
```

### 2. Configurar variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env com as suas credenciais locais

# Frontend
cp frontend/.env.example frontend/.env.local
# Editar frontend/.env.local
```

### 3. Instalar dependências

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Configurar a base de dados

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed   # dados iniciais (admin, cursos)
```

### 5. Iniciar em modo de desenvolvimento

```bash
# Terminal 1 — Backend (porta 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (porta 3000)
cd frontend && npm run dev
```

Aceder em: http://localhost:3000
Admin em: http://localhost:3000/admin

---

## Variáveis de ambiente obrigatórias

### backend/.env

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/inp_psicotecnico"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="gerar-com-openssl-rand-base64-64"
JWT_EXPIRES_IN="8h"
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="inscricoes@inp.co.ao"
FRONTEND_URL="http://localhost:3000"
UPLOAD_MAX_SIZE_MB=10
NODE_ENV="development"
PORT=4000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## Deploy (VPS Hostinger)

Ver [scripts/deploy.sh](scripts/deploy.sh) e [DEPLOY.md](DEPLOY.md) para instruções completas.

Resumo do processo:
1. Push para branch `main` no GitHub
2. GitHub Actions executa os testes
3. SSH para a VPS e executa `scripts/deploy.sh`
4. PM2 reinicia os processos automaticamente

---

## Funcionalidades

### Área pública (candidatos)
- [x] Landing page com contador de inscritos e prazo
- [x] Formulário wizard em 3 passos
- [x] Upload de BI, Certificado e CV (PDF/JPG, máx 10MB cada)
- [x] Validação de duplicados (Nº processo + BI)
- [x] Email de confirmação com link único (expira 48h)
- [x] Reenvio de email de confirmação
- [x] Página de confirmação bem-sucedida

### Área administrativa (restrita)
- [x] Login seguro com JWT + rate limiting
- [x] Dashboard com KPIs em tempo real
- [x] Gráficos: género, província, curso, local preferido
- [x] Tabela de candidatos com filtros e paginação
- [x] Visualização de documentos enviados
- [x] Confirmação manual / revogação de inscrição
- [x] Exportação para Excel (filtros aplicáveis)
- [x] Logs de auditoria de todas as acções admin
- [x] Reenvio de email de confirmação para candidatos

---

## Segurança

- Rate limiting: 5 submissões/IP/hora no formulário
- Validação dupla de duplicados (Nº processo + BI)
- Tokens de confirmação com expiração de 48h
- Autenticação JWT com refresh tokens
- Uploads: validação de tipo MIME + tamanho
- Ficheiros servidos com nomes UUID (não adivinháveis)
- Headers de segurança via Nginx
- Cloudflare WAF + DDoS protection

---

## Licença

Projecto privado — INP / uso interno.
