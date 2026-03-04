import { inArray, and, eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { widgets, organizations } from "../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../lib/response.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";

/**
 * GET /api/v2/widgets/by-goals?orgSlug=xxx&ids=id1,id2,id3
 * Batch fetch active widgets for multiple goals, scoped to an organization.
 * Public orgs: no auth required. Private orgs: requires authenticated org member.
 * Avoids N+1 queries on drill-down pages.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgSlug = url.searchParams.get("orgSlug");
    const idsParam = url.searchParams.get("ids");

    if (!orgSlug) {
      return jsonError("orgSlug is required", 400);
    }

    if (!idsParam) {
      return jsonError("ids parameter is required", 400);
    }

    // Look up the org
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    // Private orgs require authenticated org membership
    if (!org.isPublic) {
      await requireOrgMember(req, orgSlug);
    }

    const goalIds = idsParam.split(",").filter(Boolean);

    if (goalIds.length === 0) {
      return jsonOk([]);
    }

    if (goalIds.length > 100) {
      return jsonError("Maximum 100 goal IDs allowed", 400);
    }

    const rows = await db
      .select()
      .from(widgets)
      .where(
        and(
          eq(widgets.organizationId, org.id),
          inArray(widgets.goalId, goalIds),
          eq(widgets.isActive, true),
        ),
      )
      .orderBy(widgets.position);

    const mapped = rows.map((w) => ({
      id: w.id,
      organizationId: w.organizationId,
      planId: w.planId,
      goalId: w.goalId,
      type: w.type,
      title: w.title,
      subtitle: w.subtitle,
      config: w.config,
      position: w.position,
      isActive: w.isActive,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    return jsonOk(mapped);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[widgets by-goals GET] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
