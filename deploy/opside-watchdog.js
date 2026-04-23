const { exec } = require('child_process');
const fs = require('fs');

const backendPort = Number(process.env.OPSIDE_BACKEND_PORT || 3001);
const frontendPort = Number(process.env.OPSIDE_FRONTEND_PORT || 3002);
const backendName = process.env.OPSIDE_BACKEND_PM2_NAME || 'app-agent-backend';
const frontendName = process.env.OPSIDE_FRONTEND_PM2_NAME || 'opside-frontend';
const backendPath = process.env.OPSIDE_BACKEND_HEALTH_PATH || '/';
const frontendPath = process.env.OPSIDE_FRONTEND_HEALTH_PATH || '/';
const backendMemLimitMb = Number(process.env.OPSIDE_BACKEND_MEM_MB_LIMIT || 850);
const frontendMemLimitMb = Number(process.env.OPSIDE_FRONTEND_MEM_MB_LIMIT || 1050);
const failThreshold = Number(process.env.OPSIDE_FAIL_THRESHOLD || 3);
const cooldownMs = Number(process.env.OPSIDE_RESTART_COOLDOWN_MS || 120000);
const intervalMs = Number(process.env.OPSIDE_WATCHDOG_INTERVAL_MS || 30000);
const startupGraceMs = Number(process.env.OPSIDE_STARTUP_GRACE_MS || 90000);
const zeroProbeWindowMs = Number(process.env.OPSIDE_ZERO_PROBE_WINDOW_MS || 300000);
const zeroProbeThreshold = Number(process.env.OPSIDE_ZERO_PROBE_THRESHOLD || 3);
const restartHistorySize = Number(process.env.OPSIDE_RESTART_HISTORY_SIZE || 10);

const stateFile = '/home/ubuntu/ops/opside-watchdog-state.json';
const runOnce = process.argv.includes('--once');

function run(command, timeout = 12000) {
  return new Promise((resolve) => {
    exec(command, { timeout }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: (stdout || '').trim(),
        stderr: (stderr || '').trim(),
      });
    });
  });
}

function readState() {
  const defaults = {
    backendFails: 0,
    frontendFails: 0,
    backendMemFails: 0,
    frontendMemFails: 0,
    backendLastRestart: 0,
    frontendLastRestart: 0,
    backendLastReason: 'none',
    frontendLastReason: 'none',
    backendLastRestartResult: 'none',
    frontendLastRestartResult: 'none',
    backendZeroProbeTimestamps: [],
    frontendZeroProbeTimestamps: [],
    backendZeroProbeAlert: false,
    frontendZeroProbeAlert: false,
    startupAt: 0,
    startupGraceMs,
    zeroProbeWindowMs,
    zeroProbeThreshold,
    restartEvents: [],
  };

  try {
    const current = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const merged = { ...defaults, ...current };

    merged.backendZeroProbeTimestamps = Array.isArray(merged.backendZeroProbeTimestamps)
      ? merged.backendZeroProbeTimestamps
      : [];
    merged.frontendZeroProbeTimestamps = Array.isArray(merged.frontendZeroProbeTimestamps)
      ? merged.frontendZeroProbeTimestamps
      : [];
    merged.restartEvents = Array.isArray(merged.restartEvents) ? merged.restartEvents : [];

    return merged;
  } catch {
    return defaults;
  }
}

function writeState(state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
}

function log(message) {
  const line = `${new Date().toISOString()} ${message}`;
  console.log(line);
}

async function httpCode(url) {
  const probe = async () => {
    const out = await run(`curl -sS -m 5 -o /dev/null -w "%{http_code}" "${url}"`);
    if (!out.ok) return '000';
    return out.stdout || '000';
  };

  const first = await probe();
  if (first !== '000') return first;

  // Retry once to avoid counting transient socket/timeouts as hard failures.
  const second = await probe();
  return second || '000';
}

function isHealthyHttpCode(code) {
  if (!code || code === '000') return false;
  if (/^5\d\d$/.test(code)) return false;
  return true;
}

function updateZeroProbeWindow(existing, code, now) {
  const list = Array.isArray(existing) ? existing.slice() : [];
  if (code === '000') {
    list.push(now);
  }
  return list
    .filter((ts) => Number.isFinite(ts) && now - ts <= zeroProbeWindowMs)
    .slice(-50);
}

function appendRestartEvent(state, event) {
  const history = Array.isArray(state.restartEvents) ? state.restartEvents : [];
  history.unshift(event);
  state.restartEvents = history.slice(0, restartHistorySize);
}

async function getPm2Map() {
  const out = await run('pm2 jlist', 20000);
  if (!out.ok || !out.stdout) return new Map();
  try {
    const data = JSON.parse(out.stdout);
    const map = new Map();
    data.forEach((app) => {
      map.set(app.name, {
        status: app?.pm2_env?.status || 'unknown',
        memoryMb: app?.monit?.memory ? app.monit.memory / (1024 * 1024) : 0,
      });
    });
    return map;
  } catch {
    return new Map();
  }
}

