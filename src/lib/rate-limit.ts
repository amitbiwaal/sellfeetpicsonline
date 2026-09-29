/**
 * Tiny in-memory fixed-window rate limiter. Good enough for a single server;
 * on serverless platforms each instance keeps its own counters.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) return { ok: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  return { ok: true, remaining: limit - bucket.count, retryAfterMs: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/** Best-effort client IP from proxy headers. */
export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
