import { eq, and } from "drizzle-orm";
import { db } from "@api/lib/db";
import { organizationInvitations } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * DELETE /api/organizations/[slug]/invitations/[id]
 * Revoke an invitation. Requires admin role.
 * Only allowed if the invitation has not been accepted.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  try {
    const { slug, id } = await params;
    if (!slug) return jsonError("Organization slug is required", 400);
    if (!id) return jsonError("Invitation ID is required", 400);

    const { organization } = await requireOrgMember(req, slug, "admin");

    // Find the invitation and ensure it belongs to this org
    const [invitation] = await db
      .select()
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.id, id),
          eq(organizationInvitations.organizationId, organization.id),
        ),
      )
      .limit(1);

    if (!invitation) {
      return jsonError("Invitation not found", 404);
    }

    if (invitation.acceptedAt) {
      return jsonError("Cannot revoke an already accepted invitation", 400);
    }

    await db
      .delete(organizationInvitations)
      .where(eq(organizationInvitations.id, id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
