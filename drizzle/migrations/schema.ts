import { pgTable, index, uuid, varchar, text, timestamp, foreignKey, unique, jsonb, boolean, date, integer, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const contactSubmissions = pgTable("contact_submissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	organization: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	topic: varchar({ length: 100 }),
	message: text().notNull(),
	status: varchar({ length: 20 }).default('new'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("contact_submissions_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("contact_submissions_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const session = pgTable("session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: varchar("user_agent", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const account = pgTable("account", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	providerId: varchar("provider_id", { length: 50 }).notNull(),
	accountId: varchar("account_id", { length: 255 }).notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	idToken: text("id_token"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const organizationMembers = pgTable("organization_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: varchar({ length: 20 }).default('viewer').notNull(),
	invitedBy: uuid("invited_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("organization_members_org_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("organization_members_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("organization_members_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "organization_members_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "organization_members_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [user.id],
			name: "organization_members_invited_by_user_id_fk"
		}),
	unique("organization_members_org_user_unique").on(table.organizationId, table.userId),
]);

export const organizations = pgTable("organizations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 20 }).notNull(),
	entityLabel: varchar("entity_label", { length: 50 }).default('Organization'),
	logoUrl: varchar("logo_url", { length: 500 }),
	primaryColor: varchar("primary_color", { length: 7 }).default('#8B1F3A'),
	secondaryColor: varchar("secondary_color", { length: 7 }).default('#E31837'),
	settings: jsonb().default({}),
	isPublic: boolean("is_public").default(false),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	adminEmail: varchar("admin_email", { length: 255 }),
	tagline: text(),
	dashboardTemplate: varchar("dashboard_template", { length: 50 }).default('hierarchical'),
	dashboardConfig: jsonb("dashboard_config").default({}),
	onboardingCompleted: boolean("onboarding_completed").default(false),
	templateMode: varchar("template_mode", { length: 50 }).default('hierarchical'),
	createdBy: uuid("created_by"),
}, (table) => [
	index("organizations_entity_type_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops")),
	index("organizations_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("organizations_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "organizations_created_by_user_id_fk"
		}),
	unique("organizations_slug_unique").on(table.slug),
]);

export const plans = pgTable("plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	typeLabel: varchar("type_label", { length: 100 }).default('Strategic Plan'),
	description: text(),
	coverImageUrl: varchar("cover_image_url", { length: 500 }),
	isPublic: boolean("is_public").default(false),
	isActive: boolean("is_active").default(true),
	startDate: date("start_date"),
	endDate: date("end_date"),
	orderPosition: integer("order_position").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("plans_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("plans_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "plans_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const widgets = pgTable("widgets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	planId: uuid("plan_id"),
	type: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	subtitle: varchar({ length: 255 }),
	config: jsonb().default({}),
	position: integer().default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	goalId: uuid("goal_id"),
}, (table) => [
	index("widgets_goal_id_idx").using("btree", table.goalId.asc().nullsLast().op("uuid_ops")),
	index("widgets_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("widgets_org_position_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.position.asc().nullsLast().op("int4_ops")),
	index("widgets_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("widgets_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "widgets_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "widgets_plan_id_plans_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.goalId],
			foreignColumns: [goals.id],
			name: "widgets_goal_id_goals_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: varchar({ length: 255 }).notNull(),
	value: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: boolean("email_verified").default(false),
	name: varchar({ length: 255 }),
	image: varchar({ length: 500 }),
	isSystemAdmin: boolean("is_system_admin").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const goals = pgTable("goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	planId: uuid("plan_id").notNull(),
	parentId: uuid("parent_id"),
	goalNumber: varchar("goal_number", { length: 20 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	level: integer().default(0).notNull(),
	orderPosition: integer("order_position").default(0),
	status: varchar({ length: 20 }).default('not_started'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	organizationId: uuid("organization_id"),
	overallProgress: numeric("overall_progress", { precision: 5, scale:  2 }),
	overallProgressDisplayMode: varchar("overall_progress_display_mode", { length: 20 }).default('percentage'),
	ownerName: varchar("owner_name", { length: 255 }),
	priority: varchar({ length: 20 }),
}, (table) => [
	index("goals_level_idx").using("btree", table.level.asc().nullsLast().op("int4_ops")),
	index("goals_order_position_idx").using("btree", table.orderPosition.asc().nullsLast().op("int4_ops")),
	index("goals_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("goals_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("uuid_ops")),
	index("goals_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("uuid_ops")),
	index("goals_plan_level_idx").using("btree", table.planId.asc().nullsLast().op("int4_ops"), table.level.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "goals_plan_id_plans_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "goals_parent_id_goals_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "goals_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const organizationInvitations = pgTable("organization_invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 20 }).default('viewer').notNull(),
	token: varchar({ length: 100 }).notNull(),
	invitedBy: uuid("invited_by").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("organization_invitations_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("organization_invitations_org_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("organization_invitations_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "organization_invitations_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [user.id],
			name: "organization_invitations_invited_by_user_id_fk"
		}),
	unique("organization_invitations_token_unique").on(table.token),
]);

export const stagedGoals = pgTable("staged_goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	importSessionId: uuid("import_session_id").notNull(),
	rowNumber: integer("row_number").notNull(),
	rawData: jsonb("raw_data").notNull(),
	parsedHierarchy: text("parsed_hierarchy"),
	goalNumber: text("goal_number"),
	title: text(),
	description: text(),
	level: integer(),
	ownerName: text("owner_name"),
	department: text(),
	validationStatus: text("validation_status").default('valid'),
	validationMessages: text("validation_messages").array().default([""]),
	isMapped: boolean("is_mapped").default(false),
	mappedToGoalId: uuid("mapped_to_goal_id"),
	action: text().default('create'),
	isAutoGenerated: boolean("is_auto_generated").default(false),
	autoFixSuggestions: jsonb("auto_fix_suggestions").default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("staged_goals_session_id_idx").using("btree", table.importSessionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.importSessionId],
			foreignColumns: [importSessions.id],
			name: "staged_goals_import_session_id_import_sessions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mappedToGoalId],
			foreignColumns: [goals.id],
			name: "staged_goals_mapped_to_goal_id_goals_id_fk"
		}).onDelete("set null"),
]);

export const importSessions = pgTable("import_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	filename: text().notNull(),
	fileSize: integer("file_size"),
	status: text().default('uploaded'),
	uploadedBy: text("uploaded_by"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	errorMessage: text("error_message"),
	importSummary: jsonb("import_summary"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("import_sessions_org_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("import_sessions_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "import_sessions_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);
