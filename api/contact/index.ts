import "../lib/sentry.js";
import { desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { contactSubmissions } from "../lib/schema/index.js";
import { requireSystemAdmin } from "../lib/middleware/auth.js";
import { jsonOk, jsonError, parsePagination } from "../lib/response.js";
import { contactLimiter, checkRateLimit, getClientIp, rateLimitResponse } from "../lib/rateLimit.js";

/** Map a Drizzle contact submission row to snake_case for the frontend */
function contactToSnake(c: typeof contactSubmissions.$inferSelect) {
  return {
    id: c.id,
    email: c.email,
    first_name: c.firstName,
    last_name: c.lastName,
    organization: c.organization,
    phone: c.phone,
    topic: c.topic,
    message: c.message,
    status: c.status,
    created_at: c.createdAt?.toISOString() ?? null,
    updated_at: c.updatedAt?.toISOString() ?? null,
  };
}

/**
 * POST /api/contact
 * Submit a contact form. No auth required.
 * Body: { email, first_name?, last_name?, organization?, phone?, topic?, message }
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = await checkRateLimit(contactLimiter, ip);
    if (!success) return rateLimitResponse();

    const body = await req.json();

    const { email, message } = body;

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return jsonError("email is required", 400);
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return jsonError("message is required", 400);
    }

    const [created] = await db
      .insert(contactSubmissions)
      .values({
        email: email.trim(),
        firstName: body.first_name ?? undefined,
        lastName: body.last_name ?? undefined,
        organization: body.organization ?? undefined,
        phone: body.phone ?? undefined,
        topic: body.topic ?? undefined,
        message: message.trim(),
      })
      .returning();

    return jsonOk(contactToSnake(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * GET /api/contact
 * List all contact submissions. Requires system admin.
 * Supports pagination via ?limit=&offset= query params.
 * Ordered by created_at desc.
 */
export async function GET(req: Request) {
  try {
    await requireSystemAdmin(req);

    const url = new URL(req.url);
    const { limit, offset } = parsePagination(url);

    const rows = await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(limit)
      .offset(offset);

    return jsonOk(rows.map(contactToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
