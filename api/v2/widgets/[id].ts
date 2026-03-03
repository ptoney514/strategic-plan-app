import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { widgets, organizations } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

const VALID_TYPES = [
  "donut",
  "big-number",
  "bar-chart",
  "area-line",
  "progress-bar",
  "pie-breakdown",
];

function toSnakeCase(w: typeof widgets.$inferSelect) {
  return {
    id: w.id,
    organization_id: w.organizationId,
    plan_id: w.planId,
    type: w.type,
    title: w.title,
    subtitle: w.subtitle,
    config: w.config,
    position: w.position,
    is_active: w.isActive,
    created_at: w.createdAt,
    updated_at: w.updatedAt,
  };
}

/**
 * GET /api/v2/widgets/[id]
 * Get a single widget by ID.
 */
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/").pop();

    if (!id) {
      return jsonError("Widget ID is required", 400);
    }

    const [widget] = await db
      .select()
      .from(widgets)
      .where(eq(widgets.id, id))
      .limit(1);

    if (!widget) {
      return jsonError("Widget not found", 404);
    }

    return jsonOk(toSnakeCase(widget));
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[widget GET] Error:", error);
    return jsonError("Internal server error", 500);
  }
}

/**
 * PUT /api/v2/widgets/[id]
 * Update a widget (partial update).
 */
export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/").pop();

    if (!id) {
      return jsonError("Widget ID is required", 400);
    }

    const [widget] = await db
      .select()
      .from(widgets)
      .where(eq(widgets.id, id))
      .limit(1);

    if (!widget) {
      return jsonError("Widget not found", 404);
    }

    // Look up org to get slug for auth check
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, widget.organizationId))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    await requireOrgMember(req, org.slug, "editor");

    const body = await req.json();

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.subtitle !== undefined) updates.subtitle = body.subtitle;
    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type)) {
        return jsonError(
          `type must be one of: ${VALID_TYPES.join(", ")}`,
          400,
        );
      }
      updates.type = body.type;
    }
    if (body.config !== undefined) updates.config = body.config;
    if (body.position !== undefined) updates.position = body.position;

    const planId = body.plan_id ?? body.planId;
    if (planId !== undefined) updates.planId = planId;

    const isActive = body.is_active ?? body.isActive;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(widgets)
      .set(updates)
      .where(eq(widgets.id, id))
      .returning();

    return jsonOk(toSnakeCase(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[widget PUT] Error:", error);
    return jsonError("Internal server error", 500);
  }
}

/**
 * DELETE /api/v2/widgets/[id]
 * Delete a widget.
 */
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/").pop();

    if (!id) {
      return jsonError("Widget ID is required", 400);
    }

    const [widget] = await db
      .select()
      .from(widgets)
      .where(eq(widgets.id, id))
      .limit(1);

    if (!widget) {
      return jsonError("Widget not found", 404);
    }

    // Look up org to get slug for auth check
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, widget.organizationId))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    await requireOrgMember(req, org.slug, "editor");

    await db.delete(widgets).where(eq(widgets.id, id));

    return jsonOk({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[widget DELETE] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
