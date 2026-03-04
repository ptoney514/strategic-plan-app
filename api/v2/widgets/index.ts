import { eq, and, max } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { widgets } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

const VALID_TYPES = [
  "donut",
  "big-number",
  "bar-chart",
  "area-line",
  "progress-bar",
  "pie-breakdown",
];

/**
 * GET /api/v2/widgets?orgSlug=xxx
 * List active widgets for an organization, ordered by position.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgSlug = url.searchParams.get("orgSlug");

    if (!orgSlug) {
      return jsonError("orgSlug is required", 400);
    }

    const { organization } = await requireOrgMember(req, orgSlug);

    const rows = await db
      .select()
      .from(widgets)
      .where(
        and(
          eq(widgets.organizationId, organization.id),
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
    console.error("[widgets GET] Error:", error);
    return jsonError("Internal server error", 500);
  }
}

/**
 * POST /api/v2/widgets?orgSlug=xxx
 * Create a new widget for an organization.
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const orgSlug = url.searchParams.get("orgSlug");

    if (!orgSlug) {
      return jsonError("orgSlug is required", 400);
    }

    const { organization } = await requireOrgMember(req, orgSlug, "editor");

    const body = await req.json();

    const type = body.type;
    const title = body.title?.trim();
    const subtitle = body.subtitle?.trim() || null;
    const config = body.config || {};
    const planId = body.plan_id || body.planId || null;
    const goalId = body.goal_id || body.goalId || null;

    if (!type || !VALID_TYPES.includes(type)) {
      return jsonError(
        `type must be one of: ${VALID_TYPES.join(", ")}`,
        400,
      );
    }

    if (!title) {
      return jsonError("title is required", 400);
    }

    // Auto-assign position: max existing position + 1
    const [maxRow] = await db
      .select({ maxPos: max(widgets.position) })
      .from(widgets)
      .where(eq(widgets.organizationId, organization.id));

    const position = maxRow?.maxPos != null ? maxRow.maxPos + 1 : 0;

    const [created] = await db
      .insert(widgets)
      .values({
        organizationId: organization.id,
        planId,
        goalId,
        type,
        title,
        subtitle,
        config,
        position,
      })
      .returning();

    return jsonOk(
      {
        id: created.id,
        organizationId: created.organizationId,
        planId: created.planId,
        goalId: created.goalId,
        type: created.type,
        title: created.title,
        subtitle: created.subtitle,
        config: created.config,
        position: created.position,
        isActive: created.isActive,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      201,
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[widgets POST] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
