import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db";
import {
  goals,
  metrics,
  plans,
  organizations,
  organizationMembers,
} from "../../lib/schema/index";
import { requireAuth } from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

function extractOrgId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  // /api/progress/recalculate/[orgId] -> segments[4]
  return segments[4];
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
  let validCount = 0;

  for (const m of validMetrics) {
    const current = parseFloat(String(m.currentValue));
    const target = parseFloat(String(m.targetValue));

    if (isNaN(current) || isNaN(target) || target === 0) continue;

    const ratio = Math.min((current / target) * 100, 100);
    totalProgress += ratio;
    validCount++;
  }

  return validCount > 0
    ? Math.round((totalProgress / validCount) * 100) / 100
    : null;
}

/**
 * POST /api/progress/recalculate/:orgId
 * Recalculate progress for all goals in an org. Requires auth + org membership.
 */
export async function POST(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const orgId = extractOrgId(req);

    // Verify org exists
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    // Verify membership (unless system admin)
    if (!user.isSystemAdmin) {
      const [membership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, orgId),
            eq(organizationMembers.userId, user.id),
          ),
        )
        .limit(1);

      if (!membership) {
        return jsonError("Forbidden", 403);
      }
    }

    // Get all plans for this org
    const orgPlans = await db
      .select()
      .from(plans)
      .where(eq(plans.organizationId, orgId));

    if (orgPlans.length === 0) {
      return jsonOk({ updated: 0 });
    }

    const planIds = orgPlans.map((p) => p.id);

    // Get all goals across these plans
    const allGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.organizationId, orgId));

    // Get all metrics for these goals
    const goalIds = allGoals.map((g) => g.id);

    let updated = 0;

    for (const goal of allGoals) {
      // Skip goals with manual overrides
      if (goal.overallProgressSource === "manual") continue;

      const goalMetrics = await db
        .select()
        .from(metrics)
        .where(eq(metrics.goalId, goal.id));

      const progress = calculateProgress(goalMetrics);

      if (progress !== null) {
        await db
          .update(goals)
          .set({
            overallProgress: String(progress),
            statusLastCalculated: new Date(),
          })
          .where(eq(goals.id, goal.id));

        updated++;
      }
    }

    return jsonOk({ updated });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
