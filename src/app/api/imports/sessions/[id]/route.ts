import { eq } from "drizzle-orm";
import { db } from "@api/lib/db";
import { importSessions, organizations } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

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
 * GET /api/imports/sessions/[id]
 * Get session by ID. Requires auth.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [session] = await db
      .select()
      .from(importSessions)
      .where(eq(importSessions.id, id))
      .limit(1);

    if (!session) {
      return jsonError("Import session not found", 404);
    }

    // Look up org slug for membership check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, session.organizationId))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "viewer");

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
 * DELETE /api/imports/sessions/[id]
 * Delete session. Requires auth. Cascading FK handles staged data.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(importSessions)
      .where(eq(importSessions.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Import session not found", 404);
    }

    // Look up org slug for membership check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, existing.organizationId))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "editor");

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
