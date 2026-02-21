import { sql } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  organizations,
  goals,
  schools,
  user,
} from "../lib/schema/index.js";
import { requireSystemAdmin } from "../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../lib/response.js";

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

    const [schoolCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schools);

    const [userCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);

    return jsonOk({
      totalDistricts: districtCount.count,
      totalGoals: objectiveCount.count,
      totalUsers: userCount.count,
      totalSchools: schoolCount.count,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
