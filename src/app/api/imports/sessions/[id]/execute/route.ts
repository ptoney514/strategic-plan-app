import { eq, asc } from "drizzle-orm";
import { db } from "@api/lib/db";
import {
  importSessions,
  stagedGoals,
  goals,
  plans,
  organizations,
} from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { jsonOk, jsonError } from "@api/lib/response";

/**
 * POST /api/imports/sessions/[id]/execute
 * Execute import (move staged data to production). Requires auth + org membership.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: sessionId } = await params;

    const [session] = await db
      .select()
      .from(importSessions)
      .where(eq(importSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return jsonError("Import session not found", 404);
    }

    // Look up org slug for membership check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, session.organizationId))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "editor");

    // Determine the plan_id: from request body, or fall back to first active plan
    let planId: string | null = null;
    try {
      const body = await req.json();
      planId = body.plan_id ?? null;
    } catch {
      // No body or invalid JSON — that's fine, we'll look up a plan
    }

    // Verify plan belongs to the same organization as the import session
    if (planId) {
      const [plan] = await db
        .select({ orgId: plans.organizationId })
        .from(plans)
        .where(eq(plans.id, planId))
        .limit(1);
      if (!plan || plan.orgId !== session.organizationId) {
        return jsonError("Plan does not belong to this organization", 400);
      }
    }

    if (!planId) {
      const [activePlan] = await db
        .select({ id: plans.id })
        .from(plans)
        .where(eq(plans.organizationId, session.organizationId))
        .orderBy(asc(plans.createdAt))
        .limit(1);

      if (!activePlan) {
        return jsonError("No plan found for this organization. Create a plan first.", 400);
      }
      planId = activePlan.id;
    }

    // Get all staged goals ordered by level (parents first)
    const staged = await db
      .select()
      .from(stagedGoals)
      .where(eq(stagedGoals.importSessionId, sessionId))
      .orderBy(asc(stagedGoals.level), asc(stagedGoals.rowNumber));

    // Map staged goal IDs to created goal IDs for parent-child resolution
    const stagedIdToGoalId = new Map<string, string>();
    let goalsCreated = 0;

    for (const sg of staged) {
      if (sg.action !== "create") continue;
      if (!sg.title || !sg.goalNumber) continue;

      let parentId: string | null = null;
      if (sg.parsedHierarchy) {
        const parentStaged = staged.find(
          (p) => p.goalNumber === sg.parsedHierarchy && p.id !== sg.id,
        );
        if (parentStaged && stagedIdToGoalId.has(parentStaged.id)) {
          parentId = stagedIdToGoalId.get(parentStaged.id)!;
        }
      }

      const [created] = await db
        .insert(goals)
        .values({
          planId,
          organizationId: session.organizationId,
          goalNumber: sg.goalNumber,
          title: sg.title,
          description: sg.description,
          level: sg.level ?? 0,
          parentId,
          ownerName: sg.ownerName,
        })
        .returning();

      stagedIdToGoalId.set(sg.id, created.id);
      goalsCreated++;
    }

    // Update session status to 'completed'
    await db
      .update(importSessions)
      .set({
        status: "completed",
        completedAt: new Date(),
        importSummary: { goals_created: goalsCreated },
      })
      .where(eq(importSessions.id, sessionId));

    return jsonOk({
      goals_created: goalsCreated,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
