import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * In-memory rate limiter. Returns true if the request should be BLOCKED.
 * @param key    unique bucket key (e.g. 'login', 'register')
 * @param limit  max requests per window
 * @param windowMs window duration in ms
 */
export function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  cleanup();
  const ip = getClientIp(req);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const entry = store.get(bucketKey);

  if (!entry || entry.resetAt < now) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}
