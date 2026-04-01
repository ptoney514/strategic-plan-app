import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/middleware/auth.js";
import { db } from "../lib/db.js";
import { organizations, organizationMembers } from "../lib/schema/index.js";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request);

    // System admins: return all active organizations with role "owner"
    if (user.isSystemAdmin) {
      const orgs = await db
        .select({
          organizationId: organizations.id,
          slug: organizations.slug,
          name: organizations.name,
        })
        .from(organizations)
        .where(eq(organizations.isActive, true))
        .orderBy(organizations.name);

      return Response.json(
        orgs.map((o) => ({
          organizationId: o.organizationId,
          slug: o.slug,
          name: o.name,
          role: "owner",
        })),
      );
    }

    // Regular users: join organization_members with organizations
    const memberships = await db
      .select({
        organizationId: organizations.id,
        slug: organizations.slug,
        name: organizations.name,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(eq(organizationMembers.userId, user.id))
      .orderBy(organizations.name);

    return Response.json(memberships);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
