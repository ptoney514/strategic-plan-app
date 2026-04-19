import { eq, inArray, desc, and, count } from "drizzle-orm";
import { requireAuth } from "@api/lib/middleware/auth";
import { db } from "@api/lib/db";
import {
  organizations,
  organizationMembers,
  plans,
  goals,
} from "@api/lib/schema/index";
import { jsonOk, jsonError } from "@api/lib/response";

function planToSnake(p: typeof plans.$inferSelect) {
  return {
    id: p.id,
    organization_id: p.organizationId,
    district_id: p.organizationId,
    name: p.name,
    slug: p.slug,
    type_label: p.typeLabel,
    description: p.description,
    cover_image_url: p.coverImageUrl,
    is_public: p.isPublic,
    is_active: p.isActive,
    start_date: p.startDate,
    end_date: p.endDate,
    order_position: p.orderPosition,
    public_template: p.publicTemplate,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request);

    let orgIds: string[];

    if (user.isSystemAdmin) {
      // System admin: all active orgs
      const orgs = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.isActive, true));

      orgIds = orgs.map((o) => o.id);
    } else {
      // Regular user: orgs via membership (only active orgs)
      const memberships = await db
        .select({ organizationId: organizationMembers.organizationId })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(and(eq(organizationMembers.userId, user.id), eq(organizations.isActive, true)));

      orgIds = memberships.map((m) => m.organizationId);
    }

    if (orgIds.length === 0) {
      return jsonOk([]);
    }

    // Get all plans for user's orgs
    const rows = await db
      .select()
      .from(plans)
      .where(inArray(plans.organizationId, orgIds))
      .orderBy(desc(plans.updatedAt));

    if (rows.length === 0) {
      return jsonOk([]);
    }

    // Get objective counts (level-0 goals) per plan
    const planIds = rows.map((p) => p.id);

    const objectiveCounts = await db
      .select({
        planId: goals.planId,
        objectiveCount: count(),
      })
      .from(goals)
      .where(and(inArray(goals.planId, planIds), eq(goals.level, 0)))
      .groupBy(goals.planId);

    // Build a lookup map
    const countMap = new Map<string, number>();
    for (const row of objectiveCounts) {
      countMap.set(row.planId, row.objectiveCount);
    }

    // Combine plan data with objective counts
    const result = rows.map((p) => ({
      ...planToSnake(p),
      objectiveCount: countMap.get(p.id) ?? 0,
    }));

    return jsonOk(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
