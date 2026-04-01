import { eq, and } from "drizzle-orm";
import { db } from "@api/lib/db";
import { widgets, organizations } from "@api/lib/schema/index";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * GET /api/v2/widgets/public?orgSlug=xxx
 * List active widgets for a public organization. No auth required.
 * Only returns widgets for orgs that have is_public=true.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgSlug = url.searchParams.get("orgSlug");

    if (!orgSlug) {
      return jsonError("orgSlug is required", 400);
    }

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
    console.error("[widgets public GET] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
