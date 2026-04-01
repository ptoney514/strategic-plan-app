import { eq } from "drizzle-orm";
import { db } from "@api/lib/db";
import { widgets, organizations } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

const VALID_TYPES = [
  "donut",
  "big-number",
  "bar-chart",
  "area-line",
  "progress-bar",
  "pie-breakdown",
];

function toResponse(w: typeof widgets.$inferSelect) {
  return {
    id: w.id,
    organizationId: w.organizationId,
    planId: w.planId,
    goalId: w.goalId,
    type: w.type,
    title: w.title,
    subtitle: w.subtitle,
    config: w.config,
    position: w.position,
    isActive: w.isActive,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  };
}

/**
 * GET /api/v2/widgets/[id]
 * Get a single widget by ID (requires org membership).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    // Auth: look up org and verify membership
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, widget.organizationId))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    await requireOrgMember(req, org.slug);

    return jsonOk(toResponse(widget));
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
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    const goalId = body.goal_id ?? body.goalId;
    if (goalId !== undefined) updates.goalId = goalId;

    const isActive = body.is_active ?? body.isActive;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(widgets)
      .set(updates)
      .where(eq(widgets.id, id))
      .returning();

    return jsonOk(toResponse(updated));
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
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
