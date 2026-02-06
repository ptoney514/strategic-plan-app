import { desc } from "drizzle-orm";
import { db } from "../lib/db";
import { user } from "../lib/schema/index";
import { requireSystemAdmin } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/**
 * GET /api/admin/recent-users
 * Get recent users. Requires system admin.
 */
export async function GET(req: Request) {
  try {
    await requireSystemAdmin(req);

    const url = new URL(req.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "10", 10),
      100,
    );

    const users = await db
      .select()
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(limit);

    return jsonOk(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        image: u.image,
        is_system_admin: u.isSystemAdmin,
        created_at: u.createdAt,
        updated_at: u.updatedAt,
      })),
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
