import { eq, and } from "drizzle-orm";
import { db } from "@api/lib/db";
import {
  goals,
  plans,
  organizations,
  organizationMembers,
} from "@api/lib/schema/index";
import { requireAuth, hasMinimumRole } from "@api/lib/middleware/auth";
import { getOrgSlugForGoal, isPublicOrg } from "@api/lib/helpers/org-lookup";
import { jsonOk, jsonError } from "@api/lib/response";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function goalToSnake(g: Record<string, unknown>) {
  return {
    id: g.id,
    plan_id: g.planId,
    organization_id: g.organizationId,
    district_id: g.organizationId,
    parent_id: g.parentId,
    goal_number: g.goalNumber,
    title: g.title,
    description: g.description,
    level: g.level,
    order_position: g.orderPosition,
    status: g.status,
    overall_progress: g.overallProgress,
    overall_progress_display_mode: g.overallProgressDisplayMode,
    owner_name: g.ownerName,
    priority: g.priority,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

/**
 * Look up the organization that owns a goal (goal -> plan -> organization).
 * Returns the organization row or throws 404.
 */
async function getGoalOrg(goalRow: { planId: string }) {
  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.id, goalRow.planId))
    .limit(1);

  if (!plan) {
    throw new Response(
      JSON.stringify({ error: "Plan not found for goal" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, plan.organizationId))
    .limit(1);

  if (!org) {
    throw new Response(
      JSON.stringify({ error: "Organization not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  return org;
}

/**
 * Verify that user has at least `minimumRole` in the organization.
 * System admins bypass the check.
 */
async function requireGoalOrgMember(
  req: Request,
  goalRow: { planId: string },
  minimumRole: "viewer" | "editor" | "admin" | "owner",
) {
  const { user, session } = await requireAuth(req);
  const org = await getGoalOrg(goalRow);

  if (user.isSystemAdmin) {
    return { user, session, organization: org };
  }

  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, org.id),
        eq(organizationMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!hasMinimumRole(membership.role, minimumRole)) {
    throw new Response(
      JSON.stringify({ error: "Insufficient permissions" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  return { user, session, organization: org };
}

// ---------------------------------------------------------------------------
// GET /api/goals/[id] — Get goal by ID
// ---------------------------------------------------------------------------

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!goal) {
      return jsonError("Goal not found", 404);
    }

    // Access check: allow if org is public, otherwise require auth + membership
    const lookup = await getOrgSlugForGoal(id);
    if (lookup) {
      const orgIsPublic = await isPublicOrg(lookup.orgId);
      if (!orgIsPublic) {
        await requireGoalOrgMember(req, goal, "viewer");
      }
    }

    return jsonOk(goalToSnake(goal));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/goals/[id] — Update goal (requires editor role)
// ---------------------------------------------------------------------------

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Goal not found", 404);
    }

    await requireGoalOrgMember(req, existing, "editor");

    const body = await req.json();

    // Build the update object from snake_case body -> camelCase columns
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      plan_id: "planId",
      organization_id: "organizationId",
      parent_id: "parentId",
      goal_number: "goalNumber",
      title: "title",
      description: "description",
      level: "level",
      order_position: "orderPosition",
      status: "status",
      overall_progress: "overallProgress",
      overall_progress_display_mode: "overallProgressDisplayMode",
      owner_name: "ownerName",
      priority: "priority",
    };

    for (const [snakeKey, camelKey] of Object.entries(fieldMap)) {
      if (snakeKey in body) {
        updateData[camelKey] = body[snakeKey];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return jsonError("No valid fields to update", 400);
    }

    const [updated] = await db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, id))
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

// ---------------------------------------------------------------------------
// DELETE /api/goals/[id] — Delete goal (requires admin role)
// ---------------------------------------------------------------------------

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Goal not found", 404);
    }

    await requireGoalOrgMember(req, existing, "admin");

    await db.delete(goals).where(eq(goals.id, id));

    return jsonOk({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
