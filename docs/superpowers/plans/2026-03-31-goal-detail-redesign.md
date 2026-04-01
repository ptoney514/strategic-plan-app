# Goal Detail Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public goal drill-down page to feel like a modern analytics dashboard with clear visual hierarchy, KPI-led layout, softened chart chrome, and full-width detail view.

**Architecture:** Replace the current inline expand/collapse grid with a two-state page model (grid view vs full-width detail view). Create new `GoalCardCollapsed` and `GoalDetailCard` components, a shared `ChartTooltip`, and soften chart chrome in existing Recharts widgets. Remove old `GoalCard` and `ExpandedGoalCard`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4.x, Recharts, Vitest + Testing Library

---

### Task 1: Create ChartTooltip component

**Files:**

- Create: `src/components/v2/widgets/ChartTooltip.tsx`
- Create: `src/components/v2/widgets/__tests__/ChartTooltip.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
// src/components/v2/widgets/__tests__/ChartTooltip.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { ChartTooltip } from "../ChartTooltip";

describe("ChartTooltip", () => {
  it("returns null when not active", () => {
    const { container } = render(
      <ChartTooltip active={false} payload={[]} label="Q1" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when payload is empty", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[]} label="Q1" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders label and value when active with payload", () => {
    render(
      <ChartTooltip
        active={true}
        payload={[{ value: 78, name: "value", color: "#b85c38" }]}
        label="Mar 2026"
      />,
    );
    expect(screen.getByText("Mar 2026")).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
  });

  it("renders multiple payload entries", () => {
    render(
      <ChartTooltip
        active={true}
        payload={[
          { value: 78, name: "series_0", color: "#b85c38" },
          { value: 65, name: "series_1", color: "#8a8a8a" },
        ]}
        label="Q2"
      />,
    );
    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/v2/widgets/__tests__/ChartTooltip.test.tsx`
Expected: FAIL — `ChartTooltip` does not exist yet

- [ ] **Step 3: Write the ChartTooltip component**

```tsx
// src/components/v2/widgets/ChartTooltip.tsx
interface TooltipPayloadEntry {
  value: number;
  name: string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--editorial-surface, #ffffff)",
        border: "1px solid var(--editorial-border, #e8e6e1)",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        padding: "8px 12px",
      }}
    >
      {label && (
        <p
          style={{
            fontSize: 11,
            color: "var(--editorial-text-muted, #8a8a8a)",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <p
          key={i}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--editorial-text-primary, #1a1a1a)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {payload.length > 1 && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  entry.color || "var(--editorial-accent-primary)",
                flexShrink: 0,
              }}
            />
          )}
          {entry.value}
        </p>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/v2/widgets/__tests__/ChartTooltip.test.tsx`
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/v2/widgets/ChartTooltip.tsx src/components/v2/widgets/__tests__/ChartTooltip.test.tsx
git commit -m "feat: add shared ChartTooltip component for Recharts widgets"
```

---

### Task 2: Soften AreaLineWidget chart chrome

**Files:**

- Modify: `src/components/v2/widgets/renderers/AreaLineWidget.tsx`
- Modify: `src/components/v2/widgets/renderers/__tests__/AreaLineWidget.test.tsx`

- [ ] **Step 1: Update the AreaLineWidget component**

Replace the entire contents of `src/components/v2/widgets/renderers/AreaLineWidget.tsx` with:

```tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { WidgetConfig } from "../../../../lib/types/v2";
import { ChartTooltip } from "../ChartTooltip";

interface AreaLineWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

