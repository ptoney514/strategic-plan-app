import { eq, and } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { organizations, organizationMembers } from "../schema/index";
import { hasMinimumRole } from "./roles";
import type { OrgRole } from "./roles";

export { hasMinimumRole } from "./roles";
export type { OrgRole } from "./roles";

/**
 * Validates the session from the request. Returns user + session or throws 401.
 */
export async function requireAuth(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return session; // { user, session }
}

/**
 * Validates the user is a member of the organization (by slug).
 * System admins bypass the membership check.
 */
export async function requireOrgMember(
  req: Request,
  orgSlug: string,
  minimumRole?: OrgRole,
) {
  const { user, session } = await requireAuth(req);

  // System admins bypass membership checks
  if (user.isSystemAdmin) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    if (!org) {
      throw new Response(JSON.stringify({ error: "Organization not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      user,
      session,
      organization: org,
      membership: null as null,
      role: "owner" as const,
    };
  }

  // Look up organization + membership in one query
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, orgSlug))
    .limit(1);

  if (!org) {
    throw new Response(JSON.stringify({ error: "Organization not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, org.id),
        eq(organizationMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (minimumRole && !hasMinimumRole(membership.role, minimumRole)) {
    throw new Response(JSON.stringify({ error: "Insufficient permissions" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return {
    user,
    session,
    organization: org,
    membership,
    role: membership.role as OrgRole,
  };
}

/**
 * Validates the user is a system admin. Throws 403 if not.
 */
export async function requireSystemAdmin(req: Request) {
  const { user, session } = await requireAuth(req);

  if (!user.isSystemAdmin) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { user, session };
}
