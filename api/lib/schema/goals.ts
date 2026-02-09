import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  decimal,
  date,
  index,
  jsonb,
  foreignKey,
} from "drizzle-orm/pg-core";
import { plans } from "./plans.js";
import { organizations } from "./organizations.js";
import { schools } from "./schools.js";

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "set null",
    }),
    parentId: uuid("parent_id"),
    goalNumber: varchar("goal_number", { length: 20 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    level: integer("level").notNull().default(0),
    orderPosition: integer("order_position").default(0),
    status: varchar("status", { length: 20 }).default("not_started"),

    // Calculated status fields
    calculatedStatus: varchar("calculated_status", { length: 20 }),
    statusSource: varchar("status_source", { length: 20 }).default(
      "calculated",
    ),
    statusOverrideReason: text("status_override_reason"),
    statusOverrideBy: uuid("status_override_by"),
    statusOverrideAt: timestamp("status_override_at"),
    statusOverrideExpires: timestamp("status_override_expires"),
    statusCalculationConfidence: decimal("status_calculation_confidence", {
      precision: 5,
      scale: 2,
    }),
    statusLastCalculated: timestamp("status_last_calculated"),

    // Overall progress fields
    overallProgress: decimal("overall_progress", { precision: 5, scale: 2 }),
    overallProgressOverride: decimal("overall_progress_override", {
      precision: 5,
      scale: 2,
    }),
    overallProgressCustomValue: varchar("overall_progress_custom_value", {
      length: 50,
    }),
    overallProgressDisplayMode: varchar("overall_progress_display_mode", {
      length: 20,
    }).default("percentage"),
    overallProgressSource: varchar("overall_progress_source", {
      length: 20,
    }).default("calculated"),
    overallProgressLastCalculated: timestamp(
      "overall_progress_last_calculated",
    ),
    overallProgressOverrideBy: uuid("overall_progress_override_by"),
    overallProgressOverrideAt: timestamp("overall_progress_override_at"),
    overallProgressOverrideReason: text("overall_progress_override_reason"),

    // Display fields
    imageUrl: text("image_url"),
    headerColor: varchar("header_color", { length: 7 }),
    coverPhotoUrl: text("cover_photo_url"),
    coverPhotoAlt: text("cover_photo_alt"),
    color: varchar("color", { length: 20 }),
    showProgressBar: boolean("show_progress_bar").default(true),

    // Metadata fields
    ownerName: varchar("owner_name", { length: 255 }),
    department: varchar("department", { length: 255 }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    priority: varchar("priority", { length: 20 }),
    executiveSummary: text("executive_summary"),
    indicatorText: varchar("indicator_text", { length: 50 }),
    indicatorColor: varchar("indicator_color", { length: 7 }).default(
      "#10b981",
    ),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
    index("goals_plan_id_idx").on(table.planId),
    index("goals_parent_id_idx").on(table.parentId),
    index("goals_level_idx").on(table.level),
    index("goals_order_position_idx").on(table.orderPosition),
    index("goals_organization_id_idx").on(table.organizationId),
    index("goals_school_id_idx").on(table.schoolId),
  ],
);

export const metrics = pgTable(
  "metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    metricName: varchar("metric_name", { length: 255 }),
    metricCategory: varchar("metric_category", { length: 50 }).default(
      "other",
    ),
    description: text("description"),
    metricType: varchar("metric_type", { length: 20 }).notNull(),
    dataSource: varchar("data_source", { length: 255 }),
    currentValue: varchar("current_value", { length: 100 }),
    targetValue: varchar("target_value", { length: 100 }),
    unit: varchar("unit", { length: 50 }),
    status: varchar("status", { length: 20 }).default("not_started"),
    chartType: varchar("chart_type", { length: 20 }),
    displayOptions: jsonb("display_options").default({}),
    orderPosition: integer("order_position").default(0),

    // Display fields
    displayWidth: varchar("display_width", { length: 10 }).default("full"),
    displayValue: varchar("display_value", { length: 50 }),
    displayLabel: text("display_label"),
    displaySublabel: text("display_sublabel"),

    // Visualization
    visualizationType: varchar("visualization_type", { length: 50 }).default(
      "auto",
    ),
    visualizationConfig: jsonb("visualization_config"),
    showTargetLine: boolean("show_target_line").default(true),
    showTrend: boolean("show_trend").default(true),

    // Collection & aggregation
    frequency: varchar("frequency", { length: 20 }).default("monthly"),
    aggregationMethod: varchar("aggregation_method", { length: 20 }).default(
      "average",
    ),
    decimalPlaces: integer("decimal_places").default(2),
    isPercentage: boolean("is_percentage").default(false),
    isHigherBetter: boolean("is_higher_better").default(true),

    // Summary values
    ytdValue: decimal("ytd_value", { precision: 10, scale: 2 }),
    eoyProjection: decimal("eoy_projection", { precision: 10, scale: 2 }),
    lastActualPeriod: varchar("last_actual_period", { length: 20 }),

    // Risk thresholds
    riskThresholdCritical: decimal("risk_threshold_critical", {
      precision: 10,
      scale: 2,
    }),
    riskThresholdWarning: decimal("risk_threshold_warning", {
      precision: 10,
      scale: 2,
    }),
    riskThresholdOffTarget: decimal("risk_threshold_off_target", {
      precision: 10,
      scale: 4,
    }),

    // Data collection
    collectionFrequency: varchar("collection_frequency", {
      length: 20,
    }).default("quarterly"),
    baselineValue: decimal("baseline_value", { precision: 10, scale: 4 }),
    trendDirection: varchar("trend_direction", { length: 20 }).default(
      "stable",
    ),
    dataSourceDetails: text("data_source_details"),
    lastCollected: timestamp("last_collected"),
    measurementScale: varchar("measurement_scale", { length: 100 }),

    // Period-over-period
    ytdChange: decimal("ytd_change", { precision: 10, scale: 2 }),
    periodOverPeriodChange: decimal("period_over_period_change", {
      precision: 10,
      scale: 2,
    }),
    periodOverPeriodPercent: decimal("period_over_period_percent", {
      precision: 5,
      scale: 2,
    }),

    // Calculation
    calculationMethod: text("calculation_method"),
    dataCompleteness: decimal("data_completeness", { precision: 5, scale: 2 }),
    confidenceLevel: varchar("confidence_level", { length: 20 }),
    lastCalculatedAt: timestamp("last_calculated_at"),
    calculationNotes: text("calculation_notes"),
    isCalculated: boolean("is_calculated").default(false),
    calculationFormula: text("calculation_formula"),

    // Date range
    dateRangeStart: date("date_range_start"),
    dateRangeEnd: date("date_range_end"),

    // Type classification
    metricDataType: varchar("metric_data_type", { length: 20 }).default(
      "quantitative",
    ),
    metricCalculationType: varchar("metric_calculation_type", {
      length: 50,
    }).default("numeric"),
    qualitativeMapping: jsonb("qualitative_mapping"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("metrics_goal_id_idx").on(table.goalId),
    index("metrics_metric_type_idx").on(table.metricType),
    index("metrics_status_idx").on(table.status),
  ],
);
