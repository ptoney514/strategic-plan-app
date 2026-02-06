import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { schoolAdmins } from "../lib/schema/index";
import {
  requireAuth,
  requireSystemAdmin,
  requireOrgMember,
} from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/** Map a Drizzle school admin row to snake_case for the frontend */
function schoolAdminToSnake(sa: typeof schoolAdmins.$inferSelect) {
  return {
    id: sa.id,
    user_id: sa.userId,
    school_id: sa.schoolId,
    school_slug: sa.schoolSlug,
    district_slug: sa.districtSlug,
    created_at: sa.createdAt?.toISOString() ?? null,
    created_by: sa.createdBy,
  };
}

/**
 * GET /api/school-admins
 * Get current user's school admin assignments. Requires auth.
 */
export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const rows = await db
      .select()
      .from(schoolAdmins)
      .where(eq(schoolAdmins.userId, user.id));

    return jsonOk(rows.map(schoolAdminToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * POST /api/school-admins
 * Assign a school admin. Requires auth + system admin or org admin.
 * Body: { user_id, school_id, school_slug, district_slug }
 */
export async function POST(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    const { user_id, school_id, school_slug, district_slug } = body;

    if (!user_id) return jsonError("user_id is required", 400);
    if (!school_id) return jsonError("school_id is required", 400);
    if (!school_slug) return jsonError("school_slug is required", 400);
    if (!district_slug) return jsonError("district_slug is required", 400);

    // Check authorization: system admin or org admin for the district
    if (!user.isSystemAdmin) {
      await requireOrgMember(req, district_slug, "admin");
    }

    const [created] = await db
      .insert(schoolAdmins)
      .values({
        userId: user_id,
        schoolId: school_id,
        schoolSlug: school_slug,
        districtSlug: district_slug,
        createdBy: user.id,
      })
      .returning();

    return jsonOk(schoolAdminToSnake(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
