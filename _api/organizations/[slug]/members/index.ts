import { eq } from "drizzle-orm";
import { db } from "../../../lib/db.js";
import { organizationMembers, user } from "../../../lib/schema/index.js";
import { requireOrgMember } from "../../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../../lib/response.js";

function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/organizations/[slug]/members
 * List members of an organization. Requires org membership.
 */
export async function GET(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) return jsonError("Organization slug is required", 400);

    const { organization } = await requireOrgMember(req, slug);

    const rows = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        createdAt: organizationMembers.createdAt,
        updatedAt: organizationMembers.updatedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(organizationMembers)
      .innerJoin(user, eq(organizationMembers.userId, user.id))
      .where(eq(organizationMembers.organizationId, organization.id))
      .orderBy(organizationMembers.createdAt);

    const members = rows.map((r) => ({
      id: r.id,
      user_id: r.userId,
      role: r.role,
      created_at: r.createdAt?.toISOString() ?? null,
      updated_at: r.updatedAt?.toISOString() ?? null,
      user_name: r.userName,
      user_email: r.userEmail,
      user_image: r.userImage,
    }));

    return jsonOk(members);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
