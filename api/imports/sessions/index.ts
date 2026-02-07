import { eq, desc } from "drizzle-orm";
import { db } from "../../lib/db";
import { importSessions, organizations } from "../../lib/schema/index";
import { requireOrgMember } from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

function sessionToSnake(s: typeof importSessions.$inferSelect) {
  return {
    id: s.id,
    organization_id: s.organizationId,
    filename: s.filename,
    file_size: s.fileSize,
    status: s.status,
    uploaded_by: s.uploadedBy,
    uploaded_at: s.uploadedAt,
    completed_at: s.completedAt,
    error_message: s.errorMessage,
    import_summary: s.importSummary,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

/**
 * POST /api/imports/sessions
 * Create an import session. Requires auth.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const organization_id = body.organization_id || body.district_id;
    const { filename, file_size, uploaded_by } = body;

    if (!organization_id) {
      return jsonError("organization_id or district_id is required", 400);
    }
    if (!filename) {
      return jsonError("filename is required", 400);
    }

    // Look up org slug for membership check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, organization_id))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "editor");

    const [created] = await db
      .insert(importSessions)
      .values({
        organizationId: organization_id,
        filename,
        fileSize: file_size ?? null,
        uploadedBy: uploaded_by ?? null,
      })
      .returning();

    return jsonOk(sessionToSnake(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * GET /api/imports/sessions?orgId=xxx
 * List sessions for an organization. Requires auth.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");

    if (!orgId) {
      return jsonError("orgId query parameter is required", 400);
    }

    // Look up org slug for membership check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "viewer");

    const sessions = await db
      .select()
      .from(importSessions)
      .where(eq(importSessions.organizationId, orgId))
      .orderBy(desc(importSessions.createdAt));

    return jsonOk(sessions.map(sessionToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
