import { eq, and, inArray, count } from "drizzle-orm";
import { requireAuth } from "../lib/middleware/auth";
import { db } from "../lib/db";
import {
  organizations,
  organizationMembers,
  plans,
  goals,
  metrics,
} from "../lib/schema/index";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request);

    if (user.isSystemAdmin) {
      // System admin: count everything
      const [orgCount] = await db
        .select({ value: count() })
        .from(organizations)
        .where(eq(organizations.isActive, true));

      const [planCount] = await db
        .select({ value: count() })
        .from(plans);

      const [goalCount] = await db
        .select({ value: count() })
        .from(goals)
        .where(eq(goals.level, 0));

      const [metricCount] = await db
        .select({ value: count() })
        .from(metrics);

      return jsonOk({
        district_count: orgCount.value,
        plan_count: planCount.value,
        objective_count: goalCount.value,
        metric_count: metricCount.value,
      });
    }

    // Regular user: scope to their org memberships
    const memberships = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id));

    const orgIds = memberships.map((m) => m.organizationId);

    if (orgIds.length === 0) {
      return jsonOk({
        district_count: 0,
        plan_count: 0,
        objective_count: 0,
        metric_count: 0,
      });
    }

    const [planCount] = await db
      .select({ value: count() })
      .from(plans)
      .where(inArray(plans.organizationId, orgIds));

    // Get plan IDs for goal/metric lookups
    const userPlans = await db
      .select({ id: plans.id })
      .from(plans)
      .where(inArray(plans.organizationId, orgIds));

    const planIds = userPlans.map((p) => p.id);

    let goalCountValue = 0;
    let metricCountValue = 0;

    if (planIds.length > 0) {
      const [goalCount] = await db
        .select({ value: count() })
        .from(goals)
        .where(and(eq(goals.level, 0), inArray(goals.planId, planIds)));

      goalCountValue = goalCount.value;

      // Get goal IDs for metric lookup
      const userGoals = await db
        .select({ id: goals.id })
        .from(goals)
        .where(inArray(goals.planId, planIds));

      const goalIds = userGoals.map((g) => g.id);

      if (goalIds.length > 0) {
        const [metricCount] = await db
          .select({ value: count() })
          .from(metrics)
          .where(inArray(metrics.goalId, goalIds));

        metricCountValue = metricCount.value;
      }
    }

    return jsonOk({
      district_count: orgIds.length,
      plan_count: planCount.value,
      objective_count: goalCountValue,
      metric_count: metricCountValue,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
