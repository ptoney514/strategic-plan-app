import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { schoolAdmins, user } from "../lib/schema/index";
import { requireAuth } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/** Map a school admin + user join to snake_case for the frontend */
function adminWithUserToSnake(row: {
  schoolAdmin: typeof schoolAdmins.$inferSelect;
  user: typeof user.$inferSelect;
}) {
  return {
    id: row.schoolAdmin.id,
    user_id: row.schoolAdmin.userId,
    school_id: row.schoolAdmin.schoolId,
    school_slug: row.schoolAdmin.schoolSlug,
    district_slug: row.schoolAdmin.districtSlug,
    created_at: row.schoolAdmin.createdAt?.toISOString() ?? null,
    created_by: row.schoolAdmin.createdBy,
    user_name: row.user.name,
    user_email: row.user.email,
  };
}

/**
 * GET /api/school-admins/[schoolId]
 * Get admins for a school. Requires auth.
 * Joins with user table to return name/email.
 */
export async function GET(req: Request) {
  try {
    await requireAuth(req);

    const schoolId = new URL(req.url).pathname.split("/")[3];
    if (!schoolId) return jsonError("School ID is required", 400);

    const rows = await db
      .select({
        schoolAdmin: schoolAdmins,
        user: user,
      })
      .from(schoolAdmins)
      .innerJoin(user, eq(schoolAdmins.userId, user.id))
      .where(eq(schoolAdmins.schoolId, schoolId));

    return jsonOk(rows.map(adminWithUserToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/school-admins/[schoolId]?userId=xxx
 * Remove a school admin. Requires auth.
 * Query param: userId to identify which admin to remove.
 */
export async function DELETE(req: Request) {
  try {
    await requireAuth(req);

    const url = new URL(req.url);
    const schoolId = url.pathname.split("/")[3];
    const userId = url.searchParams.get("userId");

    if (!schoolId) return jsonError("School ID is required", 400);
    if (!userId) return jsonError("userId query parameter is required", 400);

    const [existing] = await db
      .select({ id: schoolAdmins.id })
      .from(schoolAdmins)
      .where(
        and(
          eq(schoolAdmins.schoolId, schoolId),
          eq(schoolAdmins.userId, userId),
        ),
      )
      .limit(1);

    if (!existing) return jsonError("School admin assignment not found", 404);

    await db
      .delete(schoolAdmins)
      .where(
        and(
          eq(schoolAdmins.schoolId, schoolId),
          eq(schoolAdmins.userId, userId),
        ),
      );

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
