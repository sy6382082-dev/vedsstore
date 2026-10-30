// In-memory rate limiter — suitable for development.
// Replace with Redis (ioredis + sliding window) for production.

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

