import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { user } from "../../lib/schema/index.js";
import { requireSystemAdmin } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/**
 * PUT /api/admin/users/[id]
 * Update a user (toggle system admin status). Requires system admin.
 * Body: { is_system_admin: boolean }
 */
export async function PUT(req: Request) {
  try {
    const { user: admin } = await requireSystemAdmin(req);

    const segments = new URL(req.url).pathname.split("/");
    const id = segments[4]; // /api/admin/users/{id}

    if (!id) {
      return jsonError("User ID is required", 400);
    }

    // Prevent admins from demoting themselves
    if (id === admin.id) {
      return jsonError("Cannot modify your own system admin status", 400);
    }

    const body = await req.json();
    const { is_system_admin } = body;

    if (typeof is_system_admin !== "boolean") {
      return jsonError("is_system_admin must be a boolean", 400);
    }

    const [updated] = await db
      .update(user)
      .set({ isSystemAdmin: is_system_admin })
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        email: user.email,
        name: user.name,
        isSystemAdmin: user.isSystemAdmin,
      });

    if (!updated) {
      return jsonError("User not found", 404);
    }

    return jsonOk({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      is_system_admin: updated.isSystemAdmin,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
