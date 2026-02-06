import { eq, sql } from "drizzle-orm";
import { db } from "../lib/db";
import {
  organizations,
  plans,
  goals,
  metrics,
  organizationMembers,
} from "../lib/schema/index";
import { requireSystemAdmin } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/**
 * GET /api/admin/districts
 * Get all districts with stats. Requires system admin.
 */
export async function GET(req: Request) {
  try {
    await requireSystemAdmin(req);

    const orgs = await db.select().from(organizations).orderBy(organizations.name);

    const result = await Promise.all(
      orgs.map(async (org) => {
        const [planCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(plans)
          .where(eq(plans.organizationId, org.id));

        const [goalCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(goals)
          .where(eq(goals.organizationId, org.id));

        const [metricCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(metrics)
          .innerJoin(goals, eq(metrics.goalId, goals.id))
          .where(eq(goals.organizationId, org.id));

        const [adminCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(organizationMembers)
          .where(eq(organizationMembers.organizationId, org.id));

        return {
          id: org.id,
          district_id: org.id,
          name: org.name,
          slug: org.slug,
          entity_type: org.entityType,
          entity_label: org.entityLabel,
          logo_url: org.logoUrl,
          primary_color: org.primaryColor,
          secondary_color: org.secondaryColor,
          is_public: org.isPublic,
          is_active: org.isActive,
          admin_email: org.adminEmail,
          tagline: org.tagline,
          created_at: org.createdAt,
          updated_at: org.updatedAt,
          plan_count: planCount.count,
          goal_count: goalCount.count,
          metric_count: metricCount.count,
          admin_count: adminCount.count,
        };
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
