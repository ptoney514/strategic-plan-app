import { eq } from "drizzle-orm";
import { db } from "../db.js";
import {
  goals,
  importSessions,
  plans,
  organizations,
} from "../schema/index.js";

/**
 * Look up the organization for a goal via goal → plan → organization.
 */
export async function getOrgSlugForGoal(goalId: string) {
  const [row] = await db
    .select({
      goalId: goals.id,
      planId: plans.id,
      orgId: organizations.id,
      orgSlug: organizations.slug,
    })
    .from(goals)
    .innerJoin(plans, eq(goals.planId, plans.id))
    .innerJoin(organizations, eq(plans.organizationId, organizations.id))
    .where(eq(goals.id, goalId))
    .limit(1);

  return row ?? null;
}

/**
 * Look up the organization for a plan via plan → organization.
 */
export async function getOrgSlugForPlan(planId: string) {
  const [row] = await db
    .select({
      planId: plans.id,
      orgId: organizations.id,
      orgSlug: organizations.slug,
    })
    .from(plans)
    .innerJoin(organizations, eq(plans.organizationId, organizations.id))
    .where(eq(plans.id, planId))
    .limit(1);

  return row ?? null;
}

/**
 * Look up the organization for an import session via importSessions → organizations.
 */
export async function getOrgSlugForImportSession(sessionId: string) {
  const [row] = await db
    .select({
      sessionId: importSessions.id,
      orgId: organizations.id,
      orgSlug: organizations.slug,
    })
    .from(importSessions)
    .innerJoin(
      organizations,
      eq(importSessions.organizationId, organizations.id),
    )
    .where(eq(importSessions.id, sessionId))
    .limit(1);

  return row ?? null;
}

/**
 * Check whether an organization is public by its ID.
 */
export async function isPublicOrg(orgId: string): Promise<boolean> {
  const [row] = await db
    .select({ isPublic: organizations.isPublic })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return row?.isPublic === true;
}
