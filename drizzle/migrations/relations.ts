import { relations } from "drizzle-orm/relations";
import { user, session, account, organizations, organizationMembers, plans, widgets, goals, organizationInvitations, importSessions, stagedGoals } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	organizationMembers_userId: many(organizationMembers, {
		relationName: "organizationMembers_userId_user_id"
	}),
	organizationMembers_invitedBy: many(organizationMembers, {
		relationName: "organizationMembers_invitedBy_user_id"
	}),
	organizations: many(organizations),
	organizationInvitations: many(organizationInvitations),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const organizationMembersRelations = relations(organizationMembers, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationMembers.organizationId],
		references: [organizations.id]
	}),
	user_userId: one(user, {
		fields: [organizationMembers.userId],
		references: [user.id],
		relationName: "organizationMembers_userId_user_id"
	}),
	user_invitedBy: one(user, {
		fields: [organizationMembers.invitedBy],
		references: [user.id],
		relationName: "organizationMembers_invitedBy_user_id"
	}),
}));

export const organizationsRelations = relations(organizations, ({one, many}) => ({
	organizationMembers: many(organizationMembers),
	user: one(user, {
		fields: [organizations.createdBy],
		references: [user.id]
	}),
	plans: many(plans),
	widgets: many(widgets),
	goals: many(goals),
	organizationInvitations: many(organizationInvitations),
	importSessions: many(importSessions),
}));

export const plansRelations = relations(plans, ({one, many}) => ({
	organization: one(organizations, {
		fields: [plans.organizationId],
		references: [organizations.id]
	}),
	widgets: many(widgets),
	goals: many(goals),
}));

export const widgetsRelations = relations(widgets, ({one}) => ({
	organization: one(organizations, {
		fields: [widgets.organizationId],
		references: [organizations.id]
	}),
	plan: one(plans, {
		fields: [widgets.planId],
		references: [plans.id]
	}),
	goal: one(goals, {
		fields: [widgets.goalId],
		references: [goals.id]
	}),
}));

export const goalsRelations = relations(goals, ({one, many}) => ({
	widgets: many(widgets),
	plan: one(plans, {
		fields: [goals.planId],
		references: [plans.id]
	}),
	goal: one(goals, {
		fields: [goals.parentId],
		references: [goals.id],
		relationName: "goals_parentId_goals_id"
	}),
	goals: many(goals, {
		relationName: "goals_parentId_goals_id"
	}),
	organization: one(organizations, {
		fields: [goals.organizationId],
		references: [organizations.id]
	}),
	stagedGoals: many(stagedGoals),
}));

export const organizationInvitationsRelations = relations(organizationInvitations, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationInvitations.organizationId],
		references: [organizations.id]
	}),
	user: one(user, {
		fields: [organizationInvitations.invitedBy],
		references: [user.id]
	}),
}));

export const stagedGoalsRelations = relations(stagedGoals, ({one}) => ({
	importSession: one(importSessions, {
		fields: [stagedGoals.importSessionId],
		references: [importSessions.id]
	}),
	goal: one(goals, {
		fields: [stagedGoals.mappedToGoalId],
		references: [goals.id]
	}),
}));

export const importSessionsRelations = relations(importSessions, ({one, many}) => ({
	stagedGoals: many(stagedGoals),
	organization: one(organizations, {
		fields: [importSessions.organizationId],
		references: [organizations.id]
	}),
}));