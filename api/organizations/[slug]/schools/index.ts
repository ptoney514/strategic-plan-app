import { eq, and, asc } from "drizzle-orm";
import { db } from "../../../lib/db";
import { organizations, schools } from "../../../lib/schema/index";
import { requireOrgMember } from "../../../lib/middleware/auth";
import { jsonOk, jsonError, parsePagination } from "../../../lib/response";

export const config = { runtime: "edge" };

/** Map a Drizzle school row to snake_case for the frontend */
function schoolToSnakeCase(school: typeof schools.$inferSelect) {
  return {
    id: school.id,
    organization_id: school.organizationId,
    name: school.name,
    slug: school.slug,
    logo_url: school.logoUrl,
    address: school.address,
    phone: school.phone,
    principal_name: school.principalName,
    principal_email: school.principalEmail,
    student_count: school.studentCount,
    is_public: school.isPublic,
    is_active: school.isActive,
    created_at: school.createdAt?.toISOString() ?? null,
    updated_at: school.updatedAt?.toISOString() ?? null,
  };
}

/** Generate a URL-friendly slug from a name */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract the org slug from the URL path.
 * For /api/organizations/[slug]/schools -> segments[3]
 */
function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/organizations/[slug]/schools
 * List schools for this organization.
 *
 * If the org is public, no auth required. Otherwise require membership.
 */
export async function GET(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) {
      return jsonError("Organization slug is required", 400);
    }

    const url = new URL(req.url);
    const { limit, offset } = parsePagination(url);

    // Look up the org
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    // If org is private, require auth + membership
    if (!org.isPublic) {
      await requireOrgMember(req, slug);
    }

    const rows = await db
      .select()
      .from(schools)
      .where(
        and(
          eq(schools.organizationId, org.id),
          eq(schools.isActive, true),
        ),
      )
      .orderBy(asc(schools.name))
      .limit(limit)
      .offset(offset);

    return jsonOk(rows.map(schoolToSnakeCase));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * POST /api/organizations/[slug]/schools
 * Create a school within this organization. Requires org admin role.
 * Body: { name, slug?, logoUrl?, address?, phone?, principalName?,
 *         principalEmail?, studentCount?, isPublic? }
 */
export async function POST(req: Request) {
  try {
    const orgSlug = getSlugFromUrl(req);
    if (!orgSlug) {
      return jsonError("Organization slug is required", 400);
    }

    const { organization } = await requireOrgMember(req, orgSlug, "admin");
    const body = await req.json();

    const { name } = body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return jsonError("name is required", 400);
    }

    const schoolSlug = body.slug
      ? String(body.slug).trim()
      : slugify(name);

    // Check slug uniqueness within this org
    const [existing] = await db
      .select({ id: schools.id })
      .from(schools)
      .where(
        and(
          eq(schools.organizationId, organization.id),
          eq(schools.slug, schoolSlug),
        ),
      )
      .limit(1);

    if (existing) {
      return jsonError(
        `A school with slug "${schoolSlug}" already exists in this organization`,
        409,
      );
    }

    const [created] = await db
      .insert(schools)
      .values({
        organizationId: organization.id,
        name: name.trim(),
        slug: schoolSlug,
        logoUrl: body.logoUrl ?? undefined,
        address: body.address ?? undefined,
        phone: body.phone ?? undefined,
        principalName: body.principalName ?? undefined,
        principalEmail: body.principalEmail ?? undefined,
        studentCount: body.studentCount ?? undefined,
        isPublic: body.isPublic ?? false,
      })
      .returning();

    return jsonOk(schoolToSnakeCase(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
