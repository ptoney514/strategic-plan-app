import type { StatusValue } from '@/components/public-dashboard/StatusChip';
import type { SparklinePoint } from '@/components/public-dashboard/SignatureMetricCard';

export interface ObjectiveStat {
  value: string;
  unit?: string;
  label: string;
}

export interface ObjectivePullQuote {
  text: string;
  attribution: string;
}

export interface ObjectiveSignatureMetric {
  title: string;
  displayValue: string;
  displayUnit?: string;
  supportingLine: string;
  accentColor: string;
  target: number;
  targetLabel: string;
  series: SparklinePoint[];
  status: StatusValue;
}

export interface ObjectiveHonestFramingPanel {
  label: string;
  title: string;
  titleEmphasis?: string;
  body: string;
}

export interface ObjectiveHonestFraming {
  problem: ObjectiveHonestFramingPanel;
  action: ObjectiveHonestFramingPanel;
  timeline: ObjectiveHonestFramingPanel;
}

export interface ObjectiveNarrative {
  eyebrow: string;
  titlePrefix: string;
  titleEmphasis: string;
  titleSuffix?: string;
  accentColor: string;
  narrative: string;
  pullQuote?: ObjectivePullQuote;
  stats: [ObjectiveStat, ObjectiveStat, ObjectiveStat];
  signatureMetric: ObjectiveSignatureMetric;
  honestFraming?: ObjectiveHonestFraming;
}

const OBJ_01_SERIES: SparklinePoint[] = [
  { year: "'21", value: 62 },
  { year: "'22", value: 65 },
  { year: "'23", value: 67 },
  { year: "'24", value: 69 },
  { year: "'25", value: 70 },
  { year: "'26", value: 72 },
];

const OBJ_02_SERIES: SparklinePoint[] = [
  { year: "'21", value: 82 },
  { year: "'22", value: 85 },
  { year: "'23", value: 87 },
  { year: "'24", value: 88 },
  { year: "'25", value: 90 },
  { year: "'26", value: 92 },
];

const OBJ_03_SERIES: SparklinePoint[] = [
  { year: "'21", value: 3.4 },
  { year: "'22", value: 3.5 },
  { year: "'23", value: 3.7 },
  { year: "'24", value: 3.8 },
  { year: "'25", value: 3.8 },
  { year: "'26", value: 4.1 },
];

const OBJ_04_SERIES: SparklinePoint[] = [
  { year: "'21", value: 9.8 },
  { year: "'22", value: 10.1 },
  { year: "'23", value: 10.5 },
  { year: "'24", value: 10.8 },
  { year: "'25", value: 11.6 },
  { year: "'26", value: 12.4 },
];

const OBJ_01: ObjectiveNarrative = {
  eyebrow: 'OBJECTIVE 01',
  titlePrefix: 'Student Achievement &',
  titleEmphasis: 'Well-being.',
  accentColor: 'var(--o1)',
  narrative:
    "Every student, every school. Six goals track how we're doing on literacy, math, science, growth mindset, attendance, and early childhood readiness — from kindergarten through grade 12.",
  pullQuote: {
    text: "We're not waiting until 3rd grade to figure out who's struggling. Kindergarten teachers flag it in week three now.",
    attribution: 'Ms. Alvarez, K-5 Literacy Coach',
  },
  stats: [
    { value: '72', unit: '%', label: 'reading proficiency' },
    { value: '4.5', unit: '/5', label: 'growth mindset score' },
    { value: '100', label: 'NDE AQuESTT, 2nd yr running' },
  ],
  signatureMetric: {
    title: 'ELA / Reading Proficiency',
    displayValue: '72',
    displayUnit: '%',
    supportingLine: 'Up from 65% baseline · Target 85%',
    accentColor: 'var(--o1)',
    target: 85,
    targetLabel: 'TARGET · 85%',
    series: OBJ_01_SERIES,
    status: 'in-progress',
  },
};

const OBJ_02: ObjectiveNarrative = {
  eyebrow: 'OBJECTIVE 02',
  titlePrefix: 'Supported & Engaged',
  titleEmphasis: 'Staff.',
  accentColor: 'var(--o2)',
  narrative:
    "Attract, develop, and retain the teachers and staff our students deserve. Retention is up for a second year, engagement is above target, and every new teacher was paired with a mentor by day ten.",
  pullQuote: {
    text: "I almost left the profession last spring. The mentor program is the reason I'm back.",
    attribution: '3rd-year teacher, Westside Middle',
  },
  stats: [
    { value: '92', unit: '%', label: 'certified staff retained' },
    { value: '4.3', unit: '/5', label: 'staff engagement score' },
    { value: '100', unit: '%', label: 'new teachers mentored by day 10' },
  ],
  signatureMetric: {
    title: 'Certified Staff Retention',
    displayValue: '92',
    displayUnit: '%',
    supportingLine: 'Up from 88% baseline · Target ≥ 90%',
    accentColor: 'var(--o2)',
    target: 90,
    targetLabel: 'TARGET · 90%',
    series: OBJ_02_SERIES,
    status: 'on-track',
  },
};

