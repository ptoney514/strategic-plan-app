import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    entityType: varchar("entity_type", { length: 20 }).notNull(),
    entityLabel: varchar("entity_label", { length: 50 }).default("Organization"),
    logoUrl: varchar("logo_url", { length: 500 }),
    primaryColor: varchar("primary_color", { length: 7 }).default("#8B1F3A"),
    secondaryColor: varchar("secondary_color", { length: 7 }).default("#E31837"),
    settings: jsonb("settings").default({}),
    adminEmail: varchar("admin_email", { length: 255 }),
    tagline: text("tagline"),
    dashboardTemplate: varchar("dashboard_template", { length: 50 }).default(
      "hierarchical",
    ),
    dashboardConfig: jsonb("dashboard_config").default({}),
    isPublic: boolean("is_public").default(false),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("organizations_slug_idx").on(table.slug),
    index("organizations_entity_type_idx").on(table.entityType),
    index("organizations_is_active_idx").on(table.isActive),
  ],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull().default("viewer"),
    invitedBy: uuid("invited_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    unique("organization_members_org_user_unique").on(
      table.organizationId,
      table.userId,
    ),
    index("organization_members_user_id_idx").on(table.userId),
    index("organization_members_org_id_idx").on(table.organizationId),
    index("organization_members_role_idx").on(table.role),
  ],
);

export const organizationInvitations = pgTable(
  "organization_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("viewer"),
    token: varchar("token", { length: 100 }).unique().notNull(),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => user.id),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("organization_invitations_token_idx").on(table.token),
    index("organization_invitations_email_idx").on(table.email),
    index("organization_invitations_org_id_idx").on(table.organizationId),
  ],
);
