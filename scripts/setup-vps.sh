#!/bin/bash
# scripts/setup-vps.sh
# Executar UMA VEZ na VPS após o primeiro acesso SSH
# sudo bash scripts/setup-vps.sh
set -e

echo "🔧 Setup inicial da VPS — INP Psicotécnico"

# ─── Node.js 20 via nvm ───────────────────────────────
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

# ─── PostgreSQL 15 ────────────────────────────────────
sudo apt update && sudo apt install -y postgresql-15

# Criar utilizador e base de dados
sudo -u postgres psql <<SQL
CREATE USER inp_user WITH PASSWORD 'MUDAR_ESTA_PASSWORD';
CREATE DATABASE inp_psicotecnico OWNER inp_user;
GRANT ALL PRIVILEGES ON DATABASE inp_psicotecnico TO inp_user;
SQL

# ─── Redis ────────────────────────────────────────────
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# ─── PM2 global ──────────────────────────────────────
npm install -g pm2
pm2 startup systemd -u $USER --hp $HOME

# ─── Nginx ────────────────────────────────────────────
sudo apt install -y nginx
sudo systemctl enable nginx

# ─── Certbot (SSL) ────────────────────────────────────
sudo apt install -y certbot python3-certbot-nginx
# Após configurar o DNS, executar:
# sudo certbot --nginx -d inscricoes.inp.co.ao

# ─── Pasta da aplicação ───────────────────────────────
sudo mkdir -p /var/www/inp-psicotecnico
sudo chown -R $USER:$USER /var/www/inp-psicotecnico
mkdir -p /var/www/inp-psicotecnico/logs

# Clonar o repositório
git clone https://github.com/SEU_USER/inp-psicotecnico.git /var/www/inp-psicotecnico

echo "✅ Setup concluído!"
echo ""
echo "⚠️  Passos seguintes:"
echo "   1. Editar /var/www/inp-psicotecnico/backend/.env com as credenciais de produção"
echo "   2. sudo cp nginx/inscricoes.inp.co.ao.conf /etc/nginx/sites-available/"
echo "   3. sudo ln -s /etc/nginx/sites-available/inscricoes.inp.co.ao.conf /etc/nginx/sites-enabled/"
echo "   4. sudo certbot --nginx -d inscricoes.inp.co.ao"
echo "   5. bash scripts/deploy.sh"
