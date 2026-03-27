import "../lib/sentry.js";
import { auth } from "../lib/auth.js";
import { authLimiter, checkRateLimit, getClientIp, rateLimitResponse } from "../lib/rateLimit.js";

export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = await checkRateLimit(authLimiter, ip);
  if (!success) return rateLimitResponse();
  return auth.handler(request);
}
