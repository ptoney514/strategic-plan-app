import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  decimal,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { plans } from "./plans.js";
import { organizations } from "./organizations.js";

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
    parentId: uuid("parent_id"),
    goalNumber: varchar("goal_number", { length: 20 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    level: integer("level").notNull().default(0),
    orderPosition: integer("order_position").default(0),
    status: varchar("status", { length: 20 }).default("not_started"),

    // Overall progress fields
    overallProgress: decimal("overall_progress", { precision: 5, scale: 2 }),
    overallProgressDisplayMode: varchar("overall_progress_display_mode", {
      length: 20,
    }).default("percentage"),

    // Metadata fields
    ownerName: varchar("owner_name", { length: 255 }),
    priority: varchar("priority", { length: 20 }),

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
    index("goals_plan_level_idx").on(table.planId, table.level),
    index("goals_parent_id_idx").on(table.parentId),
    index("goals_level_idx").on(table.level),
    index("goals_order_position_idx").on(table.orderPosition),
    index("goals_organization_id_idx").on(table.organizationId),
  ],
);
