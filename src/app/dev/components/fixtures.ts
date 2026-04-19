import type { SignatureMetricCardProps } from '@/components/public-dashboard/SignatureMetricCard';
import type { StatTileProps } from '@/components/public-dashboard/StatTile';
import type { TrendChipProps } from '@/components/public-dashboard/TrendChip';
import type { StatusChipProps } from '@/components/public-dashboard/StatusChip';
import type { AccordionGoalRowProps } from '@/components/public-dashboard/AccordionGoalRow';
import type { NestedSubGoalProps } from '@/components/public-dashboard/NestedSubGoal';

export const signatureMetricCardFixture: SignatureMetricCardProps = {
  eyebrow: 'Signature metric',
  title: 'ELA / Reading Proficiency',
  status: 'in-progress',
  displayValue: '72',
  displayUnit: '%',
  supportingLine: 'Up from 65% baseline · Target 85%',
  accentColor: '#2E5BD9',
  target: 85,
  targetLabel: 'TARGET · 85%',
  series: [
    { year: "'21", value: 62 },
    { year: "'22", value: 65 },
    { year: "'23", value: 67 },
    { year: "'24", value: 69 },
    { year: "'25", value: 70 },
    { year: "'26", value: 72 },
  ],
};

export const statTileCurrentFixture: StatTileProps = {
  label: 'Current',
  value: '72%',
};

export const statTileTargetFixture: StatTileProps = {
  label: 'Target',
  value: '85%',
  tone: 'muted',
};

export const trendChipFixtures: TrendChipProps[] = [
  { direction: 'up', label: '7 pts vs baseline' },
  { direction: 'down', label: '0.3 pts YoY' },
  { direction: 'flat', label: 'flat vs last year' },
];

export const statusChipFixtures: StatusChipProps[] = [
  { status: 'on-track' },
  { status: 'in-progress' },
  { status: 'off-track' },
  { status: 'not-started' },
  { status: 'completed' },
];

export const accordionGoalRowOpenFixture: Omit<AccordionGoalRowProps, 'children'> = {
  id: 'goal-1-1',
  badgeText: '1.1',
  title: 'ELA / Reading Proficiency',
  description: 'State assessment proficiency, all grade bands',
  currentValue: '72',
  targetValue: '85%',
  currentUnit: 'proficiency',
  status: 'in-progress',
  statusLabel: 'In progress',
  accentColor: 'var(--o1)',
  defaultOpen: true,
};

export const accordionGoalRowCollapsedFixtures: Array<
  Omit<AccordionGoalRowProps, 'children'>
> = [
  {
    id: 'goal-1-2',
    badgeText: '1.2',
    title: 'Mathematics Achievement',
    description: 'Grade 3–8 state assessment',
    currentValue: '65',
    targetValue: '80%',
    currentUnit: 'proficiency',
    status: 'in-progress',
  },
  {
    id: 'goal-1-3',
    badgeText: '1.3',
    title: 'Science Proficiency',
    description: 'New baseline assessment — Fall 2026',
    currentValue: '—',
    targetValue: '70%',
    currentUnit: 'awaiting baseline',
    status: 'not-started',
  },
  {
    id: 'goal-1-4',
    badgeText: '1.4',
    title: 'Growth Mindset Development',
    description: 'Panorama SEL survey, grades 3–12',
    currentValue: '4.5',
    targetValue: '4.2 of 5',
    currentUnit: 'composite',
    status: 'on-track',
  },
];

export const nestedSubGoalFixtures: NestedSubGoalProps[] = [
  {
    badgeText: '3.1.2.1',
    title: 'Faith-community partners',
    description: 'Weekend meal program, English-learner outreach',
    currentValue: '9',
    targetValue: '10',
    currentUnit: 'partners',
    status: 'on-track',
  },
  {
    badgeText: '3.1.2.2',
    title: 'Small-business mentorship',
    description: 'Career-day visits and shadow days for grades 9–12',
    currentValue: '14',
    targetValue: '18',
    currentUnit: 'businesses',
    status: 'in-progress',
  },
];
