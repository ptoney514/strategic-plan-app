import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  organizationInvitations,
  organizations,
} from "../lib/schema/index.js";
import { requireAuth } from "../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../lib/response.js";

/**
 * GET /api/user/invitations
 * Get the current user's pending invitations.
 * Filters: not accepted, not expired.
 */
export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const rows = await db
      .select({
        id: organizationInvitations.id,
        email: organizationInvitations.email,
        role: organizationInvitations.role,
        token: organizationInvitations.token,
        expiresAt: organizationInvitations.expiresAt,
        createdAt: organizationInvitations.createdAt,
        orgId: organizations.id,
        orgName: organizations.name,
        orgSlug: organizations.slug,
        orgLogoUrl: organizations.logoUrl,
      })
      .from(organizationInvitations)
      .innerJoin(
        organizations,
        eq(organizationInvitations.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationInvitations.email, user.email),
          isNull(organizationInvitations.acceptedAt),
          gt(organizationInvitations.expiresAt, new Date()),
        ),
      )
      .orderBy(organizationInvitations.createdAt);

    const invitations = rows.map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      token: r.token,
      expires_at: r.expiresAt.toISOString(),
      created_at: r.createdAt?.toISOString() ?? null,
      organization: {
        id: r.orgId,
        name: r.orgName,
        slug: r.orgSlug,
        logo_url: r.orgLogoUrl,
      },
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
