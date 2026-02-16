import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../../lib/db.js";
import {
  organizations,
  organizationInvitations,
  organizationMembers,
  user,
} from "../../../lib/schema/index.js";
import { requireOrgMember } from "../../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../../lib/response.js";

function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/organizations/[slug]/invitations
 * List invitations for an organization. Requires admin role.
 */
export async function GET(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) return jsonError("Organization slug is required", 400);

    const { organization } = await requireOrgMember(req, slug, "admin");

    const rows = await db
      .select({
        id: organizationInvitations.id,
        email: organizationInvitations.email,
        role: organizationInvitations.role,
        token: organizationInvitations.token,
        expiresAt: organizationInvitations.expiresAt,
        acceptedAt: organizationInvitations.acceptedAt,
        createdAt: organizationInvitations.createdAt,
        invitedByName: user.name,
        invitedByEmail: user.email,
      })
      .from(organizationInvitations)
      .leftJoin(user, eq(organizationInvitations.invitedBy, user.id))
      .where(eq(organizationInvitations.organizationId, organization.id))
      .orderBy(organizationInvitations.createdAt);

    const invitations = rows.map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      token: r.token,
      expires_at: r.expiresAt?.toISOString() ?? null,
      accepted_at: r.acceptedAt?.toISOString() ?? null,
      created_at: r.createdAt?.toISOString() ?? null,
      invited_by_name: r.invitedByName,
      invited_by_email: r.invitedByEmail,
    }));

    return jsonOk(invitations);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * POST /api/organizations/[slug]/invitations
 * Send an invitation. Requires admin role.
 * Body: { email, role, message? }
 */
export async function POST(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) return jsonError("Organization slug is required", 400);

    const { user: currentUser, organization } = await requireOrgMember(
      req,
      slug,
      "admin",
    );

    const body = await req.json();
    const { email, role, message } = body as {
      email?: string;
      role?: string;
      message?: string;
    };

    if (!email) return jsonError("Email is required", 400);
    if (!role) return jsonError("Role is required", 400);

    const validRoles = ["viewer", "editor", "admin"];
    if (!validRoles.includes(role)) {
      return jsonError("Invalid role. Must be viewer, editor, or admin", 400);
    }

    // Check if user is already a member
    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser) {
      const [existingMember] = await db
        .select({ id: organizationMembers.id })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, existingUser.id),
          ),
        )
        .limit(1);

      if (existingMember) {
        return jsonError("User is already a member of this organization", 409);
      }
    }

    // Check for existing pending invitation
    const [existingInvite] = await db
      .select({ id: organizationInvitations.id })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.organizationId, organization.id),
          eq(organizationInvitations.email, email),
          isNull(organizationInvitations.acceptedAt),
        ),
      )
      .limit(1);

    if (existingInvite) {
      return jsonError(
        "A pending invitation already exists for this email",
        409,
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await db
      .insert(organizationInvitations)
      .values({
        organizationId: organization.id,
        email,
        role,
        token,
        invitedBy: currentUser.id,
        expiresAt,
      })
      .returning();

    return jsonOk(
      {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        expires_at: invitation.expiresAt.toISOString(),
        accepted_at: null,
        created_at: invitation.createdAt?.toISOString() ?? null,
      },
      201,
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
