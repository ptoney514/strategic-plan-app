import { eq } from "drizzle-orm";
import { db } from "@api/lib/db";
import { user } from "@api/lib/schema/index";
import { requireSystemAdmin } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * PUT /api/admin/users/[id]
 * Update a user (toggle system admin status). Requires system admin.
 * Body: { is_system_admin: boolean }
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user: admin } = await requireSystemAdmin(req);
    const { id } = await params;

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
