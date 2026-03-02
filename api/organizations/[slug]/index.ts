import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { organizations } from "../../lib/schema/index.js";
import {
  requireAuth,
  requireOrgMember,
  requireSystemAdmin,
} from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

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
    onboarding_completed: org.onboardingCompleted,
    template_mode: org.templateMode,
    created_by: org.createdBy,
    district_id: org.id,
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
 * Accepts snake_case keys (preferred) with camelCase fallback for backward compat.
 * Updatable fields: name, entity_label, logo_url, primary_color, secondary_color,
 *   settings, is_public, admin_email, tagline, dashboard_template, dashboard_config
 */
export async function PUT(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) {
      return jsonError("Organization slug is required", 400);
    }

    const { organization } = await requireOrgMember(req, slug, "admin");
    const body = await req.json();

    // Build an update object with only the fields that were provided.
    // Prefer snake_case keys, fall back to camelCase for backward compatibility.
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;

    if (body.entity_label !== undefined) updates.entityLabel = body.entity_label;
    else if (body.entityLabel !== undefined) updates.entityLabel = body.entityLabel;

    if (body.logo_url !== undefined) updates.logoUrl = body.logo_url;
    else if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;

    if (body.primary_color !== undefined) updates.primaryColor = body.primary_color;
    else if (body.primaryColor !== undefined) updates.primaryColor = body.primaryColor;

    if (body.secondary_color !== undefined)
      updates.secondaryColor = body.secondary_color;
    else if (body.secondaryColor !== undefined)
      updates.secondaryColor = body.secondaryColor;

    if (body.settings !== undefined) updates.settings = body.settings;

    if (body.is_public !== undefined) updates.isPublic = body.is_public;
    else if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

    if (body.admin_email !== undefined) updates.adminEmail = body.admin_email;
    else if (body.adminEmail !== undefined) updates.adminEmail = body.adminEmail;

    if (body.tagline !== undefined) updates.tagline = body.tagline;

    if (body.dashboard_template !== undefined)
      updates.dashboardTemplate = body.dashboard_template;
    else if (body.dashboardTemplate !== undefined)
      updates.dashboardTemplate = body.dashboardTemplate;

    if (body.dashboard_config !== undefined)
      updates.dashboardConfig = body.dashboard_config;
    else if (body.dashboardConfig !== undefined)
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
