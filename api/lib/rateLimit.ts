import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Returns null if Upstash env vars not set — callers degrade gracefully
function createLimiter(requests: number, window: string): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`),
  });
}

export const authLimiter = createLimiter(5, '1 m');    // 5/min — login, password reset
export const contactLimiter = createLimiter(3, '1 m'); // 3/min — contact form
export const apiLimiter = createLimiter(60, '1 m');    // 60/min — general API

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!limiter) return { success: true };
  try {
    return await limiter.limit(identifier);
  } catch {
    // Fail open — if Redis is down, allow the request through
    return { success: true };
  }
}

/**
 * Extract client IP from Vercel's x-forwarded-for header.
 * Use as the identifier for rate limiting.
 */
export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

/**
 * Return a 429 JSON response for rate-limited requests.
 */
export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests' }),
    { status: 429, headers: { 'Content-Type': 'application/json' } },
  );
}
