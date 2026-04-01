import { eq, and } from "drizzle-orm";
import { db } from "@api/lib/db";
import { widgets, organizations } from "@api/lib/schema/index";
import { jsonOk, jsonError } from "@api/lib/response";
import { requireOrgMember } from "@api/lib/middleware/auth";

/**
 * GET /api/v2/widgets/by-goal?orgSlug=xxx&goalId=xxx
 * List active widgets for a specific goal, scoped to an organization.
 * Public orgs: no auth required. Private orgs: requires authenticated org member.
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
