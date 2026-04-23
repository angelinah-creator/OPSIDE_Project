process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'test_access_secret_32_chars_minimum_value';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_32_chars_minimum_value';
process.env.THROTTLE_LIMIT = process.env.THROTTLE_LIMIT || '100';
process.env.THROTTLE_TTL_MS = process.env.THROTTLE_TTL_MS || '60000';
