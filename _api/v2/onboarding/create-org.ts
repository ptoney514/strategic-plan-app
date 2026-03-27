import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db.js";
import {
  organizations,
  organizationMembers,
  plans,
} from "../../lib/schema/index.js";
import { requireAuth } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "www",
  "login",
  "signup",
  "dashboard",
  "v2",
  "settings",
  "support",
  "help",
]);

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
 * POST /api/v2/onboarding/create-org
 * Create a new organization with owner membership and default plan (atomic).
 */
export async function POST(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    const name = body.name?.trim();
    const entityType = body.entity_type || body.entityType;
    const dashboardTemplate =
      body.dashboard_template || body.dashboardTemplate || "hierarchical";
    const primaryColor = body.primary_color || body.primaryColor;
    const secondaryColor = body.secondary_color || body.secondaryColor;
    const logoUrl = body.logo_url || body.logoUrl;

    // Validate required fields
    if (!name || typeof name !== "string" || name.length === 0) {
      return jsonError("name is required", 400);
    }

    if (!entityType || typeof entityType !== "string") {
      return jsonError("entity_type is required", 400);
    }

    // Handle slug
    const slug = body.slug ? String(body.slug).toLowerCase().trim() : slugify(name);

    if (slug.length < 3 || slug.length > 50) {
      return jsonError("Slug must be between 3 and 50 characters", 400);
    }

    if (!SLUG_REGEX.test(slug)) {
      return jsonError(
        "Slug must contain only lowercase letters, numbers, and hyphens",
        400,
      );
    }

    if (RESERVED_SLUGS.has(slug)) {
      return jsonError("This slug is reserved", 400);
    }

    // Check slug uniqueness
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (existing) {
      return jsonError(
        `An organization with slug "${slug}" already exists`,
        409,
      );
    }

    // Check user doesn't already have too many orgs (prevent abuse)
    const userOrgs = await db
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, user.id),
          eq(organizationMembers.role, "owner"),
        ),
      );

    if (userOrgs.length >= 5) {
      return jsonError("You have reached the maximum number of organizations", 400);
    }

    // Create org + membership + default plan sequentially
    // (neon-http driver does not support transactions)
    const [org] = await db
      .insert(organizations)
      .values({
        name,
        slug,
        entityType: entityType.trim(),
        dashboardTemplate,
        primaryColor: primaryColor || "#0099CC",
        secondaryColor: secondaryColor || undefined,
        logoUrl: logoUrl || undefined,
        createdBy: user.id,
        onboardingCompleted: false,
        isPublic: false,
        isActive: true,
      })
      .returning();

    let membership;
    let plan;
    try {
      [membership] = await db
        .insert(organizationMembers)
        .values({
          organizationId: org.id,
          userId: user.id,
          role: "owner",
        })
        .returning();

      [plan] = await db
        .insert(plans)
        .values({
          organizationId: org.id,
          name: "Strategic Plan",
          slug: "strategic-plan",
          isPublic: false,
          isActive: true,
          orderPosition: 0,
        })
        .returning();
    } catch (cleanupError) {
      // Clean up the org if membership or plan creation fails
      await db
        .delete(organizations)
        .where(eq(organizations.id, org.id));
      throw cleanupError;
    }

    const result = { organization: org, membership, plan };

    return jsonOk(
      {
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          entity_type: result.organization.entityType,
          primary_color: result.organization.primaryColor,
          secondary_color: result.organization.secondaryColor,
          logo_url: result.organization.logoUrl,
          dashboard_template: result.organization.dashboardTemplate,
          onboarding_completed: result.organization.onboardingCompleted,
          created_by: result.organization.createdBy,
        },
        plan: {
          id: result.plan.id,
          name: result.plan.name,
          slug: result.plan.slug,
        },
        membership: {
          id: result.membership.id,
          role: result.membership.role,
        },
      },
      201,
    );
  } catch (error) {
    if (error instanceof Response) return error;
    const cause = error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : undefined;
    const message = cause || (error instanceof Error ? error.message : "Internal server error");
    console.error("[create-org] Error:", message, cause ? `(cause: ${cause})` : "");
    return jsonError(message, 500);
  }
}
