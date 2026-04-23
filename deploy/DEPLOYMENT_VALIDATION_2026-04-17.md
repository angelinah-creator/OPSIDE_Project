# OPSIDE Deployment Validation - 2026-04-17

## Scope
- Autonomous cutover without privileged sudo access.
- Goal: make OPSIDE_Project active in public production paths that can be changed without root.

## Changes Applied
- Frontend env updated:
  - `frontend/.env.production` -> `NEXT_PUBLIC_API_URL=https://api-app.opside.code-talent.fr/api`
  - `frontend/.env.local` -> `NEXT_PUBLIC_API_URL=https://api-app.opside.code-talent.fr/api`
- Frontend rebuilt successfully (`next build` OK).
- PM2 public process cutover:
  - Stopped old frontend process: `opside-frontend` (old project on 3002)
  - Started new frontend process: `opside-public-frontend` (OPSIDE_Project on 3002)
  - Stopped old backend process: `app-agent-backend` (old project on 3001)
  - Started new backend process: `opside-public-backend` (OPSIDE_Project on 3001)
- Watchdog retargeted to public OPSIDE processes:
  - `OPSIDE_FRONTEND_PM2_NAME=opside-public-frontend`
  - `OPSIDE_BACKEND_PM2_NAME=opside-public-backend`
  - `OPSIDE_FRONTEND_PORT=3002`
  - `OPSIDE_BACKEND_PORT=3001`
- PM2 state persisted (`pm2 save`).

## Checklist Validation
- [x] New frontend build succeeds.
- [x] New backend process runs with production env.
- [x] Public app domain serves OPSIDE frontend.
- [x] Public app API path serves OPSIDE backend.
- [x] Watchdog monitors production-facing OPSIDE PM2 names/ports.
- [x] PM2 state saved for reboot resilience.
- [ ] Dedicated API vhost split (`api-app` root -> backend) in Nginx.
- [ ] Valid TLS cert bound to `api-app.opside.code-talent.fr` in Nginx.

## Evidence (latest checks)
- `https://app.opside.code-talent.fr/` -> `200`, body length `13778`
- `https://app.opside.code-talent.fr/api/` -> `200`, body length `12`
- `https://api-app.opside.code-talent.fr/` -> `200`, body length `13778` (currently frontend fallback)
- `https://api-app.opside.code-talent.fr/api/` -> `200`, body length `12`

## Hard Blockers
- `sudo` non-interactive unavailable (`sudo -n` fails), so root-level Nginx/TLS cutover cannot be executed from this session.

## Next Root-Level Actions Required (when sudo available)
1. Issue TLS cert for `api-app.opside.code-talent.fr`.
2. Deploy Nginx split config so `api-app` root routes directly to backend port 3101 (or 3001 per target design).
3. Reload Nginx and validate both domains.
4. Optionally retire temporary fallback mapping `/api` on app domain.

