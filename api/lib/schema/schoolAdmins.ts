import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { schools } from "./schools.js";

export const schoolAdmins = pgTable(
  "school_admins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    schoolSlug: text("school_slug").notNull(),
    districtSlug: text("district_slug").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    createdBy: uuid("created_by").references(() => user.id),
  },
  (table) => [
    unique("school_admins_user_school_unique").on(
      table.userId,
      table.schoolId,
    ),
    index("school_admins_user_id_idx").on(table.userId),
    index("school_admins_school_id_idx").on(table.schoolId),
  ],
);
