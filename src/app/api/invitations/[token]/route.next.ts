import { eq } from "drizzle-orm";
import { db } from "@api/lib/db";
import {
  organizationInvitations,
  organizations,
} from "@api/lib/schema/index";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * GET /api/invitations/[token]
 * Validate an invitation token. PUBLIC - no auth required.
 * Returns invitation details + org info if valid.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
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
