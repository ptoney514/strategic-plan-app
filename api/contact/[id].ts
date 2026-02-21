import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { contactSubmissions } from "../lib/schema/index.js";
import { requireSystemAdmin } from "../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../lib/response.js";

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
 * PUT /api/contact/[id]
 * Update contact submission status. Requires system admin.
 * Body: { status }
 */
export async function PUT(req: Request) {
  try {
    await requireSystemAdmin(req);

    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Contact submission ID is required", 400);

    const body = await req.json();

    if (!body.status || typeof body.status !== "string") {
      return jsonError("status is required", 400);
    }

    const [existing] = await db
      .select({ id: contactSubmissions.id })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);

    if (!existing) return jsonError("Contact submission not found", 404);

    const [updated] = await db
      .update(contactSubmissions)
      .set({ status: body.status })
      .where(eq(contactSubmissions.id, id))
      .returning();

    return jsonOk(contactToSnake(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/contact/[id]
 * Delete a contact submission. Requires system admin.
 */
export async function DELETE(req: Request) {
  try {
    await requireSystemAdmin(req);

    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Contact submission ID is required", 400);

    const [existing] = await db
      .select({ id: contactSubmissions.id })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);

    if (!existing) return jsonError("Contact submission not found", 404);

    await db
      .delete(contactSubmissions)
      .where(eq(contactSubmissions.id, id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
