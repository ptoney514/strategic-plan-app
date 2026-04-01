import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { plans } from "./plans.js";
import { goals } from "./goals.js";

export const widgets = pgTable(
  "widgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").references(() => plans.id, {
      onDelete: "set null",
    }),
    goalId: uuid("goal_id").references(() => goals.id, {
      onDelete: "cascade",
    }),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    config: jsonb("config").default({}),
    position: integer("position").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("widgets_organization_id_idx").on(table.organizationId),
    index("widgets_plan_id_idx").on(table.planId),
    index("widgets_goal_id_idx").on(table.goalId),
    index("widgets_org_position_idx").on(table.organizationId, table.position),
    index("widgets_is_active_idx").on(table.isActive),
  ],
);
