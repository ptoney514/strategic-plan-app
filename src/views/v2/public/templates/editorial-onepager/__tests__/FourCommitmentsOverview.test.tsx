import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { FourCommitmentsOverview } from "../FourCommitmentsOverview";
import type { HierarchicalGoal } from "@/lib/types";

const makeObjective = (
  goalNumber: string,
  title: string,
  status: HierarchicalGoal["status"] = "on_target",
): HierarchicalGoal =>
  ({
    id: `obj-${goalNumber}`,
    district_id: "org-1",
    parent_id: null,
    goal_number: goalNumber,
    title,
    description: "desc",
    level: 0,
    status,
    order_position: Number(goalNumber),
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    children: [],
  }) as HierarchicalGoal;

const FOUR_OBJECTIVES: HierarchicalGoal[] = [
  makeObjective("1", "Student Achievement"),
  makeObjective("2", "Supported Staff"),
  makeObjective("3", "Community"),
  makeObjective("4", "Operations", "off_track"),
];

describe("FourCommitmentsOverview", () => {
  it("renders the section heading from the fourCommitments fixture", () => {
    render(
      <FourCommitmentsOverview
        objectives={FOUR_OBJECTIVES}
        heading={{ headingPrefix: "Four areas.", headingEmphasis: "One plan." }}
      />,
    );
    expect(screen.getByText(/Four areas\./)).toBeInTheDocument();
    expect(screen.getByText(/One plan\./)).toBeInTheDocument();
  });

  it("renders one anchor per objective linked to #obj-{goal_number}", () => {
    render(
      <FourCommitmentsOverview
        objectives={FOUR_OBJECTIVES}
        heading={{ headingPrefix: "Four areas.", headingEmphasis: "One plan." }}
      />,
    );
    for (const obj of FOUR_OBJECTIVES) {
      const link = screen.getByRole("link", { name: new RegExp(obj.title) });
      expect(link).toHaveAttribute("href", `#obj-${obj.goal_number}`);
    }
  });

  it("displays the objective title in each column", () => {
    render(
      <FourCommitmentsOverview
        objectives={FOUR_OBJECTIVES}
        heading={{ headingPrefix: "Four areas.", headingEmphasis: "One plan." }}
      />,
    );
    expect(screen.getByText("Student Achievement")).toBeInTheDocument();
    expect(screen.getByText("Operations")).toBeInTheDocument();
  });

  it("renders at most four columns even if more objectives are passed", () => {
    const five = [
      ...FOUR_OBJECTIVES,
      makeObjective("5", "Fifth Objective"),
    ];
    render(
      <FourCommitmentsOverview
        objectives={five}
        heading={{ headingPrefix: "Four areas.", headingEmphasis: "One plan." }}
      />,
    );
    expect(
      screen.queryByText("Fifth Objective"),
    ).not.toBeInTheDocument();
  });
});
