import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { importSessions } from "../../../lib/schema/index";
import { requireAuth } from "../../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../../lib/response";

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

function extractSessionId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  // /api/imports/sessions/[id] -> segments[4]
  return segments[4];
}

/**
 * GET /api/imports/sessions/:id
 * Get session by ID. Requires auth.
 */
export async function GET(req: Request) {
  try {
    await requireAuth(req);

    const id = extractSessionId(req);

    const [session] = await db
      .select()
      .from(importSessions)
      .where(eq(importSessions.id, id))
      .limit(1);

    if (!session) {
      return jsonError("Import session not found", 404);
    }

    return jsonOk(sessionToSnake(session));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/imports/sessions/:id
 * Delete session. Requires auth. Cascading FK handles staged data.
 */
export async function DELETE(req: Request) {
  try {
    await requireAuth(req);

    const id = extractSessionId(req);

    const [existing] = await db
      .select()
      .from(importSessions)
      .where(eq(importSessions.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Import session not found", 404);
    }

    await db.delete(importSessions).where(eq(importSessions.id, id));

    return jsonOk({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
