import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/setup";
import { ObjectiveSection } from "../ObjectiveSection";
import type { HierarchicalGoal } from "@/lib/types";

// Avoid pulling the full chart machinery — it's exercised by Phase 3 tests.
vi.mock("@/views/v2/public/ObjectiveDetailView/ObjectiveHeader", () => ({
  ObjectiveHeader: () => <div data-testid="mock-header" />,
}));
vi.mock("@/views/v2/public/ObjectiveDetailView/ObjectiveDataColumn", () => ({
  ObjectiveDataColumn: () => <div data-testid="mock-data-column" />,
}));

const makeObjective = (goalNumber: string): HierarchicalGoal =>
  ({
    id: `obj-${goalNumber}`,
    district_id: "org-1",
    parent_id: null,
    goal_number: goalNumber,
    title: `Objective ${goalNumber}`,
    description: "desc",
    level: 0,
    status: "on_target",
    order_position: Number(goalNumber),
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    children: [],
  }) as HierarchicalGoal;

describe("ObjectiveSection", () => {
  it("renders a <section> with id='obj-{goal_number}' for nav anchoring", () => {
    const { container } = render(
      <ObjectiveSection
        objective={makeObjective("1")}
        objectiveIndex={0}
        widgets={[]}
      />,
    );
    expect(container.querySelector("section#obj-1")).toBeInTheDocument();
  });

  it("renders a zero-padded watermark based on objectiveIndex", () => {
    render(
      <ObjectiveSection
        objective={makeObjective("3")}
        objectiveIndex={3}
        widgets={[]}
      />,
    );
    expect(screen.getByTestId("objective-watermark")).toHaveTextContent("04");
  });

  it("delegates content rendering to the Phase 3 header + data column", () => {
    render(
      <ObjectiveSection
        objective={makeObjective("2")}
        objectiveIndex={1}
        widgets={[]}
      />,
    );
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-data-column")).toBeInTheDocument();
  });
});
