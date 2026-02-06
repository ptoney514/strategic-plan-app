import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { isNull, isNotNull } from "drizzle-orm";
import { organizations } from "./organizations";
import { schools } from "./schools";

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    typeLabel: varchar("type_label", { length: 100 }).default("Strategic Plan"),
    description: text("description"),
    coverImageUrl: varchar("cover_image_url", { length: 500 }),
    isPublic: boolean("is_public").default(false),
    isActive: boolean("is_active").default(true),
    startDate: date("start_date"),
    endDate: date("end_date"),
    orderPosition: integer("order_position").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("plans_org_slug_idx")
      .on(table.organizationId, table.slug)
      .where(isNull(table.schoolId)),
    uniqueIndex("plans_school_slug_idx")
      .on(table.schoolId, table.slug)
      .where(isNotNull(table.schoolId)),
    index("plans_organization_id_idx").on(table.organizationId),
    index("plans_school_id_idx").on(table.schoolId),
    index("plans_is_active_idx").on(table.isActive),
  ],
);
