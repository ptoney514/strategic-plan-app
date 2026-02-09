import { eq, and } from "drizzle-orm";
import { db } from "../../../lib/db.js";
import { schools, organizations } from "../../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../../lib/response.js";

/** Map a Drizzle school row to snake_case for the frontend */
function schoolToSnake(s: typeof schools.$inferSelect) {
  return {
    id: s.id,
    organization_id: s.organizationId,
    name: s.name,
    slug: s.slug,
    logo_url: s.logoUrl,
    address: s.address,
    phone: s.phone,
    principal_name: s.principalName,
    principal_email: s.principalEmail,
    student_count: s.studentCount,
    is_public: s.isPublic,
    is_active: s.isActive,
    created_at: s.createdAt?.toISOString() ?? null,
    updated_at: s.updatedAt?.toISOString() ?? null,
  };
}

/**
 * GET /api/schools/by-slug/[districtSlug]/[schoolSlug]
 * Get a school by district slug and school slug.
 * Looks up the organization by districtSlug, then the school by orgId + schoolSlug.
 */
export async function GET(req: Request) {
  try {
    const segments = new URL(req.url).pathname.split("/");
    // pathname: /api/schools/by-slug/{districtSlug}/{schoolSlug}
    const districtSlug = segments[4];
    const schoolSlug = segments[5];

    if (!districtSlug) return jsonError("District slug is required", 400);
    if (!schoolSlug) return jsonError("School slug is required", 400);

    // Look up organization by district slug
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, districtSlug))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    // Look up school by org + school slug
    const [school] = await db
      .select()
      .from(schools)
      .where(
        and(
          eq(schools.organizationId, org.id),
          eq(schools.slug, schoolSlug),
        ),
      )
      .limit(1);

    if (!school) return jsonError("School not found", 404);

    return jsonOk(schoolToSnake(school));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
