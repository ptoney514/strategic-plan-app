import { eq, and, count, inArray } from "drizzle-orm";
import { db } from "../../../lib/db.js";
import {
  plans,
  goals,
  organizations,
  organizationMembers,
} from "../../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../../lib/response.js";
import { auth } from "../../../lib/auth.js";

function toSnake(row: typeof plans.$inferSelect) {
  return {
    id: row.id,
    organization_id: row.organizationId,
    district_id: row.organizationId,
    name: row.name,
    slug: row.slug,
    type_label: row.typeLabel,
    description: row.description,
    cover_image_url: row.coverImageUrl,
    is_public: row.isPublic,
    is_active: row.isActive,
    start_date: row.startDate,
    end_date: row.endDate,
    order_position: row.orderPosition,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/**
 * GET /api/plans/active/[slug] - Get active plans by organization slug
 *
 * Public (unauthenticated): returns plans where is_active=true AND is_public=true
 * Authenticated org member: returns all plans where is_active=true
 * Includes objective_count (level-0 goals) for each plan.
 */
export async function GET(req: Request) {
  try {
    const slug = new URL(req.url).pathname.split("/")[4];
    if (!slug) return jsonError("Organization slug is required", 400);

    // Look up the organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    // Check if the requester is authenticated and a member
    let isMember = false;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session) {
        const { user } = session as typeof session & {
          user: { id: string; isSystemAdmin: boolean };
        };

        if (user.isSystemAdmin) {
          isMember = true;
        } else {
          const [membership] = await db
            .select({ id: organizationMembers.id })
            .from(organizationMembers)
            .where(
              and(
                eq(organizationMembers.organizationId, org.id),
                eq(organizationMembers.userId, user.id),
              ),
            )
            .limit(1);

          isMember = !!membership;
        }
      }
    } catch {
      // Not authenticated -- treat as public
    }

    // Build conditions
    const conditions = [
      eq(plans.isActive, true),
      eq(plans.organizationId, org.id),
    ];

    // Non-members only see public plans
    if (!isMember) {
      conditions.push(eq(plans.isPublic, true));
    }

    // Fetch active plans
    const activePlans = await db
      .select()
      .from(plans)
      .where(and(...conditions))
      .orderBy(plans.orderPosition);

    // Get objective counts (level-0 goals) for each plan
    const planIds = activePlans.map((p) => p.id);

    const objectiveCounts = new Map<string, number>();
    if (planIds.length > 0) {
      const counts = await db
        .select({
          planId: goals.planId,
          value: count(),
        })
        .from(goals)
        .where(and(eq(goals.level, 0), inArray(goals.planId, planIds)))
        .groupBy(goals.planId);

      for (const c of counts) {
        objectiveCounts.set(c.planId, c.value);
      }
    }

    const result = activePlans.map((plan) => ({
      ...toSnake(plan),
      objective_count: objectiveCounts.get(plan.id) ?? 0,
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