export function AreaLineWidget({ config }: AreaLineWidgetProps) {
  const dataPoints = config.dataPoints ?? [];
  const accentColor =
    config.colors?.[0] ?? "var(--editorial-accent-primary, #6366f1)";

  const chartData = dataPoints.map((dp) => ({
    label: dp.label,
    value: dp.value ?? 0,
  }));

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.12} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f0eee9" strokeWidth={0.5} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#b0b0b0" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#b0b0b0" }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
          />
          <Tooltip content={<ChartTooltip />} />
          {config.target !== undefined && (
            <ReferenceLine
              y={config.target}
              stroke={accentColor}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={accentColor}
            fill="url(#areaGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Run existing tests to verify no regressions**

Run: `npx vitest run src/components/v2/widgets/renderers/__tests__/AreaLineWidget.test.tsx`
Expected: All existing tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/v2/widgets/renderers/AreaLineWidget.tsx
git commit -m "feat: soften AreaLineWidget chart chrome with subtle gridlines and custom tooltip"
```

---

### Task 3: Soften BarChartWidget chart chrome

**Files:**

- Modify: `src/components/v2/widgets/renderers/BarChartWidget.tsx`
- Modify: `src/components/v2/widgets/renderers/__tests__/BarChartWidget.test.tsx`

- [ ] **Step 1: Update the BarChartWidget component**

Replace the entire contents of `src/components/v2/widgets/renderers/BarChartWidget.tsx` with:

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { WidgetConfig } from "../../../../lib/types/v2";
import { ChartTooltip } from "../ChartTooltip";

interface BarChartWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

const DEFAULT_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
];

export function BarChartWidget({ config }: BarChartWidgetProps) {
  const dataPoints = config.dataPoints ?? [];
  const legendLabels = config.legend ?? [];
  const colors = config.colors ?? DEFAULT_COLORS;

  const firstWithValues = dataPoints.find(
    (dp) => dp.values && dp.values.length > 0,
  );
  const seriesCount = firstWithValues?.values?.length ?? 1;

  const chartData = dataPoints.map((dp) => {
    const entry: Record<string, string | number> = { label: dp.label };
    if (dp.values) {
      dp.values.forEach((v, i) => {
        entry[`series_${i}`] = v;
      });
    } else if (dp.value !== undefined) {
      entry["series_0"] = dp.value;
    }
    return entry;
  });

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid stroke="#f0eee9" strokeWidth={0.5} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#b0b0b0" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#b0b0b0" }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
          />
          <Tooltip content={<ChartTooltip />} />
          {config.target !== undefined && (
            <ReferenceLine
              y={config.target}
              stroke={colors[0] || DEFAULT_COLORS[0]}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          )}
          {legendLabels.length >= 2 && <Legend />}
          {Array.from({ length: seriesCount }, (_, i) => (
            <Bar
              key={i}
              dataKey={`series_${i}`}
              name={legendLabels[i] ?? `Series ${i + 1}`}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Run existing tests to verify no regressions**

Run: `npx vitest run src/components/v2/widgets/renderers/__tests__/BarChartWidget.test.tsx`
Expected: All existing tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/v2/widgets/renderers/BarChartWidget.tsx
git commit -m "feat: soften BarChartWidget chart chrome with subtle gridlines and custom tooltip"
```

---

### Task 4: Create GoalCardCollapsed component

**Files:**

- Create: `src/components/v2/public/GoalCardCollapsed.tsx`
- Create: `src/components/v2/public/__tests__/GoalCardCollapsed.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
// src/components/v2/public/__tests__/GoalCardCollapsed.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/setup";
import userEvent from "@testing-library/user-event";
import { GoalCardCollapsed } from "../GoalCardCollapsed";
import type { Widget } from "../../../../lib/types/v2";

const mockWidgets: Widget[] = [
  {
    id: "w-1",
    organizationId: "org-1",
    planId: "plan-1",
    goalId: "goal-1",
    type: "bar-chart",
    title: "ELA Proficiency Rate",
    config: {
      value: 72,
      baseline: 65,
      target: 85,
      unit: "%",
      isHigherBetter: true,
      indicatorText: "Off Track",
      indicatorColor: "red",
    },
    position: 0,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

const defaultProps = {
  goalNumber: "1.1",
  title: "Reading Proficiency",
  widgets: mockWidgets,
  primaryColor: "#1e3a5f",
  onClick: vi.fn(),
};

describe("GoalCardCollapsed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders goal number in badge", () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText("1.1")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText("Reading Proficiency")).toBeInTheDocument();
  });

  it("shows formatted KPI value from widget", () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("shows target from widget config", () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText("Target: 85%")).toBeInTheDocument();
  });

  it("shows indicator badge when indicatorText is set", () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText("Off Track")).toBeInTheDocument();
  });

  it('shows "No metrics defined" when no widgets', () => {
    render(<GoalCardCollapsed {...defaultProps} widgets={[]} />);
    expect(screen.getByText("No metrics defined")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoalCardCollapsed {...defaultProps} onClick={onClick} />);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows sub-goal count when provided", () => {
    render(<GoalCardCollapsed {...defaultProps} subGoalCount={3} />);
    expect(screen.getByText("3 sub-goals")).toBeInTheDocument();
  });

  it("shows singular sub-goal for count of 1", () => {
    render(<GoalCardCollapsed {...defaultProps} subGoalCount={1} />);
    expect(screen.getByText("1 sub-goal")).toBeInTheDocument();
  });

  it("has descriptive aria-label", () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Goal 1.1: Reading Proficiency. Click to view details",
    );
  });

  it("uses 16px border radius (rounded-2xl)", () => {
    const { container } = render(<GoalCardCollapsed {...defaultProps} />);
    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
  });

  it("shows type label for bar-chart widget", () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText("CURRENT SCORE")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/v2/public/__tests__/GoalCardCollapsed.test.tsx`
Expected: FAIL — `GoalCardCollapsed` does not exist yet

- [ ] **Step 3: Write the GoalCardCollapsed component**

```tsx
// src/components/v2/public/GoalCardCollapsed.tsx
import type { Widget, WidgetConfig } from "../../../lib/types/v2";

const INDICATOR_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  red: { bg: "#fee2e2", text: "#dc2626", dot: "#dc2626" },
  green: { bg: "#dcfce7", text: "#16a34a", dot: "#16a34a" },
  amber: { bg: "#fef3c7", text: "#d97706", dot: "#d97706" },
  gray: { bg: "#f3f4f6", text: "#6b7280", dot: "#6b7280" },
};

function getTypeLabel(widgetType: string): string {
  switch (widgetType) {
    case "bar-chart":
    case "area-line":
      return "CURRENT SCORE";
    case "donut":
    case "progress-bar":
      return "COMPLETION";
    case "big-number":
      return "VALUE";
    default:
      return "METRIC";
  }
}

function formatValue(config: WidgetConfig): string {
  const value = config.value;
  if (value === undefined || value === null) return "—";
  const unit = config.unit || "";
  if (unit === "%") return `${value}%`;
  if (unit) return `${value} ${unit}`;
  return String(value);
}

export interface GoalCardCollapsedProps {
  goalNumber: string;
  title: string;
  widgets?: Widget[];
  primaryColor?: string;
  onClick: () => void;
  subGoalCount?: number;
}

export function GoalCardCollapsed({
  goalNumber,
  title,
  widgets = [],
  primaryColor,
  onClick,
  subGoalCount,
}: GoalCardCollapsedProps) {
  const primaryWidget = widgets[0];
  const config = primaryWidget?.config;

  return (
    <button
      aria-label={`Goal ${goalNumber}: ${title}. Click to view details`}
      className="w-full text-left rounded-2xl p-5 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{
        backgroundColor: "var(--editorial-surface)",
        border: "1px solid var(--editorial-border)",
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-[11px] font-bold"
          style={{
            border: `2px solid ${primaryColor || "#1e293b"}`,
            color: primaryColor || "#1e293b",
          }}
        >
          {goalNumber}
        </div>
        <div
          className="flex-1 text-sm font-semibold line-clamp-2 leading-snug"
          style={{ color: "var(--editorial-text-primary)" }}
        >
          {title}
        </div>
      </div>

      {/* KPI section */}
      {primaryWidget ? (
        <div>
          {config.indicatorText && (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2"
              style={{
                backgroundColor:
                  INDICATOR_COLORS[config.indicatorColor || "gray"]?.bg,
                color: INDICATOR_COLORS[config.indicatorColor || "gray"]?.text,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    INDICATOR_COLORS[config.indicatorColor || "gray"]?.dot,
                }}
              />
              {config.indicatorText}
            </span>
          )}
          <span
            className="text-[10px] font-semibold tracking-widest uppercase block mb-1"
            style={{ color: "var(--editorial-text-muted)" }}
          >
            {getTypeLabel(primaryWidget.type)}
          </span>
          <span
            className="text-[28px] font-bold leading-none block"
            style={{ color: "var(--editorial-text-primary)" }}
          >
            {formatValue(config)}
          </span>
          {config.target !== undefined && (
            <span
              className="text-[11px] block mt-1"
              style={{ color: "var(--editorial-text-muted)" }}
            >
              Target: {config.target}
              {config.unit === "%" ? "%" : config.unit ? ` ${config.unit}` : ""}
            </span>
          )}
        </div>
      ) : (
        <span
          className="text-sm block"
          style={{ color: "var(--editorial-text-muted)" }}
        >
          No metrics defined
        </span>
      )}

      {/* Footer */}
      <div
        className="mt-3 pt-3 flex items-center justify-between text-[11px]"
        style={{
          borderTop: "1px solid var(--editorial-border-light, #f0eee9)",
          color: "var(--editorial-text-muted)",
        }}
      >
        {subGoalCount != null && subGoalCount > 0 ? (
          <span>
            {subGoalCount} sub-goal{subGoalCount !== 1 ? "s" : ""}
          </span>
        ) : (
          <span />
        )}
        <span style={{ color: "var(--editorial-accent-link, #4a6fa5)" }}>
          View →
        </span>
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/v2/public/__tests__/GoalCardCollapsed.test.tsx`
Expected: All 11 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/v2/public/GoalCardCollapsed.tsx src/components/v2/public/__tests__/GoalCardCollapsed.test.tsx
git commit -m "feat: add GoalCardCollapsed component for analytics-style goal grid"
```

---

### Task 5: Create GoalDetailCard component

**Files:**

- Create: `src/components/v2/public/GoalDetailCard.tsx`
- Create: `src/components/v2/public/__tests__/GoalDetailCard.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
// src/components/v2/public/__tests__/GoalDetailCard.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/setup";
import userEvent from "@testing-library/user-event";
import { GoalDetailCard } from "../GoalDetailCard";
import type { Goal } from "../../../../lib/types";
import type { Widget } from "../../../../lib/types/v2";

// Mock Recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: React.PropsWithChildren) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ReferenceLine: () => <div />,
  PieChart: ({ children }: React.PropsWithChildren) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div />,
  Cell: () => <div />,
  AreaChart: ({ children }: React.PropsWithChildren) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div />,
}));

