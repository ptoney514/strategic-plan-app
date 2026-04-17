'use client';

/**
 * Widget design playground — internal tool, not linked from the public nav.
 *
 * Renders the 3 hero widget types (Donut, Area, Bar) alongside the redesigned
 * GoalKpiPanelV2, using hardcoded config props that mirror real seed data shapes.
 * Each variant is shown in both light and dark mode so theme regressions are
 * caught immediately.
 *
 * Route: /playground/widgets
 * Safe to delete once design is locked and swapped into GoalDetailView.
 */

import { useState } from 'react';
import { DonutWidget } from '@/components/v2/widgets/renderers/DonutWidget';
import { AreaLineWidget } from '@/components/v2/widgets/renderers/AreaLineWidget';
import { BarChartWidget } from '@/components/v2/widgets/renderers/BarChartWidget';
import { GoalKpiPanelV2 } from '@/components/v2/public/GoalKpiPanelV2';
import type { WidgetConfig } from '@/lib/types/v2';

/* -------------------------------------------------------------------------- */
/*                              Fixture configs                               */
/* -------------------------------------------------------------------------- */

const donutConfig: WidgetConfig = {
  value: 72,
  target: 85,
  unit: '%',
  label: 'Proficient',
  trend: 'Trending up 5.2% this year',
  trendDirection: 'up',
};

const areaConfig: WidgetConfig = {
  unit: '%',
  target: 85,
  dataPoints: [
    { label: 'Apr', values: [62, 48] },
    { label: 'May', values: [65, 51] },
    { label: 'Jun', values: [64, 55] },
    { label: 'Jul', values: [68, 57] },
    { label: 'Aug', values: [70, 60] },
    { label: 'Sep', values: [71, 61] },
    { label: 'Oct', values: [72, 63] },
    { label: 'Nov', values: [74, 66] },
    { label: 'Dec', values: [72, 65] },
  ],
  legend: ['ELA Proficiency', 'Math Proficiency'],
};

const barConfig: WidgetConfig = {
  unit: '%',
  target: 85,
  dataPoints: [
    { label: '2021', value: 65 },
    { label: '2022', value: 68 },
    { label: '2023', value: 70 },
    { label: '2024', value: 72 },
  ],
  legend: ['% Proficient'],
};

const kpiProps = {
  value: 72,
  unit: '%',
  statusLabel: 'In Progress',
  statusColor: 'text-md3-tertiary bg-md3-tertiary/10 dark:bg-md3-tertiary/15',
  trend: {
    delta: 7.0,
    direction: 'up' as const,
    label: 'from baseline (65%)',
  },
  target: 85,
  baseline: 65,
  forecast:
    'Off track — at current growth rate we project 79% by the 2026 target date. Recommend expanding small-group intervention in grades 3–5.',
};

/* -------------------------------------------------------------------------- */
/*                               Layout helpers                               */
/* -------------------------------------------------------------------------- */

function ThemedFrame({ title, dark, children }: { title: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <div className={dark ? 'dark' : ''}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-md3-on-surface-variant">
          {title}
        </p>
        <span className="rounded-full border border-md3-outline-variant/30 px-2 py-0.5 text-[10px] font-medium text-md3-on-surface-variant">
          {dark ? 'Dark' : 'Light'}
        </span>
      </div>
      <div
        className={`rounded-2xl border border-md3-outline-variant/25 p-6 ${
          dark ? 'bg-slate-950' : 'bg-md3-surface'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-md3-outline-variant/25 bg-md3-surface-lowest p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-bold text-md3-on-surface">{title}</h3>
          <p className="text-xs text-md3-on-surface-variant">
            ELA/Reading Proficiency Rate · 2024
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-[260px]">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Page                                        */
/* -------------------------------------------------------------------------- */

export default function WidgetPlaygroundPage() {
  const [variant, setVariant] = useState<'donut' | 'area' | 'bar'>('area');

  const variantLabels: Record<typeof variant, string> = {
    donut: 'Donut + KPI',
    area: 'Area + KPI',
    bar: 'Bar + KPI',
  };

  return (
    <div className="min-h-screen bg-md3-surface px-8 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-md3-primary">
            Internal — Design Playground
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-md3-on-surface">
            Goal Detail Hero — Widget Designs
          </h1>
          <p className="mt-3 max-w-2xl text-md3-on-surface-variant">
            Iterate on the shadcn-style redesign of the goal detail hero (KPI sidebar + primary
            chart). All data is hardcoded — no API calls. Once the design is locked we swap these
            renderers into <code className="rounded bg-md3-surface-container px-1.5 py-0.5 text-xs">GoalDetailView</code>.
          </p>

          {/* Variant toggle */}
          <div className="mt-6 inline-flex rounded-full border border-md3-outline-variant/25 bg-md3-surface-lowest p-1">
            {(Object.keys(variantLabels) as Array<keyof typeof variantLabels>).map((k) => (
              <button
                key={k}
                onClick={() => setVariant(k)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  variant === k
                    ? 'bg-md3-primary text-md3-on-primary shadow-sm'
                    : 'text-md3-on-surface-variant hover:text-md3-on-surface'
                }`}
              >
                {variantLabels[k]}
              </button>
            ))}
          </div>
        </header>

        {/* Variant — Light */}
        <section className="mb-14">
          <ThemedFrame title={`Variant: ${variantLabels[variant]}`}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <GoalKpiPanelV2 {...kpiProps} />
              </div>
              <div className="lg:col-span-7">
                {variant === 'donut' && (
                  <ChartPanel title="Completion vs target">
                    <DonutWidget config={donutConfig} title="ELA Proficiency" />
                  </ChartPanel>
                )}
                {variant === 'area' && (
                  <ChartPanel title="Monthly progression">
                    <AreaLineWidget config={areaConfig} title="ELA Proficiency" />
                  </ChartPanel>
                )}
                {variant === 'bar' && (
                  <ChartPanel title="Annual growth">
                    <BarChartWidget config={barConfig} title="ELA Proficiency" />
                  </ChartPanel>
                )}
              </div>
            </div>
          </ThemedFrame>
        </section>

        {/* Variant — Dark */}
        <section className="mb-14">
          <ThemedFrame title={`Variant: ${variantLabels[variant]} — dark mode check`} dark>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <GoalKpiPanelV2 {...kpiProps} />
              </div>
              <div className="lg:col-span-7">
                {variant === 'donut' && (
                  <ChartPanel title="Completion vs target">
                    <DonutWidget config={donutConfig} title="ELA Proficiency" />
                  </ChartPanel>
                )}
                {variant === 'area' && (
                  <ChartPanel title="Monthly progression">
                    <AreaLineWidget config={areaConfig} title="ELA Proficiency" />
                  </ChartPanel>
                )}
                {variant === 'bar' && (
                  <ChartPanel title="Annual growth">
                    <BarChartWidget config={barConfig} title="ELA Proficiency" />
                  </ChartPanel>
                )}
              </div>
            </div>
          </ThemedFrame>
        </section>

        {/* All-widgets reference grid */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-md3-on-surface">All three widgets side-by-side</h2>
            <p className="text-sm text-md3-on-surface-variant">
              Quick reference to compare visual density and color balance across widget types.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartPanel title="Donut · completion">
              <DonutWidget config={donutConfig} title="ELA" />
            </ChartPanel>
            <ChartPanel title="Area · trend">
              <AreaLineWidget config={areaConfig} title="ELA" />
            </ChartPanel>
            <ChartPanel title="Bar · annual">
              <BarChartWidget config={barConfig} title="ELA" />
            </ChartPanel>
          </div>
        </section>
      </div>
    </div>
  );
}
