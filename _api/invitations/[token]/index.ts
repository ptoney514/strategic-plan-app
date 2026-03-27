import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../lib/db.js";
import {
  organizationInvitations,
  organizations,
} from "../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../lib/response.js";

function getTokenFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/invitations/[token]
 * Validate an invitation token. PUBLIC - no auth required.
 * Returns invitation details + org info if valid.
 */
export async function GET(req: Request) {
  try {
    const token = getTokenFromUrl(req);
    if (!token) return jsonError("Token is required", 400);

    const [row] = await db
      .select({
        id: organizationInvitations.id,
        email: organizationInvitations.email,
        role: organizationInvitations.role,
        expiresAt: organizationInvitations.expiresAt,
        acceptedAt: organizationInvitations.acceptedAt,
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
      .where(eq(organizationInvitations.token, token))
      .limit(1);

    if (!row) {
      return jsonError("Invitation not found", 404);
    }

    if (row.acceptedAt) {
      return jsonError("Invitation has already been accepted", 400);
    }

    if (row.expiresAt < new Date()) {
      return jsonError("Invitation has expired", 400);
    }

    return jsonOk({
      id: row.id,
      email: row.email,
      role: row.role,
      expires_at: row.expiresAt.toISOString(),
      created_at: row.createdAt?.toISOString() ?? null,
      organization: {
        id: row.orgId,
        name: row.orgName,
        slug: row.orgSlug,
        logo_url: row.orgLogoUrl,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
