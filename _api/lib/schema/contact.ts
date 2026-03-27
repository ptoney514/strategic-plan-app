import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    organization: varchar("organization", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    topic: varchar("topic", { length: 100 }),
    message: text("message").notNull(),
    status: varchar("status", { length: 20 }).default("new"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("contact_submissions_status_idx").on(table.status),
    index("contact_submissions_created_at_idx").on(table.createdAt),
  ],
);
