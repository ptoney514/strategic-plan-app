import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { goals, metrics } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { getOrgSlugForGoal, isPublicOrg } from "../../lib/helpers/org-lookup.js";
import { jsonOk, jsonError } from "../../lib/response.js";

function goalToSnake(g: Record<string, unknown>) {
  return {
    id: g.id,
    plan_id: g.planId,
    organization_id: g.organizationId,
    parent_id: g.parentId,
    goal_number: g.goalNumber,
    title: g.title,
    description: g.description,
    level: g.level,
    order_position: g.orderPosition,
    status: g.status,
    overall_progress: g.overallProgress,
    overall_progress_override: g.overallProgressOverride,
    overall_progress_display_mode: g.overallProgressDisplayMode,
    overall_progress_source: g.overallProgressSource,
    owner_name: g.ownerName,
    department: g.department,
  };
}

function metricToSnake(m: Record<string, unknown>) {
  return {
    id: m.id,
    goal_id: m.goalId,
    name: m.name,
    metric_name: m.metricName,
    metric_type: m.metricType,
    current_value: m.currentValue,
    target_value: m.targetValue,
    unit: m.unit,
    status: m.status,
    is_percentage: m.isPercentage,
    is_higher_better: m.isHigherBetter,
  };
}

/**
 * Calculate progress for a goal based on its metrics.
 * Simple current/target ratio averaged across all metrics.
 */
function calculateProgress(
  goalMetrics: (typeof metrics.$inferSelect)[],
): number | null {
  const validMetrics = goalMetrics.filter(
    (m) => m.currentValue != null && m.targetValue != null,
  );

  if (validMetrics.length === 0) return null;

  let totalProgress = 0;
  for (const m of validMetrics) {
    const current = parseFloat(String(m.currentValue));
    const target = parseFloat(String(m.targetValue));

    if (isNaN(current) || isNaN(target) || target === 0) continue;

    const ratio = Math.min((current / target) * 100, 100);
    totalProgress += ratio;
  }

  return validMetrics.length > 0
    ? Math.round((totalProgress / validMetrics.length) * 100) / 100
    : null;
}

function extractGoalId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  // /api/progress/[goalId]/breakdown -> segments[3]
  return segments[3];
}

/**
 * GET /api/progress/:goalId/breakdown
 * Get progress breakdown for a goal. Requires auth.
 */
export async function GET(req: Request) {
  try {
    const goalId = extractGoalId(req);

    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, goalId))
      .limit(1);

    if (!goal) {
      return jsonError("Goal not found", 404);
    }

    // Access check: allow if org is public, otherwise require org membership
    const lookup = await getOrgSlugForGoal(goalId);
    if (lookup) {
      const orgIsPublic = await isPublicOrg(lookup.orgId);
      if (!orgIsPublic) {
        await requireOrgMember(req, lookup.orgSlug, "viewer");
      }
    }

    // Get metrics for this goal
    const goalMetrics = await db
      .select()
      .from(metrics)
      .where(eq(metrics.goalId, goalId))
      .orderBy(metrics.orderPosition);

    // Get child goals
    const childGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.parentId, goalId))
      .orderBy(goals.orderPosition);

    // Build children with metrics and progress
    const children = await Promise.all(
      childGoals.map(async (child) => {
        const childMetrics = await db
          .select()
          .from(metrics)
          .where(eq(metrics.goalId, child.id))
          .orderBy(metrics.orderPosition);

        const progress = calculateProgress(childMetrics);

        return {
          goal: goalToSnake(child),
          metrics: childMetrics.map(metricToSnake),
          progress,
        };
      }),
    );

    // Calculate overall progress
    const directProgress = calculateProgress(goalMetrics);
    const childProgresses = children
      .map((c) => c.progress)
      .filter((p): p is number => p !== null);

    let overallProgress: number | null = null;
    if (directProgress !== null || childProgresses.length > 0) {
      const allProgresses = [
        ...(directProgress !== null ? [directProgress] : []),
        ...childProgresses,
      ];
      overallProgress =
        Math.round(
          (allProgresses.reduce((sum, p) => sum + p, 0) /
            allProgresses.length) *
            100,
        ) / 100;
    }

    return jsonOk({
      goal: goalToSnake(goal),
      metrics: goalMetrics.map(metricToSnake),
      children,
      overall_progress: overallProgress,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
