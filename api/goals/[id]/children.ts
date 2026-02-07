import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { goals, metrics } from "../../lib/schema/index";
import { requireOrgMember } from "../../lib/middleware/auth";
import { getOrgSlugForGoal, isPublicOrg } from "../../lib/helpers/org-lookup";
import { jsonOk, jsonError } from "../../lib/response";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function goalToSnake(g: Record<string, unknown>) {
  return {
    id: g.id,
    plan_id: g.planId,
    organization_id: g.organizationId,
    district_id: g.organizationId,
    school_id: g.schoolId,
    parent_id: g.parentId,
    goal_number: g.goalNumber,
    title: g.title,
    description: g.description,
    level: g.level,
    order_position: g.orderPosition,
    status: g.status,
    calculated_status: g.calculatedStatus,
    status_source: g.statusSource,
    status_override_reason: g.statusOverrideReason,
    status_override_by: g.statusOverrideBy,
    status_override_at: g.statusOverrideAt,
    status_override_expires: g.statusOverrideExpires,
    status_calculation_confidence: g.statusCalculationConfidence,
    status_last_calculated: g.statusLastCalculated,
    overall_progress: g.overallProgress,
    overall_progress_override: g.overallProgressOverride,
    overall_progress_custom_value: g.overallProgressCustomValue,
    overall_progress_display_mode: g.overallProgressDisplayMode,
    overall_progress_source: g.overallProgressSource,
    overall_progress_last_calculated: g.overallProgressLastCalculated,
    overall_progress_override_by: g.overallProgressOverrideBy,
    overall_progress_override_at: g.overallProgressOverrideAt,
    overall_progress_override_reason: g.overallProgressOverrideReason,
    image_url: g.imageUrl,
    header_color: g.headerColor,
    cover_photo_url: g.coverPhotoUrl,
    cover_photo_alt: g.coverPhotoAlt,
    color: g.color,
    show_progress_bar: g.showProgressBar,
    owner_name: g.ownerName,
    department: g.department,
    start_date: g.startDate,
    end_date: g.endDate,
    priority: g.priority,
    executive_summary: g.executiveSummary,
    indicator_text: g.indicatorText,
    indicator_color: g.indicatorColor,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

function metricToSnake(m: Record<string, unknown>) {
  return {
    id: m.id,
    goal_id: m.goalId,
    name: m.name,
    metric_name: m.metricName,
    metric_category: m.metricCategory,
    description: m.description,
    metric_type: m.metricType,
    data_source: m.dataSource,
    current_value: m.currentValue,
    target_value: m.targetValue,
    unit: m.unit,
    status: m.status,
    chart_type: m.chartType,
    display_options: m.displayOptions,
    order_position: m.orderPosition,
    display_width: m.displayWidth,
    display_value: m.displayValue,
    display_label: m.displayLabel,
    display_sublabel: m.displaySublabel,
    visualization_type: m.visualizationType,
    visualization_config: m.visualizationConfig,
    show_target_line: m.showTargetLine,
    show_trend: m.showTrend,
    frequency: m.frequency,
    aggregation_method: m.aggregationMethod,
    decimal_places: m.decimalPlaces,
    is_percentage: m.isPercentage,
    is_higher_better: m.isHigherBetter,
    ytd_value: m.ytdValue,
    eoy_projection: m.eoyProjection,
    last_actual_period: m.lastActualPeriod,
    risk_threshold_critical: m.riskThresholdCritical,
    risk_threshold_warning: m.riskThresholdWarning,
    risk_threshold_off_target: m.riskThresholdOffTarget,
    collection_frequency: m.collectionFrequency,
    baseline_value: m.baselineValue,
    trend_direction: m.trendDirection,
    data_source_details: m.dataSourceDetails,
    last_collected: m.lastCollected,
    measurement_scale: m.measurementScale,
    ytd_change: m.ytdChange,
    period_over_period_change: m.periodOverPeriodChange,
    period_over_period_percent: m.periodOverPeriodPercent,
    calculation_method: m.calculationMethod,
    data_completeness: m.dataCompleteness,
    confidence_level: m.confidenceLevel,
    last_calculated_at: m.lastCalculatedAt,
    calculation_notes: m.calculationNotes,
    is_calculated: m.isCalculated,
    calculation_formula: m.calculationFormula,
    date_range_start: m.dateRangeStart,
    date_range_end: m.dateRangeEnd,
    metric_data_type: m.metricDataType,
    metric_calculation_type: m.metricCalculationType,
    qualitative_mapping: m.qualitativeMapping,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

function extractId(req: Request): string {
  return new URL(req.url).pathname.split("/")[3];
}

// ---------------------------------------------------------------------------
// GET /api/goals/:id/children — Get child goals of a goal
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  try {
    const id = extractId(req);

    // Verify the parent goal exists
    const [parent] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!parent) {
      return jsonError("Goal not found", 404);
    }

    // Access check: allow if org is public, otherwise require org membership
    const lookup = await getOrgSlugForGoal(id);
    if (lookup) {
      const orgIsPublic = await isPublicOrg(lookup.orgId);
      if (!orgIsPublic) {
        await requireOrgMember(req, lookup.orgSlug, "viewer");
      }
    }

    // Fetch children ordered by goalNumber
    const children = await db
      .select()
      .from(goals)
      .where(eq(goals.parentId, id))
      .orderBy(goals.goalNumber);

    // Fetch metrics for all children in one query per child
    const childrenWithMetrics = await Promise.all(
      children.map(async (child) => {
        const childMetrics = await db
          .select()
          .from(metrics)
          .where(eq(metrics.goalId, child.id))
          .orderBy(metrics.orderPosition, metrics.createdAt);

        return {
          ...goalToSnake(child),
          metrics: childMetrics.map(metricToSnake),
        };
      }),
    );

    return jsonOk(childrenWithMetrics);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
