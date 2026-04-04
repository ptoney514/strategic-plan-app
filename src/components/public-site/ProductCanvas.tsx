"use client";

import { memo } from "react";
import {
  ArrowUpRight,
  BuildingOffice,
  ChartBar,
  CheckCircle,
  ClockCounterClockwise,
  CursorClick,
  GearSix,
  ListChecks,
  TrendUp,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

export type ProductCanvasMode =
  | "hero"
  | "analytics"
  | "governance"
  | "editor"
  | "auth";

interface ProductCanvasProps {
  mode: ProductCanvasMode;
  className?: string;
}

interface ProductVideoFrameProps {
  className?: string;
  label: string;
  title: string;
  description: string;
}

const cardFloat = {
  duration: 8,
  repeat: Infinity,
  repeatType: "mirror" as const,
  ease: "easeInOut" as const,
};

function CanvasShell({
  eyebrow,
  title,
  footer,
  className = "",
  children,
}: {
  eyebrow: string;
  title: string;
  footer: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`public-shadow-strong relative overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-5 backdrop-blur-sm ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="public-kicker text-primary/70">{eyebrow}</p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-on-surface">
              {title}
            </p>
          </div>
          <div className="rounded-full border border-outline-variant bg-surface px-4 py-2 text-[11px] font-label font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
            {footer}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const HeroCanvas = memo(function HeroCanvas() {
  return (
    <CanvasShell
      eyebrow="District publication"
      title="Plan health overview"
      footer="Live"
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="public-panel space-y-5 rounded-[28px] p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-on-surface-variant">
                Community literacy plan
              </p>
              <p className="mt-1 font-mono text-xs text-primary">
                westside.stratadash.org
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <CheckCircle size={14} weight="fill" />
              On track
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
                  Public scorecard
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-on-surface">
                  82%
                </p>
              </div>
              <div className="rounded-2xl bg-primary-container px-4 py-3 text-right">
                <p className="text-[11px] font-label uppercase tracking-[0.24em] text-on-primary-container/70">
                  Weekly review
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-on-primary-container">
                  <TrendUp size={16} weight="bold" />
                  Progress holding steady
                </p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-surface-container-high">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ scaleX: 0.5, transformOrigin: "left" }}
                animate={{ scaleX: [0.62, 0.8, 0.7, 0.82] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Board updates", "Every Monday"],
              ["Public pages", "One hosted URL"],
              ["Narrative owners", "Department leads"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl bg-surface-container-low p-4"
              >
                <p className="text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold text-on-surface">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-4">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={cardFloat}
            className="public-panel rounded-[26px] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-on-surface">
                Leadership tasks
              </p>
              <ListChecks size={18} className="text-primary" weight="bold" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Review student growth narrative",
                "Confirm board packet exports",
                "Refresh attendance KPI notes",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  animate={{ x: [0, index % 2 === 0 ? 4 : -4, 0] }}
                  transition={{
                    duration: 6 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-4 py-3"
                >
                  <span className="text-sm text-on-surface">{item}</span>
                  <ArrowUpRight size={16} className="text-on-surface-variant" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ ...cardFloat, duration: 9 }}
            className="public-panel rounded-[26px] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-on-surface">Signals</p>
              <ChartBar size={18} className="text-primary" weight="bold" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[62, 78, 53].map((value, index) => (
                <div
                  key={value}
                  className="space-y-3 rounded-2xl bg-surface-container-low p-3"
                >
                  <div
                    className="h-24 rounded-2xl bg-primary/10"
                    style={{
                      clipPath: `polygon(0 ${100 - value}%, 100% ${60 - index * 8}%, 100% 100%, 0 100%)`,
                    }}
                  />
                  <p className="font-mono text-xs text-on-surface-variant">
                    {value}% current
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </CanvasShell>
  );
});

const AnalyticsCanvas = memo(function AnalyticsCanvas() {
  return (
    <CanvasShell
      eyebrow="Board reporting"
      title="Progress brief"
      footer="Review"
    >
      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          {[
            ["Attendance intervention", "Ready for board review"],
            ["Middle school math", "Narrative updated 2h ago"],
            ["Career pathways", "Waiting on finance note"],
          ].map(([title, description], index) => (
            <motion.div
              key={title}
              animate={{ x: [0, index % 2 === 0 ? 6 : -6, 0] }}
              transition={{
                duration: 7 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="public-panel rounded-[24px] p-4"
            >
              <p className="text-sm font-semibold text-on-surface">{title}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="public-panel rounded-[28px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
                Board summary
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-on-surface">
                What changed this week
              </p>
            </div>
            <ClockCounterClockwise
              size={18}
              className="text-primary"
              weight="bold"
            />
          </div>
          <div className="mt-8 space-y-4">
            {[72, 55, 81, 66].map((value, index) => (
              <div key={value} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-on-surface">
                    {
                      ["Milestones", "KPIs", "Owner updates", "Public notes"][
                        index
                      ]
                    }
                  </span>
                  <span className="font-mono text-on-surface-variant">
                    {value}% synced
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-container-high">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{
                      scaleX: [
                        value / 100,
                        Math.min(0.96, value / 100 + 0.08),
                        value / 100,
                      ],
                    }}
                    transition={{
                      duration: 6 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CanvasShell>
  );
});

const GovernanceCanvas = memo(function GovernanceCanvas() {
  return (
    <CanvasShell
      eyebrow="Procurement ready"
      title="District operating model"
      footer="Governance"
    >
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="public-panel rounded-[28px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
                Permissions
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-on-surface">
                Clear ownership by team
              </p>
            </div>
            <GearSix size={18} className="text-primary" weight="bold" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["Cabinet office", "Publish updates", "Full"],
              ["Campus leaders", "Edit assigned goals", "Scoped"],
              ["Community viewers", "Read public plan", "Public"],
            ].map(([team, scope, level]) => (
              <div
                key={team}
                className="grid grid-cols-[1.1fr_1fr_auto] items-center gap-4 rounded-2xl bg-surface-container-low px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {team}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {scope}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width:
                        level === "Full"
                          ? "88%"
                          : level === "Scoped"
                            ? "62%"
                            : "38%",
                    }}
                  />
                </div>
                <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {[
            {
              title: "District branding",
              description: "One URL, one palette, one public destination",
              icon: BuildingOffice,
            },
            {
              title: "Procurement cadence",
              description: "Annual subscription aligned to district budgeting",
              icon: CursorClick,
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              animate={{ y: [0, index === 0 ? -6 : 6, 0] }}
              transition={{
                duration: 8 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="public-panel rounded-[26px] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-on-surface">
                  {item.title}
                </p>
                <item.icon size={18} className="text-primary" weight="bold" />
              </div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </CanvasShell>
  );
});

const EditorCanvas = memo(function EditorCanvas() {
  return (
    <CanvasShell
      eyebrow="Editing flow"
      title="Updates without deck churn"
      footer="Publish"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_0.96fr]">
        <div className="public-panel rounded-[28px] p-6">
          <p className="text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
            Weekly note
          </p>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mt-4 rounded-[26px] border border-outline-variant bg-white px-5 py-5"
          >
            <p className="text-lg font-semibold tracking-[-0.03em] text-on-surface">
              Literacy checkpoint summary
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Attendance outreach is stabilizing. Department heads updated
              intervention notes this morning and the board narrative is ready
              for Monday&apos;s packet.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Board-ready", "Public-safe", "Owner assigned"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          {[
            [
              "Narrative edits",
              "Cabinet team updates progress notes directly in app",
            ],
            [
              "Status review",
              "The public view reflects the latest approved status",
            ],
            [
              "Board packet",
              "Leadership exports only when they want a handout",
            ],
          ].map(([title, description], index) => (
            <motion.div
              key={title}
              animate={{ x: [0, index % 2 === 0 ? 6 : -6, 0] }}
              transition={{
                duration: 7 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="public-panel rounded-[26px] p-5"
            >
              <p className="text-sm font-semibold text-on-surface">{title}</p>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </CanvasShell>
  );
});

const AuthCanvas = memo(function AuthCanvas() {
  return (
    <CanvasShell
      eyebrow="Secure access"
      title="Leadership workspace"
      footer="Protected"
    >
      <div className="grid gap-4">
        <div className="public-panel rounded-[28px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
                Sign-in path
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-on-surface">
                Email code, then route to the correct workspace
              </p>
            </div>
            <CheckCircle size={18} className="text-primary" weight="bold" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Identity", "School district email"],
              ["Verification", "Short-lived code"],
              ["Redirect", "Admin or district workspace"],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl bg-surface-container-low p-4"
              >
                <p className="text-sm font-semibold text-on-surface">{title}</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="public-panel rounded-[26px] p-5"
          >
            <p className="text-sm font-semibold text-on-surface">Auth notes</p>
            <div className="mt-4 space-y-3">
              {[
                "No passwords required for standard sign-in",
                "Reset flows preserve support-safe messaging",
                "Workspaces remain separated by subdomain rules",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-surface-container-low px-4 py-3"
                >
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="mt-0.5 text-primary"
                  />
                  <span className="text-sm leading-6 text-on-surface">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="public-panel rounded-[26px] p-5"
          >
            <p className="text-sm font-semibold text-on-surface">
              Session details
            </p>
            <div className="mt-5 space-y-4">
              {[
                ["Status", "Authenticated"],
                ["Workspace", "District dashboard"],
                ["Last event", "OTP verified"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </CanvasShell>
  );
});

export const ProductCanvas = memo(function ProductCanvas({
  mode,
  className = "",
}: ProductCanvasProps) {
  const canvases = {
    hero: <HeroCanvas />,
    analytics: <AnalyticsCanvas />,
    governance: <GovernanceCanvas />,
    editor: <EditorCanvas />,
    auth: <AuthCanvas />,
  };

  return <div className={className}>{canvases[mode]}</div>;
});

export const ProductVideoFrame = memo(function ProductVideoFrame({
  className = "",
  label,
  title,
  description,
}: ProductVideoFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`public-shadow-strong relative overflow-hidden rounded-[34px] border border-white/70 bg-white/92 p-4 backdrop-blur-sm ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative z-10 rounded-[28px] border border-outline-variant/70 bg-surface p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
          <div>
            <p className="public-kicker text-primary/70">{label}</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-on-surface">
              {title}
            </p>
          </div>
          <div className="rounded-full bg-surface-container-low px-4 py-2 text-[11px] font-label uppercase tracking-[0.24em] text-on-surface-variant">
            {description}
          </div>
        </div>
        <div className="overflow-hidden rounded-[24px] border border-outline-variant/70 bg-surface-container-low">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="aspect-[16/10] w-full object-cover"
          >
            <source src="/showreel.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </motion.div>
  );
});
