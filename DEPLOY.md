# Guia de Deploy — VPS Hostinger

## Pré-requisitos na VPS
- Ubuntu 22.04 LTS
- Acesso SSH como root ou utilizador com sudo
- Domínio `inscricoes.inp.co.ao` apontado para o IP da VPS

---

## 1. Primeiro setup (só uma vez)

```bash
# Fazer SSH para a VPS
ssh root@IP_DA_VPS

# Clonar o repositório e executar o setup
git clone https://github.com/SEU_USER/inp-psicotecnico.git /tmp/inp-setup
bash /tmp/inp-setup/scripts/setup-vps.sh
```

---

## 2. Configurar variáveis de ambiente de produção

```bash
cp /var/www/inp-psicotecnico/backend/.env.example /var/www/inp-psicotecnico/backend/.env
nano /var/www/inp-psicotecnico/backend/.env
```

Preencher com os valores reais:
- `DATABASE_URL` com a password criada no setup
- `JWT_SECRET` gerado com `openssl rand -base64 64`
- `RESEND_API_KEY` da conta Resend.com
- `FRONTEND_URL=https://inscricoes.inp.co.ao`

---

## 3. Configurar Nginx e SSL

```bash
sudo cp /var/www/inp-psicotecnico/nginx/inscricoes.inp.co.ao.conf \
        /etc/nginx/sites-available/inscricoes.inp.co.ao

sudo ln -s /etc/nginx/sites-available/inscricoes.inp.co.ao \
           /etc/nginx/sites-enabled/

sudo nginx -t  # testar configuração
sudo systemctl reload nginx

# Obter certificado SSL gratuito
sudo certbot --nginx -d inscricoes.inp.co.ao -d www.inscricoes.inp.co.ao
```

---

## 4. Primeiro deploy

```bash
cd /var/www/inp-psicotecnico
bash scripts/deploy.sh
```

---

## 5. Configurar GitHub Actions (deploy automático)

No repositório GitHub → Settings → Secrets → Actions, criar:

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | IP da VPS |
| `VPS_USER` | utilizador SSH (ex: `ubuntu`) |
| `VPS_SSH_KEY` | conteúdo da chave privada SSH |

A partir daí, cada push para `main` faz deploy automático.

---

## Comandos úteis na VPS

```bash
# Ver estado dos processos
pm2 status

# Ver logs em tempo real
pm2 logs inp-backend
pm2 logs inp-frontend

# Reiniciar manualmente
pm2 reload all

# Ver logs do Nginx
sudo tail -f /var/log/nginx/inp_access.log
sudo tail -f /var/log/nginx/inp_error.log

# Verificar base de dados
sudo -u postgres psql inp_psicotecnico

# Backup manual da BD
pg_dump inp_psicotecnico > backup-$(date +%Y%m%d).sql
```

---

## Arquitectura em produção

```
Internet
   │
Cloudflare (CDN + WAF + DDoS)
   │
VPS Hostinger (Ubuntu 22.04)
   │
Nginx (porta 80/443)
   ├── /api/*  → Express (porta 4000) via PM2 cluster
   └── /*      → Next.js (porta 3000) via PM2 cluster
        │
        ├── PostgreSQL 15 (base de dados)
        └── Redis 7 (cache + filas de email)
```
