import { eq, and } from "drizzle-orm";
import { db } from "../../../../lib/db.js";
import { organizationInvitations } from "../../../../lib/schema/index.js";
import { requireOrgMember } from "../../../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../../../lib/response.js";

function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

function getIdFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[5];
}

/**
 * POST /api/organizations/[slug]/invitations/[id]/resend
 * Resend an invitation. Generates a new token and resets expiry.
 * Requires admin role.
 */
export async function POST(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    const id = getIdFromUrl(req);
    if (!slug) return jsonError("Organization slug is required", 400);
    if (!id) return jsonError("Invitation ID is required", 400);

    const { organization } = await requireOrgMember(req, slug, "admin");

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
      return jsonError("Cannot resend an already accepted invitation", 400);
    }

    const newToken = crypto.randomUUID();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [updated] = await db
      .update(organizationInvitations)
      .set({ token: newToken, expiresAt: newExpiry })
      .where(eq(organizationInvitations.id, id))
      .returning();

    return jsonOk({
      id: updated.id,
      email: updated.email,
      role: updated.role,
      token: updated.token,
      expires_at: updated.expiresAt.toISOString(),
      accepted_at: null,
      created_at: updated.createdAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
