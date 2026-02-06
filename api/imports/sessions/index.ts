import { eq, desc } from "drizzle-orm";
import { db } from "../../lib/db";
import { importSessions } from "../../lib/schema/index";
import { requireAuth } from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

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
    await requireAuth(req);

    const body = await req.json();
    const { organization_id, filename, file_size, uploaded_by } = body;

    if (!organization_id) {
      return jsonError("organization_id is required", 400);
    }
    if (!filename) {
      return jsonError("filename is required", 400);
    }

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
    await requireAuth(req);

    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");

    if (!orgId) {
      return jsonError("orgId query parameter is required", 400);
    }

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
