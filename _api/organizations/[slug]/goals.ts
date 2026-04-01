import { eq, and, asc } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { organizations, plans, goals } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError, parsePagination } from "../../lib/response.js";

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

/** Extract the org slug from the URL path: /api/organizations/[slug]/goals */
function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/organizations/[slug]/goals
 * Get all goals for the organization (flat list for dashboard view).
 * Joins through plans to get goals belonging to the org.
 * Query params:
 *   ?level=0       -> filter by goal level (0, 1, 2)
 *   ?planId=uuid   -> filter by specific plan
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
