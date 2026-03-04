import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { widgets, organizations } from "../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/**
 * GET /api/v2/widgets/by-goal?orgSlug=xxx&goalId=xxx
 * List active widgets for a specific goal, scoped to a public organization.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgSlug = url.searchParams.get("orgSlug");
    const goalId = url.searchParams.get("goalId");

    if (!orgSlug) {
      return jsonError("orgSlug is required", 400);
    }
    if (!goalId) {
      return jsonError("goalId is required", 400);
    }

    // Validate org exists and is public
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }
    if (!org.isPublic) {
      return jsonError("Organization is not public", 403);
    }

    const rows = await db
      .select()
      .from(widgets)
      .where(
        and(
          eq(widgets.organizationId, org.id),
          eq(widgets.goalId, goalId),
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
    console.error("[widgets by-goal GET] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
