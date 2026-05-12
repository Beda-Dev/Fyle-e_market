import { ApiError } from "./api-helpers";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function gc(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * In-memory sliding-window rate limiter.
 * Suffisant pour un déploiement single-instance. Pour du multi-instance,
 * remplacer par Upstash Redis (@upstash/ratelimit) sans changer l'API.
 */
export function rateLimit(
  request: Request,
  options: { key: string; limit: number; windowMs: number }
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return rateLimitByIdentifier(`${options.key}:${ip}`, options);
}

/**
 * Variante sans Request — utile quand on n'a accès qu'à une chaîne
 * d'identification (ex: email pour le login).
 */
export function rateLimitByIdentifier(
  identifier: string,
  options: { limit: number; windowMs: number }
) {
  const now = Date.now();
  gc(now);

  const existing = buckets.get(identifier);
  if (!existing || existing.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (existing.count >= options.limit) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    throw new ApiError(
      429,
      `Trop de tentatives. Réessayez dans ${retryAfter} seconde(s).`
    );
  }

  existing.count += 1;
}
