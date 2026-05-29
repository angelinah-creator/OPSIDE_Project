#!/usr/bin/env bash
# ============================================================
# full-migration-opside.sh
# 1. Génère les certificats SSL pour opsideworks.com
# 2. Corrige les ports Nginx (3001/3002 → 3101/3102)
# 3. Active le nouveau domaine
# ============================================================
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "❌ ERREUR : Ce script doit être lancé avec sudo."
  echo "Usage : sudo bash $0"
  exit 1
fi

echo "--- [1/4] GÉNÉRATION DES CERTIFICATS SSL ---"
# Tentative de génération via certbot
certbot certonly --nginx --agree-tos --non-interactive -m dev@code-talent.fr \
  -d opsideworks.com -d www.opsideworks.com -d api.opsideworks.com || {
    echo "⚠️ Certbot a échoué. Vérifiez que le DNS pointe bien sur ce serveur."
    echo "Vous pouvez réessayer manuellement avec : sudo certbot --nginx"
}

CONF="/etc/nginx/conf.d/app-opside.conf"
BAK="${CONF}.bak.$(date +%Y%m%d_%H%M%S)"

echo "--- [2/4] MISE À JOUR CONFIG NGINX (Ports 3101/3102) ---"
cp "$CONF" "$BAK"

cat > "$CONF" << 'NGINX_EOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# ─── DOMAINE ACTUEL ───────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name app.opside.code-talent.fr;

    ssl_certificate     /etc/letsencrypt/live/app.opside.code-talent.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.opside.code-talent.fr/privkey.pem;

    location /api/ {
        proxy_pass         http://127.0.0.1:3101/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
    }

    location / {
        proxy_pass         http://127.0.0.1:3102;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
    }
}

server {
    listen 80;
    server_name app.opside.code-talent.fr;
    return 301 https://$host$request_uri;
}

# ─── NOUVEAU DOMAINE OPSIDEWORKS.COM ──────────────────────────────────────────
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name opsideworks.com www.opsideworks.com;

    # Note: On utilise le certif opsideworks.com s'il existe, sinon fallback
    ssl_certificate     /etc/letsencrypt/live/opsideworks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/opsideworks.com/privkey.pem;

    location /api/ {
        proxy_pass         http://127.0.0.1:3101/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
    }

    location / {
        proxy_pass         http://127.0.0.1:3102;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name api.opsideworks.com;

    ssl_certificate     /etc/letsencrypt/live/api.opsideworks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.opsideworks.com/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
    }
}

server {
    listen 80;
    server_name opsideworks.com www.opsideworks.com api.opsideworks.com;
    return 301 https://$host$request_uri;
}
NGINX_EOF

echo "--- [3/4] VALIDATION ET RELOAD NGINX ---"
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx rechargé avec succès."
else
    echo "❌ Erreur dans la config Nginx, rollback..."
    cp "$BAK" "$CONF"
    exit 1
fi

echo "--- [4/4] VÉRIFICATION FINALE ---"
sleep 2
echo "Statut app.opside.code-talent.fr : $(curl -s -o /dev/null -w "%{http_code}" https://app.opside.code-talent.fr/)"
echo "Statut opsideworks.com           : $(curl -s -o /dev/null -w "%{http_code}" https://opsideworks.com/ || echo "N/A (SSL?)")"

echo ""
echo "================================================"
echo " MIGRATION TERMINÉE"
echo "================================================"

