import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  organizations,
  organizationMembers,
} from "../lib/schema/index.js";
import {
  requireAuth,
  requireSystemAdmin,
} from "../lib/middleware/auth.js";
import { jsonOk, jsonError, parsePagination } from "../lib/response.js";

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

/** Generate a URL-friendly slug from a name */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/organizations
 * - ?id={uuid}     -> return single org by ID (public orgs: no auth; private: requires auth)
 * - ?public=true   -> return only public, active orgs (no auth required)
 * - otherwise      -> require auth; return user's orgs (or all for sysadmin)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    const publicOnly = url.searchParams.get("public") === "true";
    const { limit, offset } = parsePagination(url);

    // Single org lookup by ID
    // Mirror the same public-access pattern used by GET /api/organizations/[slug]:
    // look up first, return without auth if the org is public.
    if (idParam) {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, idParam))
        .limit(1);
      if (!org) return jsonError("Organization not found", 404);
      if (org.isPublic) return jsonOk(toSnakeCase(org));
      // Private org: require auth
      await requireAuth(req);
      return jsonOk(toSnakeCase(org));
    }

    if (publicOnly) {
      const rows = await db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.isPublic, true),
            eq(organizations.isActive, true),
          ),
        )
        .limit(limit)
        .offset(offset)
        .orderBy(organizations.name);

      return jsonOk(rows.map(toSnakeCase));
    }

    // Authenticated path
    const { user } = await requireAuth(req);

    if (user.isSystemAdmin) {
      const rows = await db
        .select()
        .from(organizations)
        .where(eq(organizations.isActive, true))
        .limit(limit)
        .offset(offset)
        .orderBy(organizations.name);

      return jsonOk(rows.map(toSnakeCase));
    }

    // Regular user: only orgs they belong to
    const rows = await db
      .select({
        org: organizations,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationMembers.userId, user.id),
          eq(organizations.isActive, true),
        ),
      )
      .limit(limit)
      .offset(offset)
      .orderBy(organizations.name);

    return jsonOk(
      rows.map((r) => ({
        ...toSnakeCase(r.org),
        role: r.role,
      })),
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
 * POST /api/organizations
 * Create a new organization. Requires system admin.
 * Body: { name, slug?, entityType, entityLabel?, logoUrl?, primaryColor?,
 *         secondaryColor?, adminEmail?, tagline?, dashboardTemplate?,
 *         dashboardConfig?, isPublic?, settings? }
 */
export async function POST(req: Request) {
  try {
    await requireSystemAdmin(req);

    const body = await req.json();
    const name = body.name;
    const entityType = body.entityType || body.entity_type;
    const entityLabel = body.entityLabel ?? body.entity_label;
    const logoUrl = body.logoUrl ?? body.logo_url;
    const primaryColor = body.primaryColor ?? body.primary_color;
    const secondaryColor = body.secondaryColor ?? body.secondary_color;
    const adminEmail = body.adminEmail ?? body.admin_email;
    const dashboardTemplate = body.dashboardTemplate ?? body.dashboard_template;
    const dashboardConfig = body.dashboardConfig ?? body.dashboard_config;
    const isPublic = body.isPublic ?? body.is_public;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return jsonError("name is required", 400);
    }
    if (
      !entityType ||
      typeof entityType !== "string" ||
      entityType.trim().length === 0
    ) {
      return jsonError("entityType or entity_type is required", 400);
    }

    const slug = body.slug ? String(body.slug).trim() : slugify(name);

    // Check slug uniqueness
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (existing) {
      return jsonError(`An organization with slug "${slug}" already exists`, 409);
    }

    const [created] = await db
      .insert(organizations)
      .values({
        name: name.trim(),
        slug,
        entityType: entityType.trim(),
        entityLabel: entityLabel ?? undefined,
        logoUrl: logoUrl ?? undefined,
        primaryColor: primaryColor ?? undefined,
        secondaryColor: secondaryColor ?? undefined,
        adminEmail: adminEmail ?? undefined,
        tagline: body.tagline ?? undefined,
        dashboardTemplate: dashboardTemplate ?? undefined,
        dashboardConfig: dashboardConfig ?? undefined,
        isPublic: isPublic ?? false,
        settings: body.settings ?? undefined,
      })
      .returning();

    return jsonOk(toSnakeCase(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
