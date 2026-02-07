import { sql } from "drizzle-orm";
import { db } from "../lib/db";
import {
  organizations,
  plans,
  goals,
  metrics,
  schools,
  user,
} from "../lib/schema/index";
import { requireSystemAdmin } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

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

    const [planCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(plans);

    const [objectiveCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(goals)
      .where(sql`${goals.level} = 0`);

    const [metricCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(metrics);

    const [schoolCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schools);

    const [userCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);

    return jsonOk({
      district_count: districtCount.count,
      plan_count: planCount.count,
      objective_count: objectiveCount.count,
      metric_count: metricCount.count,
      school_count: schoolCount.count,
      user_count: userCount.count,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
