import { eq, and, count } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { schools, plans, goals, metrics } from "../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/** Map a Drizzle school row to snake_case for the frontend */
function schoolToSnake(s: typeof schools.$inferSelect) {
  return {
    id: s.id,
    organization_id: s.organizationId,
    name: s.name,
    slug: s.slug,
    logo_url: s.logoUrl,
    address: s.address,
    phone: s.phone,
    principal_name: s.principalName,
    principal_email: s.principalEmail,
    student_count: s.studentCount,
    is_public: s.isPublic,
    is_active: s.isActive,
    created_at: s.createdAt?.toISOString() ?? null,
    updated_at: s.updatedAt?.toISOString() ?? null,
  };
}

/**
 * GET /api/schools/[id]/summary
 * Get school with goal/metric counts.
 * Counts goals by level (0, 1, 2) through plans with schoolId,
 * and counts metrics for those goals.
 */
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("School ID is required", 400);

    // Fetch the school
    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1);

    if (!school) return jsonError("School not found", 404);

    // Count level-0 goals (objectives) through plans with this schoolId
    const [goalResult] = await db
      .select({ value: count() })
      .from(goals)
      .innerJoin(plans, eq(goals.planId, plans.id))
      .where(and(eq(plans.schoolId, id), eq(goals.level, 0)));

    // Count level-1 goals (strategies)
    const [strategyResult] = await db
      .select({ value: count() })
      .from(goals)
      .innerJoin(plans, eq(goals.planId, plans.id))
      .where(and(eq(plans.schoolId, id), eq(goals.level, 1)));

    // Count level-2 goals (sub-goals)
    const [subGoalResult] = await db
      .select({ value: count() })
      .from(goals)
      .innerJoin(plans, eq(goals.planId, plans.id))
      .where(and(eq(plans.schoolId, id), eq(goals.level, 2)));

    // Count all metrics across all goals in plans for this school
    const [metricResult] = await db
      .select({ value: count() })
      .from(metrics)
      .innerJoin(goals, eq(metrics.goalId, goals.id))
      .innerJoin(plans, eq(goals.planId, plans.id))
      .where(eq(plans.schoolId, id));

    return jsonOk({
      ...schoolToSnake(school),
      goal_count: goalResult.value,
      strategy_count: strategyResult.value,
      sub_goal_count: subGoalResult.value,
      metric_count: metricResult.value,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
