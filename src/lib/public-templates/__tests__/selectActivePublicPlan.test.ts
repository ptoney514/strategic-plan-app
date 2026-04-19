import { describe, it, expect } from "vitest";
import { selectActivePublicPlan } from "../selectActivePublicPlan";
import type { Plan } from "../../types";

function makePlan(overrides: Partial<Plan>): Plan {
  return {
    id: "plan-id",
    district_id: "org-id",
    name: "Test Plan",
    slug: "test-plan",
    is_public: true,
    is_active: true,
    order_position: 0,
    public_template: "sidebar-tree",
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("selectActivePublicPlan", () => {
  it("returns null when given no plans", () => {
    expect(selectActivePublicPlan(undefined)).toBeNull();
    expect(selectActivePublicPlan([])).toBeNull();
  });

  it("returns null when no plan is both active AND public", () => {
    const plans = [
      makePlan({ id: "p1", is_active: true, is_public: false }),
      makePlan({ id: "p2", is_active: false, is_public: true }),
    ];
    expect(selectActivePublicPlan(plans)).toBeNull();
  });

  it("returns the single plan that is both active and public", () => {
    const plans = [
      makePlan({ id: "draft", is_active: false, is_public: false }),
      makePlan({ id: "live", is_active: true, is_public: true }),
    ];
    expect(selectActivePublicPlan(plans)?.id).toBe("live");
  });

  it("returns the first active+public plan when multiple qualify", () => {
    // Ties broken by array order — the calling code is responsible for
    // ordering plans by order_position before passing them in.
    const plans = [
      makePlan({ id: "first", is_active: true, is_public: true }),
      makePlan({ id: "second", is_active: true, is_public: true }),
    ];
    expect(selectActivePublicPlan(plans)?.id).toBe("first");
  });
});
