import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { schools, organizations } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

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

/** Look up school -> organization slug */
async function getOrgSlugForSchool(schoolId: string) {
  const [row] = await db
    .select({
      schoolId: schools.id,
      orgSlug: organizations.slug,
    })
    .from(schools)
    .innerJoin(organizations, eq(schools.organizationId, organizations.id))
    .where(eq(schools.id, schoolId))
    .limit(1);

  return row ?? null;
}

/**
 * GET /api/schools/[id]
 * Get a school by ID.
 */
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("School ID is required", 400);

    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, id))
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

/**
 * PUT /api/schools/[id]
 * Update a school. Requires auth + org admin.
 * Updatable: name, slug, logoUrl, address, phone, principalName,
 *            principalEmail, studentCount, isPublic, isActive
 */
export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("School ID is required", 400);

    // Look up school -> org to verify membership
    const lookup = await getOrgSlugForSchool(id);
    if (!lookup) return jsonError("School not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "admin");

    const body = await req.json();

    const updates: Partial<typeof schools.$inferInsert> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.logo_url !== undefined) updates.logoUrl = body.logo_url;
    if (body.address !== undefined) updates.address = body.address;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.principal_name !== undefined)
      updates.principalName = body.principal_name;
    if (body.principal_email !== undefined)
      updates.principalEmail = body.principal_email;
    if (body.student_count !== undefined)
      updates.studentCount = body.student_count;
    if (body.is_public !== undefined) updates.isPublic = body.is_public;
    if (body.is_active !== undefined) updates.isActive = body.is_active;

    if (Object.keys(updates).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const [updated] = await db
      .update(schools)
      .set(updates)
      .where(eq(schools.id, id))
      .returning();

    return jsonOk(schoolToSnake(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/schools/[id]
 * Delete a school. Requires auth + org admin.
 */
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("School ID is required", 400);

    // Look up school -> org to verify membership
    const lookup = await getOrgSlugForSchool(id);
    if (!lookup) return jsonError("School not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "admin");

    await db.delete(schools).where(eq(schools.id, id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
