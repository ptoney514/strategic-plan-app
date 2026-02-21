import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  decimal,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { metrics } from "./goals.js";
import { organizations } from "./organizations.js";

export const metricTimeSeries = pgTable(
  "metric_time_series",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metricId: uuid("metric_id")
      .notNull()
      .references(() => metrics.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    period: varchar("period", { length: 20 }).notNull(),
    periodType: varchar("period_type", { length: 20 }).notNull(),
    targetValue: decimal("target_value", { precision: 10, scale: 2 }),
    actualValue: decimal("actual_value", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 20 }),
    notes: text("notes"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("metric_time_series_metric_period_unique").on(
      table.metricId,
      table.period,
    ),
    index("metric_time_series_metric_id_idx").on(table.metricId),
    index("metric_time_series_org_id_idx").on(table.organizationId),
  ],
);
