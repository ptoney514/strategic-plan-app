/**
 * Tests for cross-session integrity guards in import stage + execute endpoints.
 *
 * 1. POST /stage rejects a staged_goal_id that belongs to a different session
 * 2. POST /stage accepts a staged_goal_id that belongs to the current session
 * 3. POST /execute scopes the staged-metrics query to the current session
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock DB factory — each db.select() / db.insert() / db.update() returns a
// fresh, independent chainable so sequential calls don't interfere.
// ---------------------------------------------------------------------------

interface MockDbConfig {
  selectResults: unknown[][];
  insertResults?: unknown[][];
  updateResults?: unknown[];
}

function createMockDb(config: MockDbConfig) {
  let selectIdx = 0;
  let insertIdx = 0;
  let updateIdx = 0;
  const whereCalls: { type: string; idx: number; args: unknown[] }[] = [];

  function makeSelectChain() {
    const idx = selectIdx++;
    const result = config.selectResults[idx] ?? [];
    const chain: Record<string, unknown> = {};
    chain.from = vi.fn(() => chain);
    chain.where = vi.fn((...args: unknown[]) => {
      whereCalls.push({ type: "select", idx, args });
      return chain;
    });
    chain.limit = vi.fn(() => Promise.resolve(result));
    chain.orderBy = vi.fn(() => Promise.resolve(result));
    chain.innerJoin = vi.fn(() => chain);
    // Thenable — for `await db.select().from(x).where(y)` with no .limit()
    chain.then = (
      resolve: (v: unknown) => void,
      reject?: (e: unknown) => void,
    ) => Promise.resolve(result).then(resolve, reject);
    return chain;
  }

  function makeInsertChain() {
    const idx = insertIdx++;
    const result = (config.insertResults ?? [])[idx] ?? [];
    const chain: Record<string, unknown> = {};
    chain.values = vi.fn(() => chain);
    chain.returning = vi.fn(() => Promise.resolve(result));
    // Thenable — for inserts without .returning()
    chain.then = (
      resolve: (v: unknown) => void,
      reject?: (e: unknown) => void,
    ) => Promise.resolve(result).then(resolve, reject);
    return chain;
  }

  function makeUpdateChain() {
    const idx = updateIdx++;
    const result = (config.updateResults ?? [])[idx];
    const chain: Record<string, unknown> = {};
    chain.set = vi.fn(() => chain);
    chain.where = vi.fn((...args: unknown[]) => {
      whereCalls.push({ type: "update", idx, args });
      return Promise.resolve(result);
    });
    return chain;
  }

  return {
    db: {
      select: vi.fn(() => makeSelectChain()),
      insert: vi.fn(() => makeInsertChain()),
      update: vi.fn(() => makeUpdateChain()),
    },
    whereCalls,
  };
}

// ---------------------------------------------------------------------------
// Module mocks — set up before importing handlers
// ---------------------------------------------------------------------------

let activeMock: ReturnType<typeof createMockDb>;

vi.mock("../../lib/db", () => ({
  get db() {
    return activeMock.db;
  },
}));

vi.mock("../../lib/middleware/auth", () => ({
  requireOrgMember: vi.fn(),
  requireAuth: vi.fn(),
}));

const { POST: stagePost } = await import("../sessions/[id]/stage");
const { POST: executePost } = await import("../sessions/[id]/execute");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(path: string, body: Record<string, unknown>): Request {
  return new Request(`https://app.test${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readJson(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

const SESSION_ID = "sess-aaa";
const ORG_ID = "org-111";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Import session integrity guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. Stage: cross-session staged_goal_id rejection
  // =========================================================================
  describe("POST /stage — staged_goal_id validation", () => {
    it("rejects a staged_goal_id that does not belong to the current session", async () => {
      const foreignGoalId = "staged-goal-from-other-session";

      activeMock = createMockDb({
        selectResults: [
          // 1: session lookup
          [{ id: SESSION_ID, organizationId: ORG_ID }],
          // 2: org slug lookup
          [{ slug: "test-org" }],
          // 3: staged goal ownership check → NOT found
          [],
        ],
      });

      const req = makeRequest(
        `/api/imports/sessions/${SESSION_ID}/stage`,
        {
          goals: [],
          metrics: [{ staged_goal_id: foreignGoalId, metric_name: "Sneaky" }],
        },
      );

      const res = await stagePost(req);
      const body = await readJson(res);

      expect(res.status).toBe(400);
      expect(body.error).toContain(foreignGoalId);
      expect(body.error).toContain("does not belong to this session");
    });

    it("accepts a staged_goal_id that belongs to the current session", async () => {
      activeMock = createMockDb({
        selectResults: [
          // 1: session lookup
          [{ id: SESSION_ID, organizationId: ORG_ID }],
          // 2: org slug lookup
          [{ slug: "test-org" }],
          // 3: staged goal ownership check → found
          [{ id: "sg-valid" }],
        ],
        insertResults: [
          // 1: staged metrics insert (no .returning() but thenable)
          [],
        ],
        updateResults: [
          // 1: session status update
          undefined,
        ],
      });

      const req = makeRequest(
        `/api/imports/sessions/${SESSION_ID}/stage`,
        {
          goals: [],
          metrics: [{ staged_goal_id: "sg-valid", metric_name: "Valid" }],
        },
      );

      const res = await stagePost(req);
      const body = await readJson(res);

      expect(res.status).toBe(200);
      expect(body).toEqual({ goals_count: 0, metrics_count: 1 });
    });
  });

  // =========================================================================
  // 2. Execute: session-scoped metric query
  // =========================================================================
  describe("POST /execute — session-scoped metric query", () => {
    it("scopes the staged metrics query to the current session", async () => {
      const stagedGoal = {
        id: "sg-1",
        importSessionId: SESSION_ID,
        action: "create",
        title: "Goal 1",
        goalNumber: "1.0",
        level: 0,
        parsedHierarchy: null,
        ownerName: null,
        department: null,
        description: null,
        rowNumber: 1,
      };

      activeMock = createMockDb({
        selectResults: [
          // 1: session lookup
          [{ id: SESSION_ID, organizationId: ORG_ID }],
          // 2: org slug lookup
          [{ slug: "test-org" }],
          // 3: plan verification (plan_id in body)
          [{ orgId: ORG_ID }],
          // 4: staged goals fetch (resolved via .orderBy)
          [stagedGoal],
          // 5: staged metrics for sg-1 (the query under test)
          [],
        ],
        insertResults: [
          // 1: goal insert
          [{ id: "created-goal-1" }],
        ],
        updateResults: [
          // 1: session status update
          undefined,
        ],
      });

      const req = makeRequest(
        `/api/imports/sessions/${SESSION_ID}/execute`,
        { plan_id: "plan-1" },
      );

      const res = await executePost(req);
      const body = await readJson(res);

      expect(res.status).toBe(200);
      expect(body).toEqual({ goals_created: 1, metrics_created: 0 });

      // Verify the staged-metrics where() call (select index 4) used an
      // `and(...)` expression — meaning two conditions, not just stagedGoalId.
      // Drizzle's and() returns a SQL node wrapping its children.
      const metricsWhere = activeMock.whereCalls.find(
        (c) => c.type === "select" && c.idx === 4,
      );
      expect(metricsWhere).toBeDefined();

      // The arg to where() is `and(eq(stagedMetrics.stagedGoalId, ...), eq(stagedMetrics.importSessionId, ...))`
      // Drizzle's `and()` returns a SQL object with a `queryChunks` array
      // holding both eq expressions. Verify it's present (not undefined/null).
      const andExpr = metricsWhere!.args[0] as Record<string, unknown>;
      expect(andExpr).toBeDefined();
      // Drizzle `and()` produces an object with queryChunks containing child expressions
      expect(andExpr).toHaveProperty("queryChunks");
      const chunks = andExpr.queryChunks as unknown[];
      // `and(a, b)` produces chunks: [a, ' and ', b] — at least 3 elements
      expect(chunks.length).toBeGreaterThanOrEqual(3);
    });
  });
});
