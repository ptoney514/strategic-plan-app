import { eq, and, inArray, count, sql } from "drizzle-orm";
import { requireAuth } from "@api/lib/middleware/auth";
import { db } from "@api/lib/db";
import {
  organizations,
  organizationMembers,
  plans,
  goals,
} from "@api/lib/schema/index";
import { jsonOk, jsonError } from "@api/lib/response";

function orgWithStats(
  o: typeof organizations.$inferSelect,
  stats: { plan_count: number; objective_count: number; user_count: number },
) {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    entity_type: o.entityType,
    entity_label: o.entityLabel,
    logo_url: o.logoUrl,
    primary_color: o.primaryColor,
    secondary_color: o.secondaryColor,
    tagline: o.tagline,
    is_public: o.isPublic,
    is_active: o.isActive,
    admin_email: o.adminEmail,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
    plan_count: stats.plan_count,
    objective_count: stats.objective_count,
    user_count: stats.user_count,
  };
}

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request);

    let orgs: (typeof organizations.$inferSelect)[];

    if (user.isSystemAdmin) {
      orgs = await db
        .select()
        .from(organizations)
        .where(eq(organizations.isActive, true))
        .orderBy(organizations.name);
    } else {
      const rows = await db
        .select({ org: organizations })
        .from(organizationMembers)
        .innerJoin(
          organizations,
          eq(organizationMembers.organizationId, organizations.id),
        )
        .where(
          and(
            eq(organizationMembers.userId, user.id),
            eq(organizations.isActive, true),
          ),
        )
        .orderBy(organizations.name);

      orgs = rows.map((r) => r.org);
    }

    if (orgs.length === 0) {
      return jsonOk([]);
    }

    const orgIds = orgs.map((o) => o.id);

    // Fetch per-district stats in parallel
    const [planStats, objectiveStats, userStats] = await Promise.all([
      db
        .select({
          organizationId: plans.organizationId,
          count: count(),
        })
        .from(plans)
        .where(inArray(plans.organizationId, orgIds))
        .groupBy(plans.organizationId),
      db
        .select({
          organizationId: plans.organizationId,
          count: count(),
        })
        .from(goals)
        .innerJoin(plans, eq(goals.planId, plans.id))
        .where(
          and(eq(goals.level, 0), inArray(plans.organizationId, orgIds)),
        )
        .groupBy(plans.organizationId),
      db
        .select({
          organizationId: organizationMembers.organizationId,
          count: sql<number>`count(distinct ${organizationMembers.userId})`.mapWith(Number),
        })
        .from(organizationMembers)
        .where(inArray(organizationMembers.organizationId, orgIds))
        .groupBy(organizationMembers.organizationId),
    ]);

    // Build lookup maps
    const planMap = new Map(planStats.map((r) => [r.organizationId, r.count]));
    const objMap = new Map(
      objectiveStats.map((r) => [r.organizationId, r.count]),
    );
    const userMap = new Map(userStats.map((r) => [r.organizationId, r.count]));

    const result = orgs.map((o) =>
      orgWithStats(o, {
        plan_count: planMap.get(o.id) ?? 0,
        objective_count: objMap.get(o.id) ?? 0,
        user_count: userMap.get(o.id) ?? 0,
      }),
    );

    return jsonOk(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