async function maybeRestart(appName, reason, stateKey) {
  const now = Date.now();
  const lastRestartKey = `${stateKey}LastRestart`;
  if (now - (global.state[lastRestartKey] || 0) < cooldownMs) {
    log(`skip_restart app=${appName} reason=${reason} cooldown=true`);
    return;
  }

  const out = await run(`pm2 restart ${appName}`, 20000);
  const lastReasonKey = `${stateKey}LastReason`;
  const lastResultKey = `${stateKey}LastRestartResult`;
  const result = out.ok ? 'ok' : 'failed';

  global.state[lastRestartKey] = now;
  global.state[lastReasonKey] = reason;
  global.state[lastResultKey] = result;

  appendRestartEvent(global.state, {
    ts: now,
    target: stateKey,
    app: appName,
    reason,
    result,
  });

  if (out.ok) {
    log(`restart_ok app=${appName} reason=${reason}`);
  } else {
    log(`restart_failed app=${appName} reason=${reason} stderr=${out.stderr}`);
  }
}

async function tick() {
  const pm2Map = await getPm2Map();
  const backend = pm2Map.get(backendName);
  const frontend = pm2Map.get(frontendName);

  const backendCode = await httpCode(`http://127.0.0.1:${backendPort}${backendPath}`);
  const frontendCode = await httpCode(`http://127.0.0.1:${frontendPort}${frontendPath}`);

  const now = Date.now();
  const startupAt = Number(global.state.startupAt || now);
  const inStartupGrace = now - startupAt < startupGraceMs;

  global.state.backendZeroProbeTimestamps = updateZeroProbeWindow(
    global.state.backendZeroProbeTimestamps,
    backendCode,
    now,
  );
  global.state.frontendZeroProbeTimestamps = updateZeroProbeWindow(
    global.state.frontendZeroProbeTimestamps,
    frontendCode,
    now,
  );
  global.state.backendZeroProbeAlert =
    global.state.backendZeroProbeTimestamps.length >= zeroProbeThreshold;
  global.state.frontendZeroProbeAlert =
    global.state.frontendZeroProbeTimestamps.length >= zeroProbeThreshold;

  const backendHttpHealthy =
    isHealthyHttpCode(backendCode) || (inStartupGrace && backendCode === '000');
  const frontendHttpHealthy =
    isHealthyHttpCode(frontendCode) || (inStartupGrace && frontendCode === '000');

  const backendHealthy = backend?.status === 'online' && backendHttpHealthy;
  const frontendHealthy = frontend?.status === 'online' && frontendHttpHealthy;

  global.state.backendFails = backendHealthy ? 0 : global.state.backendFails + 1;
  global.state.frontendFails = frontendHealthy ? 0 : global.state.frontendFails + 1;

  const backendMemHigh = (backend?.memoryMb || 0) > backendMemLimitMb;
  const frontendMemHigh = (frontend?.memoryMb || 0) > frontendMemLimitMb;

  global.state.backendMemFails = backendMemHigh ? global.state.backendMemFails + 1 : 0;
  global.state.frontendMemFails = frontendMemHigh ? global.state.frontendMemFails + 1 : 0;

  if (global.state.backendFails >= failThreshold) {
    await maybeRestart(backendName, `health_fail_${global.state.backendFails}`, 'backend');
    global.state.backendFails = 0;
  }

  if (global.state.frontendFails >= failThreshold) {
    await maybeRestart(frontendName, `health_fail_${global.state.frontendFails}`, 'frontend');
    global.state.frontendFails = 0;
  }

  if (global.state.backendMemFails >= failThreshold) {
    await maybeRestart(backendName, `memory_high_${Math.round(backend?.memoryMb || 0)}mb`, 'backend');
    global.state.backendMemFails = 0;
  }

  if (global.state.frontendMemFails >= failThreshold) {
    await maybeRestart(frontendName, `memory_high_${Math.round(frontend?.memoryMb || 0)}mb`, 'frontend');
    global.state.frontendMemFails = 0;
  }

  global.state.startupGraceMs = startupGraceMs;
  global.state.zeroProbeWindowMs = zeroProbeWindowMs;
  global.state.zeroProbeThreshold = zeroProbeThreshold;

  writeState(global.state);
  log(
    `tick backend=${backend?.status || 'missing'} code=${backendCode} mem=${Math.round(
      backend?.memoryMb || 0,
    )}MB frontend=${frontend?.status || 'missing'} code=${frontendCode} mem=${Math.round(
      frontend?.memoryMb || 0,
    )}MB grace=${inStartupGrace} zero000=${global.state.backendZeroProbeTimestamps.length}/${global.state.frontendZeroProbeTimestamps.length}`,
  );
}

async function main() {
  try {
    fs.mkdirSync('/home/ubuntu/ops', { recursive: true });
  } catch {}

  global.state = readState();
  global.state.startupAt = Date.now();
  global.state.startupGraceMs = startupGraceMs;
  global.state.zeroProbeWindowMs = zeroProbeWindowMs;
  global.state.zeroProbeThreshold = zeroProbeThreshold;
  writeState(global.state);

  log(
    `watchdog_start backend=${backendName} frontend=${frontendName} intervalMs=${intervalMs} startupGraceMs=${startupGraceMs} zeroProbeWindowMs=${zeroProbeWindowMs} zeroProbeThreshold=${zeroProbeThreshold}`,
  );

  await tick();
  if (runOnce) {
    return;
  }

  setInterval(() => {
    tick().catch((error) => {
      log(`tick_error message=${error?.message || 'unknown'}`);
    });
  }, intervalMs);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
