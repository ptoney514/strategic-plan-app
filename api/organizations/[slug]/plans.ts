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
