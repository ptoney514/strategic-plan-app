import { eq, and, inArray, count } from "drizzle-orm";
import { requireAuth } from "@api/lib/middleware/auth";
import { db } from "@api/lib/db";
import {
  organizations,
  organizationMembers,
  plans,
  goals,
} from "@api/lib/schema/index";
import { jsonOk, jsonError } from "@api/lib/response";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request);

    if (user.isSystemAdmin) {
      // System admin: aggregate counts in parallel
      const [[orgCount], [planCount], [goalCount]] = await Promise.all([
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
      ]);

      return jsonOk({
        district_count: orgCount.value,
        plan_count: planCount.value,
        objective_count: goalCount.value,
      });
    }

    // Regular user: scope to their active org memberships
    const memberships = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(and(eq(organizationMembers.userId, user.id), eq(organizations.isActive, true)));

    const orgIds = [...new Set(memberships.map((m) => m.organizationId))];

    if (orgIds.length === 0) {
      return jsonOk({
        district_count: 0,
        plan_count: 0,
        objective_count: 0,
      });
    }

    const [[planCount], [goalCount]] = await Promise.all([
      db
        .select({ value: count() })
        .from(plans)
        .where(inArray(plans.organizationId, orgIds)),
      db
        .select({ value: count() })
        .from(goals)
        .innerJoin(plans, eq(goals.planId, plans.id))
        .where(and(eq(goals.level, 0), inArray(plans.organizationId, orgIds))),
    ]);

    return jsonOk({
      district_count: orgIds.length,
      plan_count: planCount.value,
      objective_count: goalCount.value,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
