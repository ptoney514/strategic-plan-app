import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";

export const stockPhotos = pgTable(
  "stock_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    altText: text("alt_text").notNull(),
    category: varchar("category", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("stock_photos_category_idx").on(table.category)],
);
