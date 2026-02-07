import { eq, desc } from "drizzle-orm";
import { db } from "../lib/db";
import {
  organizations,
  organizationMembers,
} from "../lib/schema/index";
import { requireSystemAdmin } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

/**
 * GET /api/admin/members
 * List all organization members. Requires system admin.
 * Joins with organizations to include org name/slug.
 */
export async function GET(req: Request) {
  try {
    await requireSystemAdmin(req);

    const rows = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        organizationId: organizationMembers.organizationId,
        role: organizationMembers.role,
        createdAt: organizationMembers.createdAt,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .orderBy(desc(organizationMembers.createdAt));

    const result = rows.map((r) => ({
      id: r.id,
      user_id: r.userId,
      organization_id: r.organizationId,
      district_id: r.organizationId,
      role: r.role,
      created_at: r.createdAt,
      organization_name: r.organizationName,
      organization_slug: r.organizationSlug,
      district_slug: r.organizationSlug,
    }));

    return jsonOk(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * POST /api/admin/members
 * Add an organization member. Requires system admin.
 * Body: { user_id, organization_id, role? }
 * Role defaults to "admin".
 */
export async function POST(req: Request) {
  try {
    await requireSystemAdmin(req);

    const body = await req.json();
    const { user_id, organization_id, role } = body;

    if (!user_id || typeof user_id !== "string") {
      return jsonError("user_id is required", 400);
    }
    if (!organization_id || typeof organization_id !== "string") {
      return jsonError("organization_id is required", 400);
    }

    const [created] = await db
      .insert(organizationMembers)
      .values({
        userId: user_id,
        organizationId: organization_id,
        role: role ?? "admin",
      })
      .returning();

    return jsonOk(
      {
        id: created.id,
        user_id: created.userId,
        organization_id: created.organizationId,
        district_id: created.organizationId,
        role: created.role,
        created_at: created.createdAt,
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

/**
 * DELETE /api/admin/members?id={memberId}
 * Remove an organization member. Requires system admin.
 */
export async function DELETE(req: Request) {
  try {
    await requireSystemAdmin(req);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return jsonError("id query parameter is required", 400);
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
