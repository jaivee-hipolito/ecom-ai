/**
 * Simple in-memory rate limiter to mitigate brute-force and DDoS-style abuse.
 * Use for auth endpoints (login, register, forgot-password, verify-code).
 * For multi-instance production, use Redis (e.g. @upstash/ratelimit).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // per window per identifier

function getKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (data.resetAt < now) store.delete(key);
  }
}

/**
 * Check rate limit by IP (or other identifier). Returns true if allowed, false if rate limited.
 * Call this at the start of sensitive API routes (login, register, forgot-password).
 */
export function checkRateLimit(identifier: string, prefix = "api"): { allowed: boolean; remaining: number; resetIn: number } {
  cleanup();
  const key = getKey(identifier, prefix);
  const now = Date.now();
  let data = store.get(key);

  if (!data) {
    data = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, data);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (now >= data.resetAt) {
    data = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, data);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  data.count += 1;
  const allowed = data.count <= MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - data.count);
  const resetIn = data.resetAt - now;

  return { allowed, remaining, resetIn };
}

/**
 * Get client IP from request (Vercel/Next.js).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}
