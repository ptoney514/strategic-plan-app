import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/middleware/auth.js";
import { db } from "../lib/db.js";
import { organizations, organizationMembers } from "../lib/schema/index.js";
import { jsonOk, jsonError } from "../lib/response.js";

function orgToSnake(o: typeof organizations.$inferSelect) {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    entity_type: o.entityType,
    entity_label: o.entityLabel,
    logo_url: o.logoUrl,
    primary_color: o.primaryColor,
    secondary_color: o.secondaryColor,
    settings: o.settings,
    is_public: o.isPublic,
    is_active: o.isActive,
    admin_email: o.adminEmail,
    tagline: o.tagline,
    dashboard_template: o.dashboardTemplate,
    dashboard_config: o.dashboardConfig,
    district_id: o.id,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request);

    if (user.isSystemAdmin) {
      // System admin: return all active organizations
      const orgs = await db
        .select()
        .from(organizations)
        .where(eq(organizations.isActive, true))
        .orderBy(organizations.name);

      return jsonOk(orgs.map(orgToSnake));
    }

    // Regular user: join memberships with organizations
    const rows = await db
      .select({ org: organizations })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(eq(organizationMembers.userId, user.id))
      .orderBy(organizations.name);

    return jsonOk(rows.map((r) => orgToSnake(r.org)));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
