import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { organizationInvitations } from "../../lib/schema/index.js";
import { requireAuth } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

function getTokenFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * POST /api/invitations/[token]/decline
 * Decline an invitation. Requires auth.
 * Deletes the invitation row.
 */
export async function POST(req: Request) {
  try {
    const token = getTokenFromUrl(req);
    if (!token) return jsonError("Token is required", 400);

    const { user } = await requireAuth(req);

    const [invitation] = await db
      .select()
      .from(organizationInvitations)
      .where(eq(organizationInvitations.token, token))
      .limit(1);

    if (!invitation) {
      return jsonError("Invitation not found", 404);
    }

    if (invitation.acceptedAt) {
      return jsonError("Invitation has already been accepted", 400);
    }

    // Verify the logged-in user's email matches the invitation
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return jsonError(
        "This invitation was sent to a different email address",
        403,
      );
    }

    await db
      .delete(organizationInvitations)
      .where(eq(organizationInvitations.id, invitation.id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
