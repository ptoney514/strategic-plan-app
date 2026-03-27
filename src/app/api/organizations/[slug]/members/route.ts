import { eq } from "drizzle-orm";
import { db } from "@api/lib/db";
import { organizationMembers, user } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * GET /api/organizations/[slug]/members
 * List members of an organization. Requires org membership.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
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
