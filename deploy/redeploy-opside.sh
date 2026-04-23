#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/ubuntu/OPSIDE_Project"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
ECO="$ROOT/deploy/ecosystem.opside.cjs"

log() { printf '%s %s\n' "$(date -Is)" "$*"; }

mkdir -p /home/ubuntu/.local/bin
cat > /home/ubuntu/.local/bin/node22 <<'NODE22'
#!/usr/bin/env bash
set -euo pipefail
NODE22=$(find "$HOME/.npm/_npx" -type f -path '*/node_modules/node/bin/node' 2>/dev/null | head -n 1 || true)
if [[ -z "${NODE22}" ]]; then
  npx -y node@22.12.0 -e "process.exit(0)" >/dev/null 2>&1 || true
  NODE22=$(find "$HOME/.npm/_npx" -type f -path '*/node_modules/node/bin/node' 2>/dev/null | head -n 1 || true)
fi
if [[ -z "${NODE22}" ]]; then
  echo "node22 binary not found in npx cache" >&2
  exit 1
fi
exec "$NODE22" "$@"
NODE22
chmod +x /home/ubuntu/.local/bin/node22

log "backend_install"
cd "$BACKEND"
npm install --silent

log "backend_prisma_generate"
/home/ubuntu/.local/bin/node22 ./node_modules/prisma/build/index.js generate

log "backend_build"
/home/ubuntu/.local/bin/node22 ./node_modules/@nestjs/cli/bin/nest.js build

log "frontend_install"
cd "$FRONTEND"
npm install --silent

log "frontend_build"
npm run build

log "pm2_reload"
pm2 start "$ECO" --update-env
pm2 save

log "done"
