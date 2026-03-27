import { eq, and, asc } from "drizzle-orm";
import { db } from "@api/lib/db";
import { organizations, plans, goals } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError, parsePagination } from "@api/lib/response";

/** Map a Drizzle goal row to snake_case for the frontend */
function goalToSnakeCase(goal: typeof goals.$inferSelect) {
  return {
    id: goal.id,
    plan_id: goal.planId,
    organization_id: goal.organizationId,
    district_id: goal.organizationId,
    parent_id: goal.parentId,
    goal_number: goal.goalNumber,
    title: goal.title,
    description: goal.description,
    level: goal.level,
    order_position: goal.orderPosition,
    status: goal.status,
    overall_progress: goal.overallProgress,
    overall_progress_display_mode: goal.overallProgressDisplayMode,
    owner_name: goal.ownerName,
    priority: goal.priority,
    created_at: goal.createdAt?.toISOString() ?? null,
    updated_at: goal.updatedAt?.toISOString() ?? null,
  };
}

/**
 * GET /api/organizations/[slug]/goals
 * Get all goals for the organization (flat list for dashboard view).
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
    const filterLevel = url.searchParams.get("level");
    const filterPlanId = url.searchParams.get("planId");
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

    // Build conditions: goals must belong to plans owned by this org
    const conditions = [eq(plans.organizationId, org.id)];

    if (filterLevel !== null && filterLevel !== undefined) {
      const level = parseInt(filterLevel, 10);
      if (!isNaN(level)) {
        conditions.push(eq(goals.level, level));
      }
    }

    if (filterPlanId) {
      conditions.push(eq(goals.planId, filterPlanId));
    }

    const rows = await db
      .select()
      .from(goals)
      .innerJoin(plans, eq(goals.planId, plans.id))
      .where(and(...conditions))
      .orderBy(asc(goals.level), asc(goals.orderPosition), asc(goals.createdAt))
      .limit(limit)
      .offset(offset);

    return jsonOk(rows.map((r) => goalToSnakeCase(r.goals)));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
