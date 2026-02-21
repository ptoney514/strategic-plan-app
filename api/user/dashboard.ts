import { eq, and, inArray, count } from "drizzle-orm";
import { requireAuth } from "../lib/middleware/auth.js";
import { db } from "../lib/db.js";
import {
  organizations,
  organizationMembers,
  plans,
  goals,
  metrics,
} from "../lib/schema/index.js";
import { jsonOk, jsonError } from "../lib/response.js";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request);

    if (user.isSystemAdmin) {
      // System admin: aggregate counts in parallel
      const [[orgCount], [planCount], [goalCount], [metricCount]] = await Promise.all([
        db
          .select({ value: count() })
          .from(organizations)
          .where(eq(organizations.isActive, true)),
        db
          .select({ value: count() })
          .from(plans),
        db
          .select({ value: count() })
          .from(goals)
          .where(eq(goals.level, 0)),
        db
          .select({ value: count() })
          .from(metrics),
      ]);

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

    const orgIds = [...new Set(memberships.map((m) => m.organizationId))];

    if (orgIds.length === 0) {
      return jsonOk({
        district_count: 0,
        plan_count: 0,
        objective_count: 0,
        metric_count: 0,
      });
    }

    const [[planCount], [goalCount], [metricCount]] = await Promise.all([
      db
        .select({ value: count() })
        .from(plans)
        .where(inArray(plans.organizationId, orgIds)),
      db
        .select({ value: count() })
        .from(goals)
        .innerJoin(plans, eq(goals.planId, plans.id))
        .where(and(eq(goals.level, 0), inArray(plans.organizationId, orgIds))),
      db
        .select({ value: count() })
        .from(metrics)
        .innerJoin(goals, eq(metrics.goalId, goals.id))
        .innerJoin(plans, eq(goals.planId, plans.id))
        .where(inArray(plans.organizationId, orgIds)),
    ]);

    return jsonOk({
      district_count: orgIds.length,
      plan_count: planCount.value,
      objective_count: goalCount.value,
      metric_count: metricCount.value,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
