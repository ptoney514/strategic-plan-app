import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { organizations } from "../../lib/schema/index";
import {
  requireAuth,
  requireOrgMember,
  requireSystemAdmin,
} from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

/** Map a Drizzle organization row to snake_case for the frontend */
function toSnakeCase(org: typeof organizations.$inferSelect) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    entity_type: org.entityType,
    entity_label: org.entityLabel,
    logo_url: org.logoUrl,
    primary_color: org.primaryColor,
    secondary_color: org.secondaryColor,
    settings: org.settings,
    is_public: org.isPublic,
    is_active: org.isActive,
    admin_email: org.adminEmail,
    tagline: org.tagline,
    dashboard_template: org.dashboardTemplate,
    dashboard_config: org.dashboardConfig,
    created_at: org.createdAt?.toISOString() ?? null,
    updated_at: org.updatedAt?.toISOString() ?? null,
  };
}

/** Extract the org slug from the URL path: /api/organizations/[slug]/... */
function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  // pathname: /api/organizations/{slug} or /api/organizations/{slug}/...
  return segments[3];
}

/**
 * GET /api/organizations/[slug]
 * Get a single organization by slug.
 * - If the org is public, no auth required.
 * - If private, require auth + membership.
 */
export async function GET(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) {
      return jsonError("Organization slug is required", 400);
    }

    // First, look up the org to check if it's public
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    // Public orgs can be read by anyone
    if (org.isPublic) {
      return jsonOk(toSnakeCase(org));
    }

    // Private org: require auth + membership (throws on failure)
    await requireOrgMember(req, slug);
    return jsonOk(toSnakeCase(org));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * PUT /api/organizations/[slug]
 * Update organization. Requires org admin role.
 * Updatable fields: name, entityLabel, logoUrl, primaryColor, secondaryColor,
 *   settings, isPublic, adminEmail, tagline, dashboardTemplate, dashboardConfig
 */
export async function PUT(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) {
      return jsonError("Organization slug is required", 400);
    }

    const { organization } = await requireOrgMember(req, slug, "admin");
    const body = await req.json();

    // Build an update object with only the fields that were provided
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.entityLabel !== undefined) updates.entityLabel = body.entityLabel;
    if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
    if (body.primaryColor !== undefined) updates.primaryColor = body.primaryColor;
    if (body.secondaryColor !== undefined)
      updates.secondaryColor = body.secondaryColor;
    if (body.settings !== undefined) updates.settings = body.settings;
    if (body.isPublic !== undefined) updates.isPublic = body.isPublic;
    if (body.adminEmail !== undefined) updates.adminEmail = body.adminEmail;
    if (body.tagline !== undefined) updates.tagline = body.tagline;
    if (body.dashboardTemplate !== undefined)
      updates.dashboardTemplate = body.dashboardTemplate;
    if (body.dashboardConfig !== undefined)
      updates.dashboardConfig = body.dashboardConfig;

    if (Object.keys(updates).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const [updated] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, organization.id))
      .returning();

    return jsonOk(toSnakeCase(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/organizations/[slug]
 * Delete an organization. Requires system admin.
 */
export async function DELETE(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) {
      return jsonError("Organization slug is required", 400);
    }

    await requireSystemAdmin(req);

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    await db
      .delete(organizations)
      .where(eq(organizations.id, org.id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
