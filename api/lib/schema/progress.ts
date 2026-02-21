import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { goals } from "./goals.js";

export const statusOverrides = pgTable(
  "status_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    previousStatus: varchar("previous_status", { length: 20 }),
    newStatus: varchar("new_status", { length: 20 }).notNull(),
    calculatedStatus: varchar("calculated_status", { length: 20 }),
    overrideReason: text("override_reason").notNull(),
    overrideCategory: varchar("override_category", { length: 50 }),
    evidenceUrls: text("evidence_urls")
      .array()
      .default(sql`'{}'::text[]`),
    createdBy: uuid("created_by").notNull(),
    createdByName: varchar("created_by_name", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    reviewOutcome: varchar("review_outcome", { length: 50 }),
    reviewNotes: text("review_notes"),
  },
  (table) => [
    index("status_overrides_goal_id_idx").on(table.goalId),
    index("status_overrides_created_by_idx").on(table.createdBy),
  ],
);
