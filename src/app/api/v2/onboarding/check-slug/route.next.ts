import { eq } from "drizzle-orm";
import { db } from "@api/lib/db";
import { organizations } from "@api/lib/schema/index";
import { requireAuth } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

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

/**
 * GET /api/v2/onboarding/check-slug?slug=westside
 * Check if a slug is available for a new organization.
 */
export async function GET(req: Request) {
  try {
    await requireAuth(req);

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.toLowerCase().trim();

    if (!slug) {
      return jsonError("slug query parameter is required", 400);
    }

    // Validate format
    if (slug.length < 3 || slug.length > 50) {
      return jsonOk({
        available: false,
        slug,
        reason: "Slug must be between 3 and 50 characters",
      });
    }

    if (!SLUG_REGEX.test(slug)) {
      return jsonOk({
        available: false,
        slug,
        reason:
          "Slug must contain only lowercase letters, numbers, and hyphens",
      });
    }

    if (RESERVED_SLUGS.has(slug)) {
      return jsonOk({
        available: false,
        slug,
        reason: "This URL is reserved",
        suggestion: `${slug}-org`,
      });
    }

    // Check uniqueness
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (existing) {
      // Suggest an alternative
      const suggestion = `${slug}-${Math.floor(Math.random() * 900) + 100}`;
      return jsonOk({
        available: false,
        slug,
        reason: "This URL is already taken",
        suggestion,
      });
    }

    return jsonOk({ available: true, slug });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
