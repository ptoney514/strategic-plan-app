// Phase 4 placeholder content for the editorial one-pager template.
// These fixtures live here until a later phase adds admin-editable schema
// for district-level editorial content (hero copy, mid pull quote, CTA
// copy, quarterly review schedule). Keyed by organization slug with a
// generic fallback for unknown districts.

export interface EditorialNavAnchor {
  label: string;
  href: string;
}

export interface EditorialPullQuoteStat {
  label: string;
  value: string;
}

export interface EditorialFooterColumn {
  heading: string;
  items: { label: string; href?: string }[];
}

export interface EditorialContent {
  nav: {
    brandMark: string;
    eyebrow: string;
    title: string;
    titleItalic: string;
    anchors: EditorialNavAnchor[];
    ctaLabel: string;
  };
  hero: {
    eyebrow: string;
    eyebrowMeta?: string;
    headlinePrefix: string;
    headlineEmphasis: string;
    headlineSuffix: string;
    supporting: string;
    supportingEmphasis?: string;
  };
  fourCommitments: {
    headingPrefix: string;
    headingEmphasis: string;
  };
  pullQuote: {
    text: string;
    attribution: string;
    stats: EditorialPullQuoteStat[];
  };
  cta: {
    headline: string;
    body: string;
    buttonLabel: string;
    scheduleLabel?: string;
  };
  footer: {
    organizationName: string;
    tagline?: string;
    columns: EditorialFooterColumn[];
  };
}

export const DEFAULT_EDITORIAL_CONTENT: EditorialContent = {
  nav: {
    brandMark: "S",
    eyebrow: "Strategic Plan",
    title: "Progress ·",
    titleItalic: "2025–2028",
    anchors: [
      { label: "Overview", href: "#overview" },
      { label: "Objective 1", href: "#obj-1" },
      { label: "Objective 2", href: "#obj-2" },
      { label: "Objective 3", href: "#obj-3" },
      { label: "Objective 4", href: "#obj-4" },
    ],
    ctaLabel: "See progress",
  },
  hero: {
    eyebrow: "Progress Report",
    headlinePrefix: "Tracking the",
    headlineEmphasis: "commitments",
    headlineSuffix: "we made to our students.",
    supporting:
      "Every three years our district writes a plan for how we'll serve students, staff, and families. This is the story of what we committed to —",
    supportingEmphasis: "and an honest look at where we are today.",
  },
  fourCommitments: {
    headingPrefix: "Four areas.",
    headingEmphasis: "One plan.",
  },
  pullQuote: {
    text:
      "When students know their teachers and families see real progress, the whole system works better.",
    attribution: "— District leadership",
    stats: [
      { label: "Schools", value: "—" },
      { label: "Students served", value: "—" },
      { label: "Years in cycle", value: "3" },
    ],
  },
  cta: {
    headline: "Stay with us for the next update.",
    body: "We review this plan every quarter. Join our update list to see the next set of numbers when they post.",
    buttonLabel: "Join the update list",
    scheduleLabel: "Next review · Fall 2026",
  },
  footer: {
    organizationName: "District Strategic Plan",
    tagline: "Built on Stratadash",
    columns: [
      {
        heading: "Plan",
        items: [
          { label: "Overview", href: "#overview" },
          { label: "Objectives", href: "#obj-1" },
        ],
      },
      {
        heading: "About",
        items: [
          { label: "Read the full plan" },
          { label: "Contact district office" },
        ],
      },
    ],
  },
};

const WESTSIDE_CONTENT: EditorialContent = {
  nav: {
    brandMark: "W",
    eyebrow: "Westside Community Schools",
    title: "Strategic Plan ·",
    titleItalic: "2025–2028",
    anchors: [
      { label: "Overview", href: "#overview" },
      { label: "Students", href: "#obj-1" },
      { label: "Staff", href: "#obj-2" },
      { label: "Community", href: "#obj-3" },
      { label: "Operations", href: "#obj-4" },
    ],
    ctaLabel: "See progress",
  },
  hero: {
    eyebrow: "2025–26 Progress Report",
    eyebrowMeta: "· Updated April 2026",
    headlinePrefix: "How we're doing on the",
    headlineEmphasis: "promises",
    headlineSuffix: "we made to our students.",
    supporting:
      "Every three years, Westside writes a plan for how we'll serve our students, staff, and families. This is the story of what we committed to",
    supportingEmphasis: "— and an honest look at where we are today.",
  },
  fourCommitments: {
    headingPrefix: "Four areas.",
    headingEmphasis: "One plan.",
  },
  pullQuote: {
    text:
      "When my daughter's teacher said 'I noticed she's been struggling with fractions, let's talk,' I knew the school was actually paying attention.",
    attribution: "— Westside parent, Paddock Road Elementary",
    stats: [
      { label: "Schools", value: "10" },
      { label: "Students served", value: "5,900" },
      { label: "Years in plan cycle", value: "3" },
    ],
  },
  cta: {
    headline: "Stay with us for the next update.",
    body: "Westside reviews this plan every quarter with the board. Our next refresh posts here in fall 2026 — join the update list to see what moved.",
    buttonLabel: "Join the update list",
    scheduleLabel: "Next review · Fall 2026",
  },
  footer: {
    organizationName: "Westside Community Schools",
    tagline: "Strategic Plan 2025–2028",
    columns: [
      {
        heading: "The plan",
        items: [
          { label: "Overview", href: "#overview" },
          { label: "Students", href: "#obj-1" },
          { label: "Staff", href: "#obj-2" },
          { label: "Community", href: "#obj-3" },
          { label: "Operations", href: "#obj-4" },
        ],
      },
      {
        heading: "Westside",
        items: [
          { label: "District office" },
          { label: "Board of Education" },
          { label: "Annual report" },
        ],
      },
    ],
  },
};

const FIXTURES_BY_SLUG: Record<string, EditorialContent> = {
  westside: WESTSIDE_CONTENT,
};

export function getEditorialContent(
  slug: string | undefined | null,
): EditorialContent {
  if (!slug) return DEFAULT_EDITORIAL_CONTENT;
  return FIXTURES_BY_SLUG[slug] ?? DEFAULT_EDITORIAL_CONTENT;
}