const OBJ_03: ObjectiveNarrative = {
  eyebrow: 'OBJECTIVE 03',
  titlePrefix: 'Community, Collaboration &',
  titleEmphasis: 'Partnerships.',
  accentColor: 'var(--o3)',
  narrative:
    "Schools don't raise kids alone. Our strongest programs — from the Boys & Girls Club afterschool site to the bilingual family nights at Rockbrook — are built with partners who show up every week.",
  pullQuote: {
    text: "My family didn't feel like outsiders at the school anymore — somebody actually called me in Spanish.",
    attribution: 'Carmen Delgado, parent of two',
  },
  stats: [
    { value: '47', label: 'active partner orgs' },
    { value: '124', label: 'family events held this year' },
    { value: '4.1', unit: '/5', label: 'family satisfaction' },
  ],
  signatureMetric: {
    title: 'Family Satisfaction Score',
    displayValue: '4.1',
    displayUnit: '/5',
    supportingLine: 'Up from 3.8 last year · Target 4.0',
    accentColor: 'var(--o3)',
    target: 4.0,
    targetLabel: 'TARGET · 4.0',
    series: OBJ_03_SERIES,
    status: 'on-track',
  },
};

const OBJ_04: ObjectiveNarrative = {
  eyebrow: 'OBJECTIVE 04',
  titlePrefix: 'Finance, Safety &',
  titleEmphasis: 'Infrastructure.',
  accentColor: 'var(--o4)',
  narrative:
    'Deferred-maintenance costs have outpaced funding for two years. Safety drills are at 100% and the financial audit is clean for a 12th straight year — but the facility backlog is the one number we owe you an honest answer on.',
  pullQuote: {
    text: "We don't bury the hard numbers. The bond plan is scoped, the sequencing is real, and families deserve to see it clearly.",
    attribution: 'Dr. Henderson, Chief Financial Officer',
  },
  stats: [
    { value: '$12.4', unit: 'M', label: 'deferred maintenance backlog' },
    { value: '100', unit: '%', label: 'safety drills completed' },
    { value: '12', label: 'straight years clean audit' },
  ],
  signatureMetric: {
    title: 'Deferred-Maintenance Backlog',
    displayValue: '$12.4',
    displayUnit: 'M',
    supportingLine: 'Up from $10.8M baseline · Target ≤ $10.5M',
    accentColor: 'var(--o4)',
    target: 10.5,
    targetLabel: 'TARGET · $10.5M',
    series: OBJ_04_SERIES,
    status: 'off-track',
  },
  honestFraming: {
    problem: {
      label: 'The problem',
      title: 'Costs are running',
      titleEmphasis: 'ahead',
      body: 'Materials & labor up ~14% in 2 yrs; 4 buildings are 45+ years old.',
    },
    action: {
      label: "What we're doing",
      title: 'A',
      titleEmphasis: '2026 bond plan,',
      body: '5-yr capital plan drafted. HVAC, roofing, secure-entry sequenced. Board vote: June 2026.',
    },
    timeline: {
      label: "When you'll see change",
      title: 'Construction starts',
      titleEmphasis: 'summer 2026.',
      body: 'Westside High HVAC first, Paddock Road entries next — if bond passes.',
    },
  },
};

export const OBJECTIVE_FIXTURES: Record<string, ObjectiveNarrative> = {
  '1': OBJ_01,
  '2': OBJ_02,
  '3': OBJ_03,
  '4': OBJ_04,
};

const GENERIC_FALLBACK: ObjectiveNarrative = {
  eyebrow: 'OBJECTIVE',
  titlePrefix: 'A commitment to',
  titleEmphasis: 'our students.',
  accentColor: 'var(--purple)',
  narrative:
    "This objective is part of the district's strategic plan. Detailed narrative content will be added once editorial content is wired to the plan schema.",
  stats: [
    { value: '—', label: 'awaiting data' },
    { value: '—', label: 'awaiting data' },
    { value: '—', label: 'awaiting data' },
  ],
  signatureMetric: {
    title: 'Signature metric',
    displayValue: '—',
    supportingLine: 'Awaiting data',
    accentColor: 'var(--purple)',
    target: 0,
    targetLabel: 'TARGET',
    series: [{ year: 'now', value: 0 }],
    status: 'not-started',
  },
};

export function getObjectiveNarrative(
  goalNumber: string | undefined
): ObjectiveNarrative {
  if (!goalNumber) return GENERIC_FALLBACK;
  return OBJECTIVE_FIXTURES[goalNumber] ?? GENERIC_FALLBACK;
}

const STATUS_MAP: Record<string, StatusValue> = {
  on_target: 'on-track',
  on_track: 'on-track',
  exceeding: 'on-track',
  in_progress: 'in-progress',
  at_risk: 'in-progress',
  critical: 'off-track',
  off_track: 'off-track',
  completed: 'completed',
  complete: 'completed',
};

export function normalizeToStatusValue(status?: string): StatusValue {
  if (!status) return 'not-started';
  const key = status.toLowerCase().replace(/\s+/g, '_');
  return STATUS_MAP[key] ?? 'not-started';
}

export function isHonestFramingStatus(status?: string): boolean {
  const s = normalizeToStatusValue(status);
  return s === 'off-track';
}
