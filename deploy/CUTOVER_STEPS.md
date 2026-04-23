# OPSIDE Cutover - Step by Step (Low Risk)

## Preconditions
- New stack is already running:
  - frontend: `127.0.0.1:3102`
  - backend: `127.0.0.1:3101`
- Script prepared: `deploy/cutover-nginx-opside.sh`
- Nginx template prepared: `deploy/nginx/app-opside-split.conf`

## 1) Create TLS certificate for api-app
Run exactly:

```bash
sudo certbot certonly --nginx -d api-app.opside.code-talent.fr
```

Expected:
- certificate files created under `/etc/letsencrypt/live/api-app.opside.code-talent.fr/`

## 2) Apply Nginx split config with rollback safety
Run exactly:

```bash
sudo bash /home/ubuntu/OPSIDE_Project/deploy/cutover-nginx-opside.sh
```

Expected:
- `[3/5] Validate Nginx config` passes
- script prints both status lines:
  - `app_https_status:200`
  - `api_https_status:200` or `301` (acceptable for FORCE_HTTPS backend redirect behavior)

## 3) Verify public endpoints
Run exactly:

```bash
curl -I https://app.opside.code-talent.fr
curl -I https://api-app.opside.code-talent.fr
```

Expected:
- both endpoints respond over HTTPS
- app serves frontend, api serves backend

## 4) Keep old PM2 apps for short observation window
Do not stop old apps immediately. Observe 15-30 minutes first.

## 5) Retire old stack only after validation
Run when ready:

```bash
pm2 stop opside-frontend app-agent-backend
pm2 delete opside-frontend app-agent-backend
pm2 save
```

## Rollback (if needed)
Use backup path printed by cutover script, then:

```bash
sudo cp -f /etc/nginx/conf.d/app-opside.conf.bak.<timestamp> /etc/nginx/conf.d/app-opside.conf
sudo nginx -t && sudo systemctl reload nginx
```
