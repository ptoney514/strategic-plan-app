import { eq, desc } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { user, organizations, organizationMembers } from "../../lib/schema/index.js";
import { requireSystemAdmin } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/**
 * GET /api/admin/users
 * List all users with their organization memberships. Requires system admin.
 */
export async function GET(req: Request) {
  try {
    await requireSystemAdmin(req);

    // Fetch all users
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isSystemAdmin: user.isSystemAdmin,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt));

    // Fetch all memberships with org info
    const memberships = await db
      .select({
        userId: organizationMembers.userId,
        orgId: organizations.id,
        orgName: organizations.name,
        orgSlug: organizations.slug,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      );

    // Group memberships by user
    const membershipMap = new Map<
      string,
      { org_id: string; org_name: string; org_slug: string; role: string }[]
    >();
    for (const m of memberships) {
      const list = membershipMap.get(m.userId) ?? [];
      list.push({
        org_id: m.orgId,
        org_name: m.orgName,
        org_slug: m.orgSlug,
        role: m.role,
      });
      membershipMap.set(m.userId, list);
    }

    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      is_system_admin: u.isSystemAdmin ?? false,
      created_at: u.createdAt,
      memberships: membershipMap.get(u.id) ?? [],
    }));

    return jsonOk(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
