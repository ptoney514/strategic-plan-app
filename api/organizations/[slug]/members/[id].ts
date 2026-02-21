import { eq, and } from "drizzle-orm";
import { db } from "../../../lib/db.js";
import { organizationMembers } from "../../../lib/schema/index.js";
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
 * PUT /api/organizations/[slug]/members/[id]
 * Update a member's role. Requires admin role.
 * Body: { role }
 */
export async function PUT(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    const id = getIdFromUrl(req);
    if (!slug) return jsonError("Organization slug is required", 400);
    if (!id) return jsonError("Member ID is required", 400);

    const { user: currentUser, organization } = await requireOrgMember(
      req,
      slug,
      "admin",
    );

    const body = await req.json();
    const { role } = body as { role?: string };

    if (!role) return jsonError("Role is required", 400);

    const validRoles = ["viewer", "editor", "admin"];
    if (!validRoles.includes(role)) {
      return jsonError("Invalid role. Must be viewer, editor, or admin", 400);
    }

    // Find the membership
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.id, id),
          eq(organizationMembers.organizationId, organization.id),
        ),
      )
      .limit(1);

    if (!membership) {
      return jsonError("Member not found", 404);
    }

    // Prevent changing own role
    if (membership.userId === currentUser.id) {
      return jsonError("Cannot change your own role", 400);
    }

    const [updated] = await db
      .update(organizationMembers)
      .set({ role })
      .where(eq(organizationMembers.id, id))
      .returning();

    return jsonOk({
      id: updated.id,
      user_id: updated.userId,
      role: updated.role,
      created_at: updated.createdAt?.toISOString() ?? null,
      updated_at: updated.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/organizations/[slug]/members/[id]
 * Remove a member from the organization. Requires admin role.
 */
export async function DELETE(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    const id = getIdFromUrl(req);
    if (!slug) return jsonError("Organization slug is required", 400);
    if (!id) return jsonError("Member ID is required", 400);

    const { user: currentUser, organization } = await requireOrgMember(
      req,
      slug,
      "admin",
    );

    // Find the membership
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.id, id),
          eq(organizationMembers.organizationId, organization.id),
        ),
      )
      .limit(1);

    if (!membership) {
      return jsonError("Member not found", 404);
    }

    // Prevent removing yourself
    if (membership.userId === currentUser.id) {
      return jsonError("Cannot remove yourself from the organization", 400);
    }

    // Guard against removing the last admin
    if (membership.role === "admin" || membership.role === "owner") {
      const adminCount = await db
        .select({ id: organizationMembers.id })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.role, "admin"),
          ),
        );

      // Also count owners
      const ownerCount = await db
        .select({ id: organizationMembers.id })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.role, "owner"),
          ),
        );

      const totalAdmins = adminCount.length + ownerCount.length;
      if (totalAdmins <= 1) {
        return jsonError(
          "Cannot remove the last admin from the organization",
          400,
        );
      }
    }

    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.id, id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
