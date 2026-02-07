import { eq, inArray, desc } from "drizzle-orm";
import { requireAuth } from "../lib/middleware/auth";
import { db } from "../lib/db";
import {
  organizations,
  organizationMembers,
  plans,
} from "../lib/schema/index";
import { jsonOk, jsonError } from "../lib/response";

function planToSnake(p: typeof plans.$inferSelect) {
  return {
    id: p.id,
    organization_id: p.organizationId,
    district_id: p.organizationId,
    school_id: p.schoolId,
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
      // Regular user: orgs via membership
      const memberships = await db
        .select({ organizationId: organizationMembers.organizationId })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, user.id));

      orgIds = memberships.map((m) => m.organizationId);
    }

    if (orgIds.length === 0) {
      return jsonOk([]);
    }

    const rows = await db
      .select()
      .from(plans)
      .where(inArray(plans.organizationId, orgIds))
      .orderBy(desc(plans.updatedAt));

    return jsonOk(rows.map(planToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
