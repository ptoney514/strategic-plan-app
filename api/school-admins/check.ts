import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import {
  organizations,
  organizationMembers,
  schoolAdmins,
  schools,
} from "../lib/schema/index";
import { requireAuth } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/**
 * GET /api/school-admins/check?district=slug&school=slug
 * Check if current user can access a school.
 * Returns: { hasAccess: boolean, accessLevel: 'system_admin' | 'district_admin' | 'school_admin' | 'none' }
 */
export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const url = new URL(req.url);
    const districtSlug = url.searchParams.get("district");
    const schoolSlug = url.searchParams.get("school");

    if (!districtSlug) return jsonError("district query parameter is required", 400);
    if (!schoolSlug) return jsonError("school query parameter is required", 400);

    // System admins have full access
    if (user.isSystemAdmin) {
      return jsonOk({ hasAccess: true, accessLevel: "system_admin" });
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
      return jsonOk({ hasAccess: true, accessLevel: "district_admin" });
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
      return jsonOk({ hasAccess: true, accessLevel: "school_admin" });
    }

    return jsonOk({ hasAccess: false, accessLevel: "none" });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
