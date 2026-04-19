import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  decimal,
  jsonb,
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

    // v4 public dashboard fields (design.md §6.2, §5.13)
    // narrative: expanded-row callout paragraph (any level)
    // pullQuoteText/Attribution: per-objective pull quote (level 0)
    // highlightStats: 3-up stat callouts under the left narrative column (level 0)
    //   shape: [{ label: string, value: string | number, unit?: string }, ...]
    // signatureWidgetId: FK to the widget to render as the §5.7 signature metric card (level 0)
    narrative: text("narrative"),
    pullQuoteText: text("pull_quote_text"),
    pullQuoteAttribution: varchar("pull_quote_attribution", { length: 255 }),
    highlightStats: jsonb("highlight_stats"),
    signatureWidgetId: uuid("signature_widget_id"),

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
