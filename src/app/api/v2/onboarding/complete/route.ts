import { eq, and } from "drizzle-orm";
import { db } from "@api/lib/db";
import {
  organizations,
  organizationMembers,
} from "@api/lib/schema/index";
import { requireAuth } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * POST /api/v2/onboarding/complete
 * Finalize onboarding: update branding, set onboardingCompleted = true.
 */
export async function POST(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    const organizationId = body.organization_id || body.organizationId;

    if (!organizationId) {
      return jsonError("organization_id is required", 400);
    }

    // Verify user is owner of this org
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, user.id),
          eq(organizationMembers.role, "owner"),
        ),
      )
      .limit(1);

    if (!membership) {
      return jsonError("You must be the owner of this organization", 403);
    }

    // Build update fields
    const updates: Record<string, unknown> = {
      onboardingCompleted: true,
    };

    const primaryColor = body.primary_color || body.primaryColor;
    const secondaryColor = body.secondary_color || body.secondaryColor;
    const logoUrl = body.logo_url || body.logoUrl;
    const dashboardTemplate =
      body.dashboard_template || body.dashboardTemplate;

    if (primaryColor !== undefined) updates.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updates.secondaryColor = secondaryColor;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (dashboardTemplate !== undefined)
      updates.dashboardTemplate = dashboardTemplate;

    const [updated] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, organizationId))
      .returning();

    if (!updated) {
      return jsonError("Organization not found", 404);
    }

    return jsonOk({
      organization: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        entity_type: updated.entityType,
        primary_color: updated.primaryColor,
        secondary_color: updated.secondaryColor,
        logo_url: updated.logoUrl,
        dashboard_template: updated.dashboardTemplate,
        onboarding_completed: updated.onboardingCompleted,
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
