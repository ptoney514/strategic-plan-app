/**
 * Tests for import stage + execute endpoints.
 *
 * 1. POST /stage stages goals and returns count
 * 2. POST /execute creates production goals from staged data
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

  function makeSelectChain() {
    const idx = selectIdx++;
    const result = config.selectResults[idx] ?? [];
    const chain: Record<string, unknown> = {};
    chain.from = vi.fn(() => chain);
    chain.where = vi.fn(() => chain);
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
    chain.where = vi.fn(() => Promise.resolve(result));
    return chain;
  }

  return {
    db: {
      select: vi.fn(() => makeSelectChain()),
      insert: vi.fn(() => makeInsertChain()),
      update: vi.fn(() => makeUpdateChain()),
    },
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

describe("Import session integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. Stage: stages goals and returns count
  // =========================================================================
  describe("POST /stage — goal staging", () => {
    it("stages goals and returns the count", async () => {
      activeMock = createMockDb({
        selectResults: [
          // 1: session lookup
          [{ id: SESSION_ID, organizationId: ORG_ID }],
          // 2: org slug lookup
          [{ slug: "test-org" }],
        ],
        insertResults: [
          // 1: staged goals insert
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
          goals: [
            { title: "Goal 1", goal_number: "1.0", level: 0 },
            { title: "Goal 2", goal_number: "1.1", level: 1 },
          ],
        },
      );

      const res = await stagePost(req);
      const body = await readJson(res);

      expect(res.status).toBe(200);
      expect(body).toEqual({ goals_count: 2 });
    });
  });

  // =========================================================================
  // 2. Execute: creates production goals
  // =========================================================================
  describe("POST /execute — goal creation", () => {
    it("creates production goals from staged data", async () => {
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
      expect(body).toEqual({ goals_created: 1 });
    });
  });
});
