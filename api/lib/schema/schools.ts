import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";

export const schools = pgTable(
  "schools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    logoUrl: varchar("logo_url", { length: 500 }),
    address: varchar("address", { length: 500 }),
    phone: varchar("phone", { length: 20 }),
    principalName: varchar("principal_name", { length: 255 }),
    principalEmail: varchar("principal_email", { length: 255 }),
    studentCount: integer("student_count"),
    isPublic: boolean("is_public").default(false),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    unique("schools_org_slug_unique").on(table.organizationId, table.slug),
    index("schools_organization_id_idx").on(table.organizationId),
    index("schools_is_active_idx").on(table.isActive),
  ],
);
