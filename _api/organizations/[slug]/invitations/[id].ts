import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../../lib/db.js";
import { organizationInvitations } from "../../../lib/schema/index.js";
import { requireOrgMember } from "../../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../../lib/response.js";

function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

function getIdFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[5];
}

/**
 * DELETE /api/organizations/[slug]/invitations/[id]
 * Revoke an invitation. Requires admin role.
 * Only allowed if the invitation has not been accepted.
 */
export async function DELETE(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    const id = getIdFromUrl(req);
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
