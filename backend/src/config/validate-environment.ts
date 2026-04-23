const REQUIRED_ENV_KEYS = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

function ensureSecretStrength(value: string, key: string): void {
  if (value.length < 32) {
    throw new Error(`${key} must be at least 32 characters long.`);
  }
}

export function validateEnvironment(): void {
  for (const key of REQUIRED_ENV_KEYS) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    ensureSecretStrength(value, key);
  }

  const throttleLimit = Number(process.env.THROTTLE_LIMIT || '100');
  const throttleTtlMs = Number(process.env.THROTTLE_TTL_MS || '60000');
  if (!Number.isFinite(throttleLimit) || throttleLimit <= 0) {
    throw new Error('THROTTLE_LIMIT must be a positive number.');
  }
  if (!Number.isFinite(throttleTtlMs) || throttleTtlMs <= 0) {
    throw new Error('THROTTLE_TTL_MS must be a positive number.');
  }
}
