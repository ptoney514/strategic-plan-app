import { eq, and, asc } from "drizzle-orm";
import { db } from "../../lib/db";
import { organizations, plans } from "../../lib/schema/index";
import { requireAuth, requireOrgMember } from "../../lib/middleware/auth";
import { jsonOk, jsonError, parsePagination } from "../../lib/response";

export const config = { runtime: "edge" };

/** Map a Drizzle plan row to snake_case for the frontend */
function planToSnakeCase(plan: typeof plans.$inferSelect) {
  return {
    id: plan.id,
    organization_id: plan.organizationId,
    district_id: plan.organizationId,
    school_id: plan.schoolId,
    name: plan.name,
    slug: plan.slug,
    type_label: plan.typeLabel,
    description: plan.description,
    cover_image_url: plan.coverImageUrl,
    is_public: plan.isPublic,
    is_active: plan.isActive,
    start_date: plan.startDate,
    end_date: plan.endDate,
    order_position: plan.orderPosition,
    created_at: plan.createdAt?.toISOString() ?? null,
    updated_at: plan.updatedAt?.toISOString() ?? null,
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

/** Extract the org slug from the URL path: /api/organizations/[slug]/plans */
function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/organizations/[slug]/plans
 * Get plans for this organization.
 * Query params:
 *   ?active=true   -> filter by is_active = true
 *   ?public=true   -> filter by is_public = true
 * Order by order_position, then created_at.
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
    const filterActive = url.searchParams.get("active");
    const filterPublic = url.searchParams.get("public");
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

    // Build conditions
    const conditions = [eq(plans.organizationId, org.id)];

    if (filterActive === "true") {
      conditions.push(eq(plans.isActive, true));
    } else if (filterActive === "false") {
      conditions.push(eq(plans.isActive, false));
    }

    if (filterPublic === "true") {
      conditions.push(eq(plans.isPublic, true));
    } else if (filterPublic === "false") {
      conditions.push(eq(plans.isPublic, false));
    }

    const rows = await db
      .select()
      .from(plans)
      .where(and(...conditions))
      .orderBy(asc(plans.orderPosition), asc(plans.createdAt))
      .limit(limit)
      .offset(offset);

    return jsonOk(rows.map(planToSnakeCase));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * POST /api/organizations/[slug]/plans
 * Create a new plan under this organization.
 * Body (snake_case): { name, slug?, type_label?, description?, cover_image_url?,
 *   is_public?, is_active?, start_date?, end_date?, order_position?, school_id? }
 * Requires auth + org membership (editor role minimum).
 */
export async function POST(req: Request) {
  try {
    const orgSlug = getSlugFromUrl(req);
    if (!orgSlug) {
      return jsonError("Organization slug is required", 400);
    }

    const { organization } = await requireOrgMember(req, orgSlug, "editor");

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return jsonError("name is required", 400);
    }

    const planSlug = body.slug
      ? String(body.slug).trim()
      : slugify(name);

    // Check slug uniqueness within this org
    const [existing] = await db
      .select({ id: plans.id })
      .from(plans)
      .where(
        and(
          eq(plans.organizationId, organization.id),
          eq(plans.slug, planSlug),
        ),
      )
      .limit(1);

    if (existing) {
      return jsonError(
        `A plan with slug "${planSlug}" already exists in this organization`,
        409,
      );
    }

    const [created] = await db
      .insert(plans)
      .values({
        organizationId: organization.id,
        name: name.trim(),
        slug: planSlug,
        typeLabel: body.type_label ?? undefined,
        description: body.description ?? undefined,
        coverImageUrl: body.cover_image_url ?? undefined,
        isPublic: body.is_public ?? false,
        isActive: body.is_active ?? true,
        startDate: body.start_date ?? undefined,
        endDate: body.end_date ?? undefined,
        orderPosition: body.order_position ?? 0,
        schoolId: body.school_id ?? undefined,
      })
      .returning();

    return jsonOk(planToSnakeCase(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
