import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { goals } from "../../lib/schema/index";
import { requireAuth } from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

function extractGoalId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  // /api/progress/[goalId]/display-mode -> segments[3]
  return segments[3];
}

const VALID_DISPLAY_MODES = [
  "percentage",
  "qualitative",
  "score",
  "color-only",
  "hidden",
  "custom",
];

/**
 * PUT /api/progress/:goalId/display-mode
 * Update display mode. Requires auth.
 */
export async function PUT(req: Request) {
  try {
    await requireAuth(req);

    const goalId = extractGoalId(req);

    const [existing] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, goalId))
      .limit(1);

    if (!existing) {
      return jsonError("Goal not found", 404);
    }

    const body = await req.json();
    const { display_mode } = body;

    if (!display_mode) {
      return jsonError("display_mode is required", 400);
    }

    if (!VALID_DISPLAY_MODES.includes(display_mode)) {
      return jsonError(
        `Invalid display_mode. Must be one of: ${VALID_DISPLAY_MODES.join(", ")}`,
        400,
      );
    }

    await db
      .update(goals)
      .set({ overallProgressDisplayMode: display_mode })
      .where(eq(goals.id, goalId));

    return jsonOk({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