const mockGoal: Goal = {
  id: "goal-1",
  district_id: "org-1",
  parent_id: null,
  goal_number: "1.1",
  title: "Reading Proficiency",
  description: "Improve reading scores across all grades",
  level: 1,
  order_position: 0,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  overall_progress: 65,
  owner_name: "Dr. Smith",
  priority: "high",
  status: "in_progress",
  children: [
    {
      id: "child-1",
      district_id: "org-1",
      parent_id: "goal-1",
      goal_number: "1.1.1",
      title: "K-2 Reading Program",
      description: "Early literacy initiative",
      level: 2,
      order_position: 0,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      status: "in_progress",
    },
    {
      id: "child-2",
      district_id: "org-1",
      parent_id: "goal-1",
      goal_number: "1.1.2",
      title: "Grade 3-5 Comprehension",
      level: 2,
      order_position: 1,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      status: "not_started",
    },
  ],
};

const mockWidgets: Widget[] = [
  {
    id: "w-1",
    organizationId: "org-1",
    planId: "plan-1",
    goalId: "goal-1",
    type: "bar-chart",
    title: "ELA Proficiency Rate",
    config: {
      value: 72,
      baseline: 65,
      target: 85,
      unit: "%",
      isHigherBetter: true,
      indicatorText: "Off Track",
      indicatorColor: "red",
      dataPoints: [
        { label: "2021", value: 65 },
        { label: "2022", value: 68 },
        { label: "2023", value: 70 },
        { label: "2024", value: 72 },
      ],
      colors: ["#1e40af"],
    },
    position: 0,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

describe("GoalDetailCard", () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders goal title", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText("Reading Proficiency")).toBeInTheDocument();
  });

  it("renders goal description", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(
      screen.getByText("Improve reading scores across all grades"),
    ).toBeInTheDocument();
  });

  it("renders goal number badge", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText("1.1")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("shows KPI value at 44px weight (large number)", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("shows target", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it("shows baseline", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText(/65%/)).toBeInTheDocument();
  });

  it("shows owner name", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
  });

  it("renders widget chart", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders sub-goals section", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    expect(screen.getByText("Sub-goals (2)")).toBeInTheDocument();
    expect(screen.getByText("K-2 Reading Program")).toBeInTheDocument();
    expect(screen.getByText("Grade 3-5 Comprehension")).toBeInTheDocument();
  });

  it("renders sub-goal rows as links", () => {
    render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    const link1 = screen.getByRole("link", { name: /K-2 Reading Program/i });
    expect(link1).toHaveAttribute("href", "/goals/child-1");
  });

  it("uses custom buildLink for sub-goal hrefs", () => {
    render(
      <GoalDetailCard
        goal={mockGoal}
        widgets={mockWidgets}
        onBack={onBack}
        buildLink={(p) => `/westside${p}`}
      />,
    );
    const link1 = screen.getByRole("link", { name: /K-2 Reading Program/i });
    expect(link1).toHaveAttribute("href", "/westside/goals/child-1");
  });

  it('shows "No metrics defined" when no children and no widgets', () => {
    const emptyGoal: Goal = {
      ...mockGoal,
      children: [],
      owner_name: undefined,
      priority: undefined,
    };
    render(<GoalDetailCard goal={emptyGoal} widgets={[]} onBack={onBack} />);
    expect(screen.getByText("No metrics defined")).toBeInTheDocument();
  });

  it("uses 16px border radius (rounded-2xl)", () => {
    const { container } = render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />,
    );
    const card = container.querySelector(".rounded-2xl");
    expect(card).toBeInTheDocument();
  });

  it("renders sub-goal widget preview value when subGoalWidgets provided", () => {
    const subGoalWidgets: Record<string, Widget[]> = {
      "child-1": [
        {
          id: "w-sub-1",
          organizationId: "org-1",
          planId: "plan-1",
          goalId: "child-1",
          type: "big-number",
          title: "Literacy Rate",
          config: { value: 88, unit: "%" },
          position: 0,
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ],
    };
    render(
      <GoalDetailCard
        goal={mockGoal}
        widgets={mockWidgets}
        subGoalWidgets={subGoalWidgets}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("88%")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/v2/public/__tests__/GoalDetailCard.test.tsx`
Expected: FAIL — `GoalDetailCard` does not exist yet

- [ ] **Step 3: Write the GoalDetailCard component**

```tsx
// src/components/v2/public/GoalDetailCard.tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Goal } from "../../../lib/types";
import type { Widget, WidgetConfig } from "../../../lib/types/v2";
import { GoalStatusBadge } from "./GoalStatusBadge";
import { BarChartWidget } from "../widgets/renderers/BarChartWidget";
import { AreaLineWidget } from "../widgets/renderers/AreaLineWidget";
import { DonutWidget } from "../widgets/renderers/DonutWidget";
import { BigNumberWidget } from "../widgets/renderers/BigNumberWidget";
import { ProgressBarWidget } from "../widgets/renderers/ProgressBarWidget";
import { PieBreakdownWidget } from "../widgets/renderers/PieBreakdownWidget";

const INDICATOR_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  red: { bg: "#fee2e2", text: "#dc2626", dot: "#dc2626" },
  green: { bg: "#dcfce7", text: "#16a34a", dot: "#16a34a" },
  amber: { bg: "#fef3c7", text: "#d97706", dot: "#d97706" },
  gray: { bg: "#f3f4f6", text: "#6b7280", dot: "#6b7280" },
};

function getTypeLabel(widgetType: string): string {
  switch (widgetType) {
    case "bar-chart":
    case "area-line":
      return "CURRENT SCORE";
    case "donut":
    case "progress-bar":
      return "COMPLETION";
    case "big-number":
      return "VALUE";
    default:
      return "METRIC";
  }
}

function formatValue(config: WidgetConfig): string {
  const value = config.value;
  if (value === undefined || value === null) return "—";
  const unit = config.unit || "";
  if (unit === "%") return `${value}%`;
  if (unit) return `${value} ${unit}`;
  return String(value);
}

function WidgetChart({ widget }: { widget: Widget }) {
  const { type, config, title, subtitle } = widget;
  switch (type) {
    case "bar-chart":
      return (
        <BarChartWidget config={config} title={title} subtitle={subtitle} />
      );
    case "area-line":
      return (
        <AreaLineWidget config={config} title={title} subtitle={subtitle} />
      );
    case "donut":
      return <DonutWidget config={config} title={title} subtitle={subtitle} />;
    case "big-number":
      return (
        <BigNumberWidget config={config} title={title} subtitle={subtitle} />
      );
    case "progress-bar":
      return (
        <ProgressBarWidget config={config} title={title} subtitle={subtitle} />
      );
    case "pie-breakdown":
      return (
        <PieBreakdownWidget config={config} title={title} subtitle={subtitle} />
      );
    default:
      return null;
  }
}

export interface GoalDetailCardProps {
  goal: Goal;
  widgets?: Widget[];
  subGoalWidgets?: Record<string, Widget[]>;
  primaryColor?: string;
  onBack: () => void;
  buildLink?: (path: string) => string;
}

export function GoalDetailCard({
  goal,
  widgets = [],
  subGoalWidgets = {},
  primaryColor = "#1e293b",
  onBack,
  buildLink = (p) => p,
}: GoalDetailCardProps) {
  const children = goal.children ?? [];
  const primaryWidget = widgets[0];
  const config = primaryWidget?.config;
  const hasWidgets = primaryWidget != null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--editorial-surface)",
        border: "1px solid var(--editorial-border)",
      }}
    >
      {/* Zone 1: Header */}
      <div
        className="flex items-start gap-3.5 p-6 max-sm:p-4"
        style={{
          borderBottom: "1px solid var(--editorial-border-light, #f0eee9)",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {goal.goal_number}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[17px] font-semibold"
            style={{ color: "var(--editorial-text-primary)" }}
          >
            {goal.title}
          </div>
          {goal.description && (
            <p
              className="text-[13px] mt-1"
              style={{ color: "var(--editorial-text-secondary)" }}
            >
              {goal.description}
            </p>
          )}
        </div>
        <GoalStatusBadge status={goal.status} className="shrink-0 ml-2" />
      </div>

      {/* Zone 2: KPI + Chart */}
      {hasWidgets && (
        <div className="flex max-sm:flex-col" style={{ minHeight: 180 }}>
          {/* KPI Panel */}
          <div
            className="flex flex-col justify-center p-6 max-sm:p-4 max-sm:border-b sm:border-r sm:w-[280px] sm:shrink-0"
            style={{ borderColor: "var(--editorial-border-light, #f0eee9)" }}
          >
            {config!.indicatorText && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 self-start"
                style={{
                  backgroundColor:
                    INDICATOR_COLORS[config!.indicatorColor || "gray"]?.bg,
                  color:
                    INDICATOR_COLORS[config!.indicatorColor || "gray"]?.text,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      INDICATOR_COLORS[config!.indicatorColor || "gray"]?.dot,
                  }}
                />
                {config!.indicatorText}
              </span>
            )}
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-1"
              style={{ color: "var(--editorial-text-muted)" }}
            >
              {getTypeLabel(primaryWidget!.type)}
            </div>
            <div
              className="text-[44px] font-bold leading-none"
              style={{ color: "var(--editorial-text-primary)" }}
            >
              {formatValue(config!)}
            </div>
            <div className="mt-3 flex flex-col gap-1">
              {config!.target !== undefined && (
                <div
                  className="text-[13px]"
                  style={{ color: "var(--editorial-text-secondary)" }}
                >
                  Target:{" "}
                  <strong>
                    {config!.target}
                    {config!.unit === "%"
                      ? "%"
                      : config!.unit
                        ? ` ${config!.unit}`
                        : ""}
                  </strong>
                </div>
              )}
              {config!.baseline !== undefined && (
                <div
                  className="text-[13px]"
                  style={{ color: "var(--editorial-text-secondary)" }}
                >
                  Baseline: {config!.baseline}
                  {config!.unit === "%"
                    ? "%"
                    : config!.unit
                      ? ` ${config!.unit}`
                      : ""}
                </div>
              )}
              {goal.owner_name && (
                <div
                  className="text-[11px] mt-1"
                  style={{ color: "var(--editorial-text-muted)" }}
                >
                  {goal.owner_name}
                </div>
              )}
            </div>
          </div>

          {/* Chart Panel */}
          <div className="flex-1 p-6 max-sm:p-4 flex items-center">
            <div className="w-full min-h-[140px] sm:min-h-[180px]">
              <WidgetChart widget={primaryWidget!} />
            </div>
          </div>
        </div>
      )}

      {/* Zone 3: Source Annotation */}
      {primaryWidget?.updatedAt && (
        <div
          className="flex justify-end px-6 pb-3 max-sm:px-4 text-[11px]"
          style={{ color: "var(--editorial-text-muted)" }}
        >
          Updated{" "}
          {new Date(primaryWidget.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )}

      {/* Zone 4: Sub-goals */}
      {children.length > 0 && (
        <div
          className="p-5 max-sm:p-4"
          style={{
            borderTop: "1px solid var(--editorial-border-light, #f0eee9)",
          }}
        >
          <div
            className="text-[10px] font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--editorial-text-muted)" }}
          >
            Sub-goals ({children.length})
          </div>
          <div className="flex flex-col gap-1">
            {children.map((child) => {
              const childWidgetList = subGoalWidgets[child.id] || [];
              const previewWidget = childWidgetList[0];
              return (
                <Link
                  key={child.id}
                  href={buildLink(`/goals/${child.id}`)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl transition-colors"
                  style={{ color: "var(--editorial-text-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--editorial-surface-alt, #f5f3ef)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md text-white flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {child.goal_number}
                  </div>
                  <div className="flex-1 min-w-0 text-[13px] font-medium truncate">
                    {child.title}
                  </div>
                  {previewWidget && (
                    <span
                      className="text-xs font-semibold shrink-0"
                      style={{ color: "var(--editorial-text-muted)" }}
                    >
                      {formatValue(previewWidget.config)}
                    </span>
                  )}
                  <ChevronRight
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--editorial-text-muted)" }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasWidgets && children.length === 0 && (
        <div className="text-center py-8">
          <p
            className="text-sm"
            style={{ color: "var(--editorial-text-muted)" }}
          >
            No metrics defined
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/v2/public/__tests__/GoalDetailCard.test.tsx`
Expected: All 15 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/v2/public/GoalDetailCard.tsx src/components/v2/public/__tests__/GoalDetailCard.test.tsx
git commit -m "feat: add GoalDetailCard component with KPI-led split layout"
```

---

### Task 6: Update index.ts exports

**Files:**

- Modify: `src/components/v2/public/index.ts`

- [ ] **Step 1: Replace index.ts contents**

Replace the entire contents of `src/components/v2/public/index.ts` with:

```ts
export { GoalStatusBadge } from "./GoalStatusBadge";
export type { GoalStatusBadgeProps } from "./GoalStatusBadge";
export { ObjectiveCard } from "./ObjectiveCard";
export type { ObjectiveCardProps } from "./ObjectiveCard";
export { GoalRow } from "./GoalRow";
export type { GoalRowProps } from "./GoalRow";
export { Breadcrumb } from "./Breadcrumb";
export type { BreadcrumbProps, BreadcrumbItem } from "./Breadcrumb";
export { ProgressRing } from "./ProgressRing";
export type { ProgressRingProps } from "./ProgressRing";
export { GoalCardCollapsed } from "./GoalCardCollapsed";
export type { GoalCardCollapsedProps } from "./GoalCardCollapsed";
export { GoalDetailCard } from "./GoalDetailCard";
export type { GoalDetailCardProps } from "./GoalDetailCard";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/v2/public/index.ts
git commit -m "refactor: update public component exports for new goal card components"
```

---

### Task 7: Refactor V2GoalDrillDown to two-state page model

**Files:**

- Modify: `src/views/v2/public/V2GoalDrillDown.tsx`

- [ ] **Step 1: Replace the V2GoalDrillDown component**

Replace the entire contents of `src/views/v2/public/V2GoalDrillDown.tsx` with:

```tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useSubdomain,
  useDistrictLink,
} from "../../../contexts/SubdomainContext";
import { useDistrict } from "../../../hooks/useDistricts";
import { usePlansBySlug } from "../../../hooks/v2/usePlans";
import { useGoalsByPlan } from "../../../hooks/v2/useGoals";
import { useWidgetsByGoals } from "../../../hooks/v2/useWidgets";
import {
  GoalCardCollapsed,
  GoalDetailCard,
  ProgressRing,
  Breadcrumb,
} from "../../../components/v2/public";
import { WidgetGrid } from "../../../components/v2/widgets/WidgetGrid";
import type { HierarchicalGoal } from "../../../lib/types";
import type { Widget } from "../../../lib/types/v2";

function findGoalInHierarchy(
  goals: HierarchicalGoal[],
  id: string,
): HierarchicalGoal | undefined {
  for (const g of goals) {
    if (g.id === id) return g;
    const found = findGoalInHierarchy(g.children, id);
    if (found) return found;
  }
  return undefined;
}

export function V2GoalDrillDown() {
  const params = useParams<{ goalId: string }>();
  const goalId = Array.isArray(params.goalId)
    ? params.goalId[0]
    : params.goalId;
  const { slug } = useSubdomain();
  const districtLink = useDistrictLink();
  const { data: district } = useDistrict(slug || "");
  const { data: plans } = usePlansBySlug(slug || "");

  const activePlan = plans?.find((p) => p.is_active && p.is_public);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const { data: allGoals, isLoading: goalsLoading } = useGoalsByPlan(
    activePlan?.id || "",
  );

  const goal =
    allGoals && goalId ? findGoalInHierarchy(allGoals, goalId) : undefined;
  const children: HierarchicalGoal[] = goal?.children || [];

  const allGoalIds = [
    goalId,
    ...children.flatMap((c) => [
      c.id,
      ...(c.children || []).map((gc) => gc.id),
    ]),
  ].filter(Boolean) as string[];
  const { data: goalWidgets } = useWidgetsByGoals(slug || "", allGoalIds);

  const getWidgetsForGoal = (id: string): Widget[] =>
    goalWidgets?.filter((w) => w.goalId === id) || [];

  const selectedGoal = selectedGoalId
    ? children.find((c) => c.id === selectedGoalId)
    : null;

  const isLoading = goalsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: "var(--editorial-accent-primary)" }}
        />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p
          className="text-lg font-medium"
          style={{ color: "var(--editorial-text-secondary)" }}
        >
          Goal not found
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: activePlan?.name || "Plan", href: districtLink("/") },
          { label: goal.goal_number + " " + goal.title },
        ]}
      />

      {/* Objective header */}
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center rounded-xl font-bold text-lg text-white shrink-0"
            style={{
              width: 48,
              height: 48,
              backgroundColor: district?.primary_color || "#1e293b",
            }}
          >
            {goal.goal_number}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--editorial-text-primary)" }}
            >
              {goal.title}
            </h1>
            {goal.description && (
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--editorial-text-secondary)" }}
              >
                {goal.description}
              </p>
            )}
          </div>
        </div>
        {goal.overall_progress != null &&
          goal.overall_progress_display_mode !== "hidden" && (
            <div className="flex items-center gap-3">
              <ProgressRing
                progress={goal.overall_progress}
                size={40}
                strokeWidth={3}
              />
            </div>
          )}
      </div>

      {/* Parent widgets section — shown when goal has no children but has widgets */}
      {children.length === 0 && getWidgetsForGoal(goalId || "").length > 0 && (
        <div className="space-y-3">
          <h2
            className="uppercase tracking-wider text-xs font-semibold"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            Metrics ({getWidgetsForGoal(goalId || "").length})
          </h2>
          <WidgetGrid widgets={getWidgetsForGoal(goalId || "")} />
        </div>
      )}

      {/* Content area: grid or detail */}
      {children.length > 0 && !selectedGoal && (
        <>
          <div className="space-y-3">
            <h2
              className="uppercase tracking-wider text-xs font-semibold"
              style={{ color: "var(--editorial-text-secondary)" }}
            >
              Goals ({children.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {children.map((child) => {
                const childWidgets = getWidgetsForGoal(child.id);
                return (
                  <GoalCardCollapsed
                    key={child.id}
                    goalNumber={child.goal_number}
                    title={child.title}
                    widgets={childWidgets}
                    primaryColor={district?.primary_color}
                    onClick={() => setSelectedGoalId(child.id)}
                    subGoalCount={child.children?.length}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      {selectedGoal && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedGoalId(null)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium cursor-pointer bg-transparent border-none p-0"
            style={{ color: "var(--editorial-accent-link, #4a6fa5)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to goals
          </button>

          <GoalDetailCard
            goal={selectedGoal}
            widgets={getWidgetsForGoal(selectedGoal.id)}
            subGoalWidgets={(() => {
              const map: Record<string, Widget[]> = {};
              (selectedGoal.children || []).forEach((gc) => {
                const gcWidgets = getWidgetsForGoal(gc.id);
                if (gcWidgets.length > 0) map[gc.id] = gcWidgets;
              });
              return map;
            })()}
            primaryColor={district?.primary_color}
            onBack={() => setSelectedGoalId(null)}
            buildLink={districtLink}
          />
        </div>
      )}

      {/* Empty state: no children and no widgets */}
      {children.length === 0 &&
        getWidgetsForGoal(goalId || "").length === 0 && (
          <p
            className="text-sm py-6 text-center"
            style={{ color: "var(--editorial-text-secondary)" }}
          >
            No goals defined for this objective yet.
          </p>
        )}
    </div>
  );
}
```

- [ ] **Step 2: Run all tests to check for regressions**

Run: `npx vitest run src/views/v2/public/__tests__/V2GoalDrillDown.test.tsx`
Expected: Some tests will fail because they reference old component behavior (ExpandedGoalCard, aria-expanded, etc.)

- [ ] **Step 3: Update the V2GoalDrillDown test file**

Replace the entire contents of `src/views/v2/public/__tests__/V2GoalDrillDown.test.tsx` with:

```tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/setup";
import userEvent from "@testing-library/user-event";
import { V2GoalDrillDown } from "../V2GoalDrillDown";

// Mock Recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: React.PropsWithChildren) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ReferenceLine: () => <div />,
  PieChart: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  AreaChart: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Area: () => <div />,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ goalId: "goal-1" }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
    toString: vi.fn().mockReturnValue(""),
  }),
  usePathname: () => "/",
}));

// Mock subdomain context
vi.mock("../../../../contexts/SubdomainContext", () => ({
  useSubdomain: () => ({ slug: "westside", type: "district" }),
  useDistrictLink: () => (path: string) => path,
}));

// Mock useDistrict
vi.mock("../../../../hooks/useDistricts", () => ({
  useDistrict: () => ({
    data: { id: "org-1", name: "Westside", primary_color: "#1e3a5f" },
    isLoading: false,
  }),
}));

// Mock usePlansBySlug
vi.mock("../../../../hooks/v2/usePlans", () => ({
  usePlansBySlug: () => ({
    data: [
      {
        id: "plan-1",
        name: "Strategic Plan 2025",
        is_active: true,
        is_public: true,
      },
    ],
    isLoading: false,
  }),
}));

// Mock useWidgetsByGoals
const mockUseWidgetsByGoals = vi.fn();
vi.mock("../../../../hooks/v2/useWidgets", () => ({
  useWidgetsByGoals: (...args: unknown[]) => mockUseWidgetsByGoals(...args),
}));

// Mock useGoalsByPlan
const mockUseGoalsByPlan = vi.fn();
vi.mock("../../../../hooks/v2/useGoals", () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockHierarchicalGoals = [
  {
    id: "goal-1",
    goal_number: "1",
    title: "Academic Excellence",
    description: "Improve student outcomes",
    status_detail: "in_progress",
    level: 0,
    overall_progress: 72,
    children: [
      {
        id: "c-1",
        goal_number: "1.1",
        title: "Reading Proficiency",
        description: "Increase reading scores",
        status: "in_progress",
        level: 1,
        overall_progress: 65,
        children: [
          {
            id: "gc-1",
            goal_number: "1.1.1",
            title: "Phonics Program",
            status: "in_progress",
            level: 2,
            children: [],
          },
        ],
      },
      {
        id: "c-2",
        goal_number: "1.2",
        title: "Math Achievement",
        status: "not_started",
        level: 1,
        overall_progress: 30,
        children: [],
      },
    ],
  },
];

const mockWidgetData = [
  {
    id: "w-1",
    organizationId: "org-1",
    planId: "plan-1",
    goalId: "c-1",
    type: "bar-chart",
    title: "ELA Proficiency",
    config: {
      value: 72,
      baseline: 65,
      target: 85,
      unit: "%",
      isHigherBetter: true,
      indicatorText: "Off Track",
      indicatorColor: "red",
      dataPoints: [
        { label: "2021", value: 65 },
        { label: "2024", value: 72 },
      ],
    },
    position: 0,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

describe("V2GoalDrillDown", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGoalsByPlan.mockReturnValue({
      data: mockHierarchicalGoals,
      isLoading: false,
    });

    mockUseWidgetsByGoals.mockReturnValue({
      data: mockWidgetData,
      isLoading: false,
    });
  });

  it("renders goal title", () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText("Academic Excellence")).toBeInTheDocument();
  });

  it("renders goal description", () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText("Improve student outcomes")).toBeInTheDocument();
  });

  it("renders breadcrumb with plan name and goal title", () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText("Strategic Plan 2025")).toBeInTheDocument();
    expect(screen.getByText("1 Academic Excellence")).toBeInTheDocument();
  });

  it("renders child goal count heading", () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText("Goals (2)")).toBeInTheDocument();
  });

  it("renders collapsed cards for each child", () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText("1.1")).toBeInTheDocument();
    expect(screen.getByText("1.2")).toBeInTheDocument();
  });

  it("shows widget data on collapsed card", () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText("Off Track")).toBeInTheDocument();
    expect(screen.getByText("CURRENT SCORE")).toBeInTheDocument();
  });

  it('shows "No metrics defined" for child without widgets', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText("No metrics defined")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    mockUseGoalsByPlan.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2GoalDrillDown />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it('shows "Goal not found" when goal is not in hierarchy', () => {
    mockUseGoalsByPlan.mockReturnValue({ data: [], isLoading: false });
    render(<V2GoalDrillDown />);
    expect(screen.getByText("Goal not found")).toBeInTheDocument();
  });

  it("shows empty children message when no children and no widgets", () => {
    mockUseGoalsByPlan.mockReturnValue({
      data: [
        {
          id: "goal-1",
          goal_number: "1",
          title: "Academic Excellence",
          description: "Improve student outcomes",
          level: 0,
          overall_progress: 72,
          children: [],
        },
      ],
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({ data: [], isLoading: false });
    render(<V2GoalDrillDown />);
    expect(
      screen.getByText("No goals defined for this objective yet."),
    ).toBeInTheDocument();
  });

  it("clicking a card shows full-width detail view with back button", async () => {
    const user = userEvent.setup();
    render(<V2GoalDrillDown />);

    // Click the first collapsed card
    const cards = screen
      .getAllByRole("button")
      .filter((b) =>
        b.getAttribute("aria-label")?.includes("Click to view details"),
      );
    await user.click(cards[0]);

    // Detail view should show back button
    expect(screen.getByText("Back to goals")).toBeInTheDocument();
    // Grid heading should be gone
    expect(screen.queryByText("Goals (2)")).not.toBeInTheDocument();
  });

  it("clicking back button returns to grid", async () => {
    const user = userEvent.setup();
    render(<V2GoalDrillDown />);

    // Expand a card
    const cards = screen
      .getAllByRole("button")
      .filter((b) =>
        b.getAttribute("aria-label")?.includes("Click to view details"),
      );
    await user.click(cards[0]);

    // Click back
    await user.click(screen.getByText("Back to goals"));

    // Grid should return
    expect(screen.getByText("Goals (2)")).toBeInTheDocument();
    expect(screen.queryByText("Back to goals")).not.toBeInTheDocument();
  });

  it("shows ProgressRing in header when goal has overall_progress", () => {
    render(<V2GoalDrillDown />);
    const progressRing = screen.getByRole("img", { name: "72% progress" });
    expect(progressRing).toBeInTheDocument();
  });

  it("grid has md:grid-cols-3 class", () => {
    const { container } = render(<V2GoalDrillDown />);
    const grid = container.querySelector(".md\\:grid-cols-3");
    expect(grid).toBeInTheDocument();
  });

  it("passes useWidgetsByGoals parent ID plus all descendant IDs", () => {
    render(<V2GoalDrillDown />);
    expect(mockUseWidgetsByGoals).toHaveBeenCalledWith("westside", [
      "goal-1",
      "c-1",
      "gc-1",
      "c-2",
    ]);
  });

  it("shows parent widgets in Metrics section when goal has no children", () => {
    mockUseGoalsByPlan.mockReturnValue({
      data: [
        {
          id: "goal-1",
          goal_number: "1",
          title: "Academic Excellence",
          description: "Improve student outcomes",
          level: 0,
          overall_progress: 72,
          children: [],
        },
      ],
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({
      data: [
        {
          id: "w-parent",
          organizationId: "org-1",
          planId: "plan-1",
          goalId: "goal-1",
          type: "big-number",
          title: "Graduation Rate",
          config: { value: 95, unit: "%" },
          position: 0,
          isActive: true,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ],
      isLoading: false,
    });
    render(<V2GoalDrillDown />);
    expect(screen.getByText("Metrics (1)")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run updated tests**

Run: `npx vitest run src/views/v2/public/__tests__/V2GoalDrillDown.test.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/views/v2/public/V2GoalDrillDown.tsx src/views/v2/public/__tests__/V2GoalDrillDown.test.tsx
git commit -m "feat: refactor V2GoalDrillDown to two-state page model with full-width detail view"
```

---

### Task 8: Remove old GoalCard and ExpandedGoalCard

**Files:**

- Delete: `src/components/v2/public/GoalCard.tsx`
- Delete: `src/components/v2/public/ExpandedGoalCard.tsx`
- Delete: `src/components/v2/public/__tests__/GoalCard.test.tsx`
- Delete: `src/components/v2/public/__tests__/ExpandedGoalCard.test.tsx`

- [ ] **Step 1: Delete old files**

```bash
rm src/components/v2/public/GoalCard.tsx
rm src/components/v2/public/ExpandedGoalCard.tsx
rm src/components/v2/public/__tests__/GoalCard.test.tsx
rm src/components/v2/public/__tests__/ExpandedGoalCard.test.tsx
```

- [ ] **Step 2: Run full test suite to verify no breakage**

Run: `npx vitest run`
Expected: All tests PASS. No remaining imports of `GoalCard` or `ExpandedGoalCard`.

- [ ] **Step 3: Commit**

```bash
git add -u src/components/v2/public/GoalCard.tsx src/components/v2/public/ExpandedGoalCard.tsx src/components/v2/public/__tests__/GoalCard.test.tsx src/components/v2/public/__tests__/ExpandedGoalCard.test.tsx
git commit -m "refactor: remove old GoalCard and ExpandedGoalCard replaced by new components"
```

---

### Task 9: Run full test suite and type check

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run type check**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors (or only pre-existing warnings)

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds
