import "@api/lib/sentry";
import { desc } from "drizzle-orm";
import { db } from "@api/lib/db";
import { contactSubmissions } from "@api/lib/schema/index";
import { requireSystemAdmin } from "@api/lib/middleware/auth";
import { jsonOk, jsonError, parsePagination } from "@api/lib/response";
import { contactLimiter, checkRateLimit, getClientIp, rateLimitResponse } from "@api/lib/rateLimit";
import { sendEmail } from "@api/lib/email";
import { demoRequestNotificationHtml } from "@api/lib/email-templates";

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

    // Send notification email for demo requests
    if (body.topic === "demo_request") {
      const name = [body.first_name, body.last_name].filter(Boolean).join(" ") || "Unknown";
      const roleMatch = message.match(/\nRole:\s*(.+)$/);
      const role = roleMatch ? roleMatch[1].trim() : "Not specified";
      sendEmail({
        to: "sales@stratadash.org",
        subject: `Demo Request from ${name} — ${body.organization || "Unknown org"}`,
        html: demoRequestNotificationHtml({
          name,
          email: email.trim(),
          organization: body.organization || "",
          role,
          message: message.trim(),
        }),
      }).catch((err) => console.error("[contact] Failed to send demo notification:", err));
    }

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
