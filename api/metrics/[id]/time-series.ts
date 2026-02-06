import { eq, and, asc } from "drizzle-orm";
import { db } from "../../lib/db";
import {
  metrics,
  metricTimeSeries,
} from "../../lib/schema/index";
import { requireOrgMember } from "../../lib/middleware/auth";
import { getOrgSlugForMetric, isPublicOrg } from "../../lib/helpers/org-lookup";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

/** Map a Drizzle metricTimeSeries row to snake_case for the frontend */
function timeSeriesEntryToSnake(e: typeof metricTimeSeries.$inferSelect) {
  return {
    id: e.id,
    metric_id: e.metricId,
    organization_id: e.organizationId,
    period: e.period,
    period_type: e.periodType,
    target_value: e.targetValue,
    actual_value: e.actualValue,
    status: e.status,
    notes: e.notes,
    created_by: e.createdBy,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

/**
 * GET /api/metrics/[id]/time-series - Get time series for a metric
 * Query params:
 *   ?periodType=monthly  - filter by period_type
 *   ?limit=12            - limit number of entries
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/")[3];
    if (!id) return jsonError("Metric ID is required", 400);

    // Verify metric exists
    const [metric] = await db
      .select({ id: metrics.id })
      .from(metrics)
      .where(eq(metrics.id, id))
      .limit(1);

    if (!metric) return jsonError("Metric not found", 404);

    // Access check: allow if org is public, otherwise require auth + membership
    const metricLookup = await getOrgSlugForMetric(id);
    if (metricLookup) {
      const orgIsPublic = await isPublicOrg(metricLookup.orgId);
      if (!orgIsPublic) {
        await requireOrgMember(req, metricLookup.orgSlug, "viewer");
      }
    }

    const periodType = url.searchParams.get("periodType");
    const limit = url.searchParams.get("limit");

    const conditions = [eq(metricTimeSeries.metricId, id)];
    if (periodType) {
      conditions.push(eq(metricTimeSeries.periodType, periodType));
    }

    const query = db
      .select()
      .from(metricTimeSeries)
      .where(and(...conditions))
      .orderBy(asc(metricTimeSeries.period));

    const rows = limit
      ? await query.limit(Math.min(parseInt(limit, 10), 500))
      : await query;

    return jsonOk(rows.map(timeSeriesEntryToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * POST /api/metrics/[id]/time-series - Upsert a time series entry
 * Requires auth + org membership (editor role minimum)
 *
 * Body: { period, period_type, target_value?, actual_value?, status?, notes? }
 *
 * If an entry exists for (metricId, period), it will be updated.
 * Otherwise a new entry is inserted.
 */
export async function POST(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Metric ID is required", 400);

    // Look up metric -> goal -> plan -> org
    const lookup = await getOrgSlugForMetric(id);
    if (!lookup) return jsonError("Metric not found", 404);

    const { user } = await requireOrgMember(req, lookup.orgSlug, "editor");

    const body = await req.json();

    if (!body.period || typeof body.period !== "string") {
      return jsonError("period is required", 400);
    }
    if (!body.period_type || typeof body.period_type !== "string") {
      return jsonError("period_type is required", 400);
    }

    // Check if entry already exists for this metric + period
    const [existing] = await db
      .select()
      .from(metricTimeSeries)
      .where(
        and(
          eq(metricTimeSeries.metricId, id),
          eq(metricTimeSeries.period, body.period),
        ),
      )
      .limit(1);

    if (existing) {
      // Update existing entry
      const updateData: Partial<typeof metricTimeSeries.$inferInsert> = {};
      if (body.period_type !== undefined)
        updateData.periodType = body.period_type;
      if (body.target_value !== undefined)
        updateData.targetValue = body.target_value;
      if (body.actual_value !== undefined)
        updateData.actualValue = body.actual_value;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const [updated] = await db
        .update(metricTimeSeries)
        .set(updateData)
        .where(eq(metricTimeSeries.id, existing.id))
        .returning();

      return jsonOk(timeSeriesEntryToSnake(updated));
    }

    // Insert new entry
    const [created] = await db
      .insert(metricTimeSeries)
      .values({
        metricId: id,
        organizationId: lookup.orgId,
        period: body.period,
        periodType: body.period_type,
        targetValue: body.target_value ?? null,
        actualValue: body.actual_value ?? null,
        status: body.status ?? null,
        notes: body.notes ?? null,
        createdBy: user.id,
      })
      .returning();

    return jsonOk(timeSeriesEntryToSnake(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/metrics/[id]/time-series - Delete a time series entry
 * Requires auth + org membership (admin role)
 *
 * Query param: ?entryId=xxx
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/")[3];
    if (!id) return jsonError("Metric ID is required", 400);

    const entryId = url.searchParams.get("entryId");
    if (!entryId) return jsonError("entryId query parameter is required", 400);

    // Look up metric -> goal -> plan -> org
    const lookup = await getOrgSlugForMetric(id);
    if (!lookup) return jsonError("Metric not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "admin");

    // Verify the entry belongs to this metric
    const [entry] = await db
      .select({ id: metricTimeSeries.id })
      .from(metricTimeSeries)
      .where(
        and(
          eq(metricTimeSeries.id, entryId),
          eq(metricTimeSeries.metricId, id),
        ),
      )
      .limit(1);

    if (!entry) return jsonError("Time series entry not found", 404);

    await db
      .delete(metricTimeSeries)
      .where(eq(metricTimeSeries.id, entryId));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
