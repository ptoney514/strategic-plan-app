import { eq, and, asc } from "drizzle-orm";
import { db } from "@api/lib/db";
import { organizations, plans } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError, parsePagination } from "@api/lib/response";

/** Map a Drizzle plan row to snake_case for the frontend */
function planToSnakeCase(plan: typeof plans.$inferSelect) {
  return {
    id: plan.id,
    organization_id: plan.organizationId,
    district_id: plan.organizationId,
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

/**
 * GET /api/organizations/[slug]/plans
 * Get plans for this organization.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
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
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug: orgSlug } = await params;
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
