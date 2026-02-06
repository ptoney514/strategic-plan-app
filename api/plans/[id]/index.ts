import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { plans, organizations } from "../../lib/schema/index";
import { requireAuth, requireOrgMember } from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

function toSnake(row: typeof plans.$inferSelect) {
  return {
    id: row.id,
    organization_id: row.organizationId,
    school_id: row.schoolId,
    name: row.name,
    slug: row.slug,
    type_label: row.typeLabel,
    description: row.description,
    cover_image_url: row.coverImageUrl,
    is_public: row.isPublic,
    is_active: row.isActive,
    start_date: row.startDate,
    end_date: row.endDate,
    order_position: row.orderPosition,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/**
 * GET /api/plans/[id] - Get a plan by ID
 */
export async function GET(req: Request) {
  try {
    await requireAuth(req);

    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Plan ID is required", 400);

    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (!plan) return jsonError("Plan not found", 404);

    return jsonOk(toSnake(plan));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * PUT /api/plans/[id] - Update a plan
 * Requires auth + org membership (editor role minimum)
 */
export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Plan ID is required", 400);

    // Look up the plan to find its organization
    const [existing] = await db
      .select({
        id: plans.id,
        organizationId: plans.organizationId,
      })
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (!existing) return jsonError("Plan not found", 404);

    // Look up the org slug for permission check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, existing.organizationId))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "editor");

    const body = await req.json();

    const updateData: Partial<typeof plans.$inferInsert> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.type_label !== undefined) updateData.typeLabel = body.type_label;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.cover_image_url !== undefined)
      updateData.coverImageUrl = body.cover_image_url;
    if (body.is_public !== undefined) updateData.isPublic = body.is_public;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;
    if (body.start_date !== undefined) updateData.startDate = body.start_date;
    if (body.end_date !== undefined) updateData.endDate = body.end_date;
    if (body.order_position !== undefined)
      updateData.orderPosition = body.order_position;

    const [updated] = await db
      .update(plans)
      .set(updateData)
      .where(eq(plans.id, id))
      .returning();

    return jsonOk(toSnake(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/plans/[id] - Delete a plan
 * Requires auth + org membership (admin role)
 */
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Plan ID is required", 400);

    // Look up the plan to find its organization
    const [existing] = await db
      .select({
        id: plans.id,
        organizationId: plans.organizationId,
      })
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (!existing) return jsonError("Plan not found", 404);

    // Look up the org slug for permission check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, existing.organizationId))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "admin");

    await db.delete(plans).where(eq(plans.id, id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
