import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  index,
  jsonb,
  foreignKey,
} from "drizzle-orm/pg-core";
import { plans } from "./plans";

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    goalNumber: varchar("goal_number", { length: 20 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    level: integer("level").notNull().default(0),
    orderPosition: integer("order_position").default(0),
    status: varchar("status", { length: 20 }).default("not_started"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
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
    metricType: varchar("metric_type", { length: 20 }).notNull(),
    dataSource: varchar("data_source", { length: 255 }),
    currentValue: varchar("current_value", { length: 100 }),
    targetValue: varchar("target_value", { length: 100 }),
    unit: varchar("unit", { length: 50 }),
    status: varchar("status", { length: 20 }).default("not_started"),
    chartType: varchar("chart_type", { length: 20 }),
    displayOptions: jsonb("display_options").default({}),
    orderPosition: integer("order_position").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("metrics_goal_id_idx").on(table.goalId),
    index("metrics_metric_type_idx").on(table.metricType),
    index("metrics_status_idx").on(table.status),
  ],
);
