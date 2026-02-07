import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { goals, statusOverrides } from "../../lib/schema/index";
import { requireAuth, requireOrgMember } from "../../lib/middleware/auth";
import { getOrgSlugForGoal } from "../../lib/helpers/org-lookup";
import { jsonOk, jsonError } from "../../lib/response";

function goalToSnake(g: Record<string, unknown>) {
  return {
    id: g.id,
    plan_id: g.planId,
    organization_id: g.organizationId,
    school_id: g.schoolId,
    parent_id: g.parentId,
    goal_number: g.goalNumber,
    title: g.title,
    description: g.description,
    level: g.level,
    order_position: g.orderPosition,
    status: g.status,
    calculated_status: g.calculatedStatus,
    status_source: g.statusSource,
    status_override_reason: g.statusOverrideReason,
    status_override_by: g.statusOverrideBy,
    status_override_at: g.statusOverrideAt,
    status_override_expires: g.statusOverrideExpires,
    status_calculation_confidence: g.statusCalculationConfidence,
    status_last_calculated: g.statusLastCalculated,
    overall_progress: g.overallProgress,
    overall_progress_override: g.overallProgressOverride,
    overall_progress_custom_value: g.overallProgressCustomValue,
    overall_progress_display_mode: g.overallProgressDisplayMode,
    overall_progress_source: g.overallProgressSource,
    overall_progress_last_calculated: g.overallProgressLastCalculated,
    overall_progress_override_by: g.overallProgressOverrideBy,
    overall_progress_override_at: g.overallProgressOverrideAt,
    overall_progress_override_reason: g.overallProgressOverrideReason,
    image_url: g.imageUrl,
    header_color: g.headerColor,
    cover_photo_url: g.coverPhotoUrl,
    cover_photo_alt: g.coverPhotoAlt,
    color: g.color,
    show_progress_bar: g.showProgressBar,
    owner_name: g.ownerName,
    department: g.department,
    start_date: g.startDate,
    end_date: g.endDate,
    priority: g.priority,
    executive_summary: g.executiveSummary,
    indicator_text: g.indicatorText,
    indicator_color: g.indicatorColor,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

function extractGoalId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  // /api/progress/[goalId]/override -> segments[3]
  return segments[3];
}

/**
 * PUT /api/progress/:goalId/override
 * Set progress override on a goal. Requires auth.
 */
export async function PUT(req: Request) {
  try {
    const goalId = extractGoalId(req);

    const [existing] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, goalId))
      .limit(1);

    if (!existing) {
      return jsonError("Goal not found", 404);
    }

    // Verify org membership
    const lookup = await getOrgSlugForGoal(goalId);
    if (!lookup) return jsonError("Goal not found", 404);
    const { user } = await requireOrgMember(req, lookup.orgSlug, "editor");

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    if (body.overall_progress_override !== undefined) {
      updateData.overallProgressOverride = body.overall_progress_override;
    }
    if (body.overall_progress_source !== undefined) {
      updateData.overallProgressSource = body.overall_progress_source;
    }
    if (body.overall_progress_override_reason !== undefined) {
      updateData.overallProgressOverrideReason =
        body.overall_progress_override_reason;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
      updateData.statusSource = "manual";
    }
    if (body.status_override_reason !== undefined) {
      updateData.statusOverrideReason = body.status_override_reason;
    }

    // Set override metadata
    if (
      body.overall_progress_override !== undefined ||
      body.status !== undefined
    ) {
      updateData.overallProgressOverrideBy = user.id;
      updateData.overallProgressOverrideAt = new Date();
      if (body.overall_progress_override !== undefined) {
        updateData.overallProgressSource = "manual";
      }
    }

    if (Object.keys(updateData).length === 0) {
      return jsonError("No valid fields to update", 400);
    }

    const [updated] = await db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, goalId))
      .returning();

    // Insert audit trail into statusOverrides
    await db.insert(statusOverrides).values({
      goalId,
      previousStatus: existing.status,
      newStatus: body.status ?? existing.status ?? "not_started",
      calculatedStatus: existing.calculatedStatus,
      overrideReason:
        body.overall_progress_override_reason ??
        body.status_override_reason ??
        "Manual override",
      createdBy: user.id,
      createdByName: user.name,
    });

    return jsonOk(goalToSnake(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/progress/:goalId/override
 * Clear progress override. Requires auth.
 */
export async function DELETE(req: Request) {
  try {
    const goalId = extractGoalId(req);

    const [existing] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, goalId))
      .limit(1);

    if (!existing) {
      return jsonError("Goal not found", 404);
    }

    // Verify org membership
    const lookup = await getOrgSlugForGoal(goalId);
    if (!lookup) return jsonError("Goal not found", 404);
    await requireOrgMember(req, lookup.orgSlug, "editor");

    const [updated] = await db
      .update(goals)
      .set({
        overallProgressOverride: null,
        overallProgressSource: "calculated",
        overallProgressOverrideBy: null,
        overallProgressOverrideAt: null,
        overallProgressOverrideReason: null,
        statusSource: "calculated",
        statusOverrideReason: null,
        statusOverrideBy: null,
        statusOverrideAt: null,
      })
      .where(eq(goals.id, goalId))
      .returning();

    return jsonOk(goalToSnake(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
