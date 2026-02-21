import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  organizations,
  organizationMembers,
  schoolAdmins,
  schools,
} from "../lib/schema/index.js";
import { requireAuth } from "../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../lib/response.js";

/**
 * GET /api/school-admins/check?district=slug&school=slug
 * Check if current user can access a school.
 * `district` param is optional — if omitted, checks school_admins directly.
 * Returns: { hasAccess, allowed, accessLevel }
 */
export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const url = new URL(req.url);
    const districtSlug = url.searchParams.get("district");
    const schoolSlug = url.searchParams.get("school");

    if (!schoolSlug) return jsonError("school query parameter is required", 400);

    // System admins have full access
    if (user.isSystemAdmin) {
      return jsonOk({ hasAccess: true, allowed: true, accessLevel: "system_admin" });
    }

    // If no district slug, do a direct school_admins lookup by school slug + userId
    if (!districtSlug) {
      const [schoolAdmin] = await db
        .select({ id: schoolAdmins.id })
        .from(schoolAdmins)
        .where(
          and(
            eq(schoolAdmins.schoolSlug, schoolSlug),
            eq(schoolAdmins.userId, user.id),
          ),
        )
        .limit(1);

      if (schoolAdmin) {
        return jsonOk({ hasAccess: true, allowed: true, accessLevel: "school_admin" });
      }

      return jsonOk({ hasAccess: false, allowed: false, accessLevel: "none" });
    }

    // Look up the organization
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, districtSlug))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    // Check if user is an org member (district admin)
    const [membership] = await db
      .select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, org.id),
          eq(organizationMembers.userId, user.id),
        ),
      )
      .limit(1);

    if (membership) {
      return jsonOk({ hasAccess: true, allowed: true, accessLevel: "district_admin" });
    }

    // Look up the school to get its ID
    const [school] = await db
      .select({ id: schools.id })
      .from(schools)
      .where(
        and(
          eq(schools.organizationId, org.id),
          eq(schools.slug, schoolSlug),
        ),
      )
      .limit(1);

    if (!school) return jsonError("School not found", 404);

    // Check if user is a school admin
    const [schoolAdmin] = await db
      .select({ id: schoolAdmins.id })
      .from(schoolAdmins)
      .where(
        and(
          eq(schoolAdmins.schoolId, school.id),
          eq(schoolAdmins.userId, user.id),
        ),
      )
      .limit(1);

    if (schoolAdmin) {
      return jsonOk({ hasAccess: true, allowed: true, accessLevel: "school_admin" });
    }

    return jsonOk({ hasAccess: false, allowed: false, accessLevel: "none" });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
