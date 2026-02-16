import { desc, eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { user } from "../lib/schema/index.js";
import { organizations, organizationMembers } from "../lib/schema/index.js";
import { requireSystemAdmin } from "../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../lib/response.js";

/**
 * GET /api/admin/recent-users
 * Get recent users with their org membership info. Requires system admin.
 */
export async function GET(req: Request) {
  try {
    await requireSystemAdmin(req);

    const url = new URL(req.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "10", 10),
      100,
    );

    // Fetch recent users with their first org membership
    const rows = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isSystemAdmin: user.isSystemAdmin,
        createdAt: user.createdAt,
        memberRole: organizationMembers.role,
        orgName: organizations.name,
      })
      .from(user)
      .leftJoin(organizationMembers, eq(user.id, organizationMembers.userId))
      .leftJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .orderBy(desc(user.createdAt))
      .limit(limit);

    // Deduplicate users who have multiple memberships (keep first row)
    const seen = new Set<string>();
    const result = [];
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);

      const role = row.isSystemAdmin
        ? "system_admin"
        : row.memberRole ?? "viewer";

      result.push({
        id: row.id,
        user_id: row.id,
        name: row.name,
        email: row.email,
        role,
        district_name: row.orgName ?? undefined,
        created_at: row.createdAt,
      });
    }

    return jsonOk(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
