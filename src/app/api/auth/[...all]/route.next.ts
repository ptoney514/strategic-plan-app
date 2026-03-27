import "@api/lib/sentry";
import { auth } from "@api/lib/auth";
import { authLimiter, checkRateLimit, getClientIp, rateLimitResponse } from "@api/lib/rateLimit";

export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = await checkRateLimit(authLimiter, ip);
  if (!success) return rateLimitResponse();
  return auth.handler(request);
}
