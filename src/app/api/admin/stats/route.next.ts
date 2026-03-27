import { sql } from "drizzle-orm";
import { db } from "@api/lib/db";
import {
  organizations,
  goals,
  user,
} from "@api/lib/schema/index";
import { requireSystemAdmin } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * GET /api/admin/stats
 * Get system-wide statistics. Requires system admin.
 */
export async function GET(req: Request) {
  try {
    await requireSystemAdmin(req);

    const [districtCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations);

    const [objectiveCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(goals)
      .where(sql`${goals.level} = 0`);

    const [userCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);

    return jsonOk({
      totalDistricts: districtCount.count,
      totalGoals: objectiveCount.count,
      totalUsers: userCount.count,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
