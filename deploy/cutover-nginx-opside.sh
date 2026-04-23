#!/usr/bin/env bash
set -euo pipefail

CONF_SRC="${1:-/home/ubuntu/OPSIDE_Project/deploy/nginx/app-opside-split.conf}"
CONF_DST="/etc/nginx/conf.d/app-opside.conf"
API_CERT_DIR="/etc/letsencrypt/live/api-app.opside.code-talent.fr"
BACKUP="/etc/nginx/conf.d/app-opside.conf.bak.$(date +%Y%m%d%H%M%S)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root (example: sudo bash $0)" >&2
  exit 1
fi

if [[ ! -f "${CONF_SRC}" ]]; then
  echo "Missing source conf: ${CONF_SRC}" >&2
  exit 1
fi

if [[ ! -d "${API_CERT_DIR}" ]]; then
  echo "Missing TLS cert for api-app.opside.code-talent.fr" >&2
  echo "Create it first, for example:" >&2
  echo "  sudo certbot certonly --nginx -d api-app.opside.code-talent.fr" >&2
  exit 2
fi

rollback() {
  if [[ -f "${BACKUP}" ]]; then
    cp -f "${BACKUP}" "${CONF_DST}" || true
    nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
  fi
}
trap rollback ERR

echo "[1/5] Backup current Nginx conf"
cp -f "${CONF_DST}" "${BACKUP}"

echo "[2/5] Install new split conf"
cp -f "${CONF_SRC}" "${CONF_DST}"

echo "[3/5] Validate Nginx config"
nginx -t

echo "[4/5] Reload Nginx"
systemctl reload nginx

echo "[5/5] Quick health checks"
curl -skS --resolve app.opside.code-talent.fr:443:127.0.0.1 \
  -o /dev/null -w "app_https_status:%{http_code}\n" https://app.opside.code-talent.fr/
curl -skS --resolve api-app.opside.code-talent.fr:443:127.0.0.1 \
  -o /dev/null -w "api_https_status:%{http_code}\n" https://api-app.opside.code-talent.fr/

echo "Cutover complete. Backup kept at: ${BACKUP}"
