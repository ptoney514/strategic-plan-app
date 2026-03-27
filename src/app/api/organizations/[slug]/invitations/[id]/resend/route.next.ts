import { eq, and } from "drizzle-orm";
import { db } from "@api/lib/db";
import { organizationInvitations } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";
import { sendEmail } from "@api/lib/email";
import { invitationEmailHtml } from "@api/lib/email-templates";
import { getAppBaseUrl } from "@api/lib/url";

/**
 * POST /api/organizations/[slug]/invitations/[id]/resend
 * Resend an invitation. Generates a new token and resets expiry.
 * Requires admin role.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  try {
    const { slug, id } = await params;
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

    // Fire-and-forget resend invitation email
    const acceptUrl = `${getAppBaseUrl()}/invite/${updated.token}`;
    void sendEmail({
      to: updated.email,
      subject: `You've been invited to ${organization.name} on StrataDash`,
      html: invitationEmailHtml(
        organization.name,
        "An administrator",
        updated.role,
        acceptUrl,
      ),
    });

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
