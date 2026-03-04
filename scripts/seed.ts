/**
 * Neon/Drizzle Seed Script
 *
 * Populates the Neon database with production-like test data.
 * Replaces the old seed.sql + create-test-users.sh workflow.
 *
 * Usage:
 *   npm run db:seed        # seed only (assumes migrations applied)
 *   npm run db:seed:fresh  # run migrations then seed
 *
 * Requires .env.local with DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
 */

import { guardAgainstProduction } from "./lib/db-guard.js";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sql, count } from "drizzle-orm";
import * as schema from "../api/lib/schema/index.js";

// Abort early if DATABASE_URL points to production
guardAgainstProduction();

// ---------------------------------------------------------------------------
// Section 0: Standalone DB + Auth setup
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:5174";

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set. Check your .env.local file.");
  process.exit(1);
}
if (!BETTER_AUTH_SECRET) {
  console.error(
    "ERROR: BETTER_AUTH_SECRET is not set. Check your .env.local file.",
  );
  process.exit(1);
}

const dbUrl = new URL(DATABASE_URL);
console.log(`Target database: ${dbUrl.hostname}${dbUrl.pathname}\n`);

if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  console.error(
    "ERROR: NODE_ENV is 'production'. Refusing to seed.\n" +
    "       Use --force to override this safety check.",
  );
  process.exit(1);
}

const neonSql = neon(DATABASE_URL);
const db = drizzle(neonSql, { schema });

const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      isSystemAdmin: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

// ---------------------------------------------------------------------------
// Deterministic UUIDs (preserved from old seed for consistency)
// ---------------------------------------------------------------------------

const ORG_EASTSIDE = "a0000000-0000-0000-0000-000000000001";
const ORG_WESTSIDE = "a0000000-0000-0000-0000-000000000002";

const PLAN_EASTSIDE = "c0000000-0000-0000-0000-000000000001";
const PLAN_WESTSIDE = "c0000000-0000-0000-0000-000000000002";
const PLAN_EASTSIDE_DRAFT = "c0000000-0000-0000-0000-000000000003";
const PLAN_WESTSIDE_DRAFT = "c0000000-0000-0000-0000-000000000004";

// Widget UUIDs — Eastside (E1–E10)
const WIDGET_E1 = "d0000000-0000-0000-0000-000000000001";
const WIDGET_E2 = "d0000000-0000-0000-0000-000000000002";
const WIDGET_E3 = "d0000000-0000-0000-0000-000000000003";
const WIDGET_E4 = "d0000000-0000-0000-0000-000000000004";
const WIDGET_E5 = "d0000000-0000-0000-0000-000000000005";
const WIDGET_E6 = "d0000000-0000-0000-0000-000000000006";
const WIDGET_E7 = "d0000000-0000-0000-0000-000000000007";
const WIDGET_E8 = "d0000000-0000-0000-0000-000000000008";
const WIDGET_E9 = "d0000000-0000-0000-0000-000000000009";
const WIDGET_E10 = "d0000000-0000-0000-0000-000000000010";

// Widget UUIDs — Westside (W1–W3)
const WIDGET_W1 = "d0000000-0000-0001-0000-000000000001";
const WIDGET_W2 = "d0000000-0000-0001-0000-000000000002";
const WIDGET_W3 = "d0000000-0000-0001-0000-000000000003";

// Widget UUIDs — Westside Goal Widgets (WG1–WG16)
const WIDGET_WG1 = "d0000000-0000-0002-0000-000000000001";
const WIDGET_WG2 = "d0000000-0000-0002-0000-000000000002";
const WIDGET_WG3 = "d0000000-0000-0002-0000-000000000003";
const WIDGET_WG4 = "d0000000-0000-0002-0000-000000000004";
const WIDGET_WG5 = "d0000000-0000-0002-0000-000000000005";
const WIDGET_WG6 = "d0000000-0000-0002-0000-000000000006";
const WIDGET_WG7 = "d0000000-0000-0002-0000-000000000007";
const WIDGET_WG8 = "d0000000-0000-0002-0000-000000000008";
const WIDGET_WG9 = "d0000000-0000-0002-0000-000000000009";
const WIDGET_WG10 = "d0000000-0000-0002-0000-000000000010";
const WIDGET_WG11 = "d0000000-0000-0002-0000-000000000011";
const WIDGET_WG12 = "d0000000-0000-0002-0000-000000000012";
const WIDGET_WG13 = "d0000000-0000-0002-0000-000000000013";
const WIDGET_WG14 = "d0000000-0000-0002-0000-000000000014";
const WIDGET_WG15 = "d0000000-0000-0002-0000-000000000015";
const WIDGET_WG16 = "d0000000-0000-0002-0000-000000000016";

// Widget UUIDs — Eastside Goal Widgets (EG1–EG10)
const WIDGET_EG1 = "d0000000-0000-0003-0000-000000000001";
const WIDGET_EG2 = "d0000000-0000-0003-0000-000000000002";
const WIDGET_EG3 = "d0000000-0000-0003-0000-000000000003";
const WIDGET_EG4 = "d0000000-0000-0003-0000-000000000004";
const WIDGET_EG5 = "d0000000-0000-0003-0000-000000000005";
const WIDGET_EG6 = "d0000000-0000-0003-0000-000000000006";
const WIDGET_EG7 = "d0000000-0000-0003-0000-000000000007";
const WIDGET_EG8 = "d0000000-0000-0003-0000-000000000008";
const WIDGET_EG9 = "d0000000-0000-0003-0000-000000000009";
const WIDGET_EG10 = "d0000000-0000-0003-0000-000000000010";

// CCL district
const ORG_CCL = "a0000000-0000-0000-0000-000000000003";
const PLAN_CCL = "c0000000-0000-0000-0000-000000000005";

// Widget UUIDs — CCL (C1–C5)
const WIDGET_C1 = "d0000000-0000-0004-0000-000000000001";
const WIDGET_C2 = "d0000000-0000-0004-0000-000000000002";
const WIDGET_C3 = "d0000000-0000-0004-0000-000000000003";
const WIDGET_C4 = "d0000000-0000-0004-0000-000000000004";
const WIDGET_C5 = "d0000000-0000-0004-0000-000000000005";

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Seeding Neon database...\n");

  // -------------------------------------------------------------------------
  // Section 1: TRUNCATE all tables (CASCADE) — clean slate
  // -------------------------------------------------------------------------
  console.log("1. Truncating all tables...");
  await db.execute(sql`TRUNCATE TABLE
      widgets,
      staged_goals,
      import_sessions,
      contact_submissions,
      goals,
      plans,
      organization_invitations,
      organization_members,
      organizations,
      session,
      account,
      verification,
      "user"
    CASCADE`);
  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 2: Insert organizations (districts)
  // -------------------------------------------------------------------------
  console.log("2. Inserting organizations...");
  await db.insert(schema.organizations).values([
    {
      id: ORG_EASTSIDE,
      name: "Eastside School District",
      slug: "eastside",
      entityType: "district",
      entityLabel: "District",
      logoUrl:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7",
      primaryColor: "#1e40af",
      secondaryColor: "#10b981",
      adminEmail: "admin@eastside.edu",
      isPublic: true,
      isActive: true,
      templateMode: "launch-traction",
      dashboardTemplate: "launch-traction",
      onboardingCompleted: true,
      tagline: "Empowering Every Student to Succeed",
    },
    {
      id: ORG_WESTSIDE,
      name: "Westside Community Schools",
      slug: "westside",
      entityType: "district",
      entityLabel: "District",
      logoUrl: "",
      primaryColor: "#C03537",
      secondaryColor: "#000000",
      adminEmail: "admin@westside.edu",
      isPublic: true,
      isActive: true,
      templateMode: "hierarchical",
      dashboardTemplate: "hierarchical",
      onboardingCompleted: true,
      tagline: "Community. Innovation. Excellence.",
    },
    {
      id: ORG_CCL,
      name: "College, Career and Life Readiness Center",
      slug: "ccl",
      entityType: "center",
      entityLabel: "Center",
      logoUrl: "",
      primaryColor: "#C62828",
      secondaryColor: "#1a1a2e",
      adminEmail: "weichelmark22@gmail.com",
      isPublic: true,
      isActive: true,
      templateMode: "launch-traction",
      dashboardTemplate: "launch-traction",
      onboardingCompleted: true,
      tagline: "Preparing Every Student for What's Next",
    },
  ]);
  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 3: Insert plans (active + draft)
  // -------------------------------------------------------------------------
  console.log("3. Inserting plans...");
  await db.insert(schema.plans).values([
    {
      id: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      name: "Eastside Strategic Plan 2025-2027",
      slug: "strategic-plan-2025-2027",
      typeLabel: "Strategic",
      description: "Eastside School District 2025 Strategic Plan",
      isPublic: true,
      isActive: true,
    },
    {
      id: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      name: "Westside Strategic Plan 2025-2027",
      slug: "strategic-plan-2025-2027",
      typeLabel: "Strategic",
      description:
        "Westside Community Schools Strategic Plan for 2025-2027",
      isPublic: true,
      isActive: true,
    },
    {
      id: PLAN_EASTSIDE_DRAFT,
      organizationId: ORG_EASTSIDE,
      name: "Eastside 2026-2028 Draft",
      slug: "draft-2026-2028",
      typeLabel: "Strategic",
      description: "Draft strategic plan for the 2026-2028 cycle",
      isPublic: false,
      isActive: false,
    },
    {
      id: PLAN_WESTSIDE_DRAFT,
      organizationId: ORG_WESTSIDE,
      name: "Westside Equity Plan 2026",
      slug: "equity-plan-2026",
      typeLabel: "Equity",
      description: "Westside equity-focused plan for 2026",
      isPublic: false,
      isActive: false,
    },
    {
      id: PLAN_CCL,
      organizationId: ORG_CCL,
      name: "CCL Strategic Plan 2025-2027",
      slug: "strategic-plan-2025-2027",
      typeLabel: "Strategic",
      description: "College, Career and Life Readiness Center Strategic Plan",
      isPublic: true,
      isActive: true,
    },
  ]);
  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 4: Insert goals (V2-compatible statuses + progress)
  // -------------------------------------------------------------------------
  console.log("5. Inserting goals...");

  // =========================================================================
  // WESTSIDE GOALS (23 total: 4 objectives + 14 strategies + 5 sub-goals)
  // =========================================================================

  // --- Westside Objective 1: Student Achievement & Well-being ---
  await db.insert(schema.goals).values({
    id: "b0000001-0000-0000-0000-000000000000",
    planId: PLAN_WESTSIDE,
    organizationId: ORG_WESTSIDE,
    goalNumber: "1",
    title: "Student Achievement & Well-being",
    description:
      "Ensure all students achieve academic excellence and develop social-emotional well-being",
    level: 0,
    orderPosition: 1,
    status: "in_progress",
    overallProgress: "68.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Westside Objective 1
  await db.insert(schema.goals).values([
    {
      id: "b0000001-0001-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0000-0000-0000-000000000000",
      goalNumber: "1.1",
      title: "ELA/Reading Proficiency",
      description:
        "All students will meet or exceed state standards in English Language Arts and Reading",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "72.00",
    },
    {
      id: "b0000001-0002-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0000-0000-0000-000000000000",
      goalNumber: "1.2",
      title: "Mathematics Achievement",
      description:
        "All students will demonstrate proficiency in mathematics at or above grade level",
      level: 1,
      orderPosition: 2,
      status: "in_progress",
      overallProgress: "65.00",
    },
    {
      id: "b0000001-0003-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0000-0000-0000-000000000000",
      goalNumber: "1.3",
      title: "Science Proficiency",
      description:
        "Students will develop scientific literacy and meet state science standards",
      level: 1,
      orderPosition: 3,
      status: "not_started",
      overallProgress: "0.00",
    },
    {
      id: "b0000001-0004-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0000-0000-0000-000000000000",
      goalNumber: "1.4",
      title: "Growth Mindset Development",
      description: "Foster resilience and growth mindset in all students",
      level: 1,
      orderPosition: 4,
      status: "completed",
      overallProgress: "100.00",
    },
    {
      id: "b0000001-0005-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0000-0000-0000-000000000000",
      goalNumber: "1.5",
      title: "Student Engagement",
      description:
        "Increase student engagement and reduce chronic absenteeism",
      level: 1,
      orderPosition: 5,
      status: "on_hold",
      overallProgress: "35.00",
    },
    {
      id: "b0000001-0006-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0000-0000-0000-000000000000",
      goalNumber: "1.6",
      title: "Early Childhood Success",
      description:
        "Ensure kindergarten readiness and early elementary achievement",
      level: 1,
      orderPosition: 6,
      status: "in_progress",
      overallProgress: "80.00",
    },
  ]);

  // Sub-goals for Goal 1.1 (ELA/Reading)
  await db.insert(schema.goals).values([
    {
      id: "b0000001-0001-0001-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0001-0000-0000-000000000000",
      goalNumber: "1.1.1",
      title: "K-2 Reading Foundation",
      description:
        "Establish strong reading foundations in grades K-2 with 90% meeting benchmarks",
      level: 2,
      orderPosition: 1,
      status: "completed",
      overallProgress: "95.00",
    },
    {
      id: "b0000001-0001-0002-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0001-0000-0000-000000000000",
      goalNumber: "1.1.2",
      title: "Grade 3-5 Reading Comprehension",
      description:
        "Improve reading comprehension and fluency in intermediate grades",
      level: 2,
      orderPosition: 2,
      status: "in_progress",
      overallProgress: "60.00",
    },
    {
      id: "b0000001-0001-0003-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0001-0000-0000-000000000000",
      goalNumber: "1.1.3",
      title: "Middle School Literacy",
      description:
        "Advance literacy skills across content areas in grades 6-8",
      level: 2,
      orderPosition: 3,
      status: "in_progress",
      overallProgress: "55.00",
    },
  ]);

  // Sub-goals for Goal 1.2 (Mathematics)
  await db.insert(schema.goals).values([
    {
      id: "b0000001-0002-0001-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0002-0000-0000-000000000000",
      goalNumber: "1.2.1",
      title: "Elementary Math Fundamentals",
      description:
        "Build strong number sense and computational skills in K-5",
      level: 2,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "70.00",
    },
    {
      id: "b0000001-0002-0002-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000001-0002-0000-0000-000000000000",
      goalNumber: "1.2.2",
      title: "Algebraic Thinking",
      description: "Develop algebraic reasoning and problem-solving skills",
      level: 2,
      orderPosition: 2,
      status: "not_started",
      overallProgress: "0.00",
    },
  ]);

  // --- Westside Objective 2: Educational Excellence & Innovation ---
  await db.insert(schema.goals).values({
    id: "b0000002-0000-0000-0000-000000000000",
    planId: PLAN_WESTSIDE,
    organizationId: ORG_WESTSIDE,
    goalNumber: "2",
    title: "Educational Excellence & Innovation",
    description:
      "Provide high-quality instruction and innovative learning experiences for all students",
    level: 0,
    orderPosition: 2,
    status: "in_progress",
    overallProgress: "55.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Westside Objective 2
  await db.insert(schema.goals).values([
    {
      id: "b0000002-0001-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000002-0000-0000-0000-000000000000",
      goalNumber: "2.1",
      title: "Instructional Quality",
      description:
        "Deliver evidence-based, high-quality instruction aligned to standards",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "45.00",
    },
    {
      id: "b0000002-0002-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000002-0000-0000-0000-000000000000",
      goalNumber: "2.2",
      title: "Technology Integration",
      description:
        "Effectively integrate technology to enhance learning outcomes",
      level: 1,
      orderPosition: 2,
      status: "completed",
      overallProgress: "100.00",
    },
    {
      id: "b0000002-0003-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000002-0000-0000-0000-000000000000",
      goalNumber: "2.3",
      title: "Professional Development",
      description:
        "Support continuous professional growth for all educators",
      level: 1,
      orderPosition: 3,
      status: "in_progress",
      overallProgress: "60.00",
    },
  ]);

  // --- Westside Objective 3: Safe & Supportive Learning Environment (NEW) ---
  await db.insert(schema.goals).values({
    id: "b0000003-0000-0000-0000-000000000000",
    planId: PLAN_WESTSIDE,
    organizationId: ORG_WESTSIDE,
    goalNumber: "3",
    title: "Safe & Supportive Learning Environment",
    description:
      "Create and maintain safe, healthy, and supportive learning environments for all students",
    level: 0,
    orderPosition: 3,
    status: "in_progress",
    overallProgress: "42.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Westside Objective 3
  await db.insert(schema.goals).values([
    {
      id: "b0000003-0001-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000003-0000-0000-0000-000000000000",
      goalNumber: "3.1",
      title: "School Safety & Climate",
      description:
        "Implement comprehensive safety protocols and positive school climate initiatives",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "50.00",
    },
    {
      id: "b0000003-0002-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000003-0000-0000-0000-000000000000",
      goalNumber: "3.2",
      title: "Mental Health Services",
      description:
        "Expand access to mental health and counseling services for all students",
      level: 1,
      orderPosition: 2,
      status: "not_started",
      overallProgress: "10.00",
    },
    {
      id: "b0000003-0003-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000003-0000-0000-0000-000000000000",
      goalNumber: "3.3",
      title: "Family & Community Engagement",
      description:
        "Strengthen partnerships with families and community organizations",
      level: 1,
      orderPosition: 3,
      status: "in_progress",
      overallProgress: "65.00",
    },
  ]);

  // --- Westside Objective 4: Operational Excellence (NEW) ---
  await db.insert(schema.goals).values({
    id: "b0000004-0000-0000-0000-000000000000",
    planId: PLAN_WESTSIDE,
    organizationId: ORG_WESTSIDE,
    goalNumber: "4",
    title: "Operational Excellence",
    description:
      "Ensure efficient, transparent, and accountable operations across the district",
    level: 0,
    orderPosition: 4,
    status: "not_started",
    overallProgress: "15.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Westside Objective 4
  await db.insert(schema.goals).values([
    {
      id: "b0000004-0001-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000004-0000-0000-0000-000000000000",
      goalNumber: "4.1",
      title: "Fiscal Responsibility",
      description:
        "Maintain fiscal responsibility and transparent budget management",
      level: 1,
      orderPosition: 1,
      status: "not_started",
      overallProgress: "0.00",
    },
    {
      id: "b0000004-0002-0000-0000-000000000000",
      planId: PLAN_WESTSIDE,
      organizationId: ORG_WESTSIDE,
      parentId: "b0000004-0000-0000-0000-000000000000",
      goalNumber: "4.2",
      title: "Facilities Improvement",
      description:
        "Upgrade and maintain district facilities to support modern learning",
      level: 1,
      orderPosition: 2,
      status: "on_hold",
      overallProgress: "20.00",
    },
  ]);

  // =========================================================================
  // EASTSIDE GOALS (16 total: 4 objectives + 8 strategies + 4 sub-goals)
  // =========================================================================

  // --- Eastside Objective 1: College & Career Readiness ---
  await db.insert(schema.goals).values({
    id: "b0001001-0000-0000-0000-000000000000",
    planId: PLAN_EASTSIDE,
    organizationId: ORG_EASTSIDE,
    goalNumber: "1",
    title: "College & Career Readiness",
    description:
      "Prepare all students for success in college, career, and life",
    level: 0,
    orderPosition: 1,
    status: "in_progress",
    overallProgress: "72.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Eastside Objective 1
  await db.insert(schema.goals).values([
    {
      id: "b0001001-0001-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001001-0000-0000-0000-000000000000",
      goalNumber: "1.1",
      title: "Graduation Rate",
      description: "Achieve 95% four-year graduation rate",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "88.00",
    },
    {
      id: "b0001001-0002-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001001-0000-0000-0000-000000000000",
      goalNumber: "1.2",
      title: "College Enrollment",
      description: "Increase post-secondary enrollment to 80%",
      level: 1,
      orderPosition: 2,
      status: "in_progress",
      overallProgress: "56.00",
    },
  ]);

  // Sub-goals for Eastside Goal 1.1 (Graduation Rate)
  await db.insert(schema.goals).values([
    {
      id: "b0001001-0001-0001-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001001-0001-0000-0000-000000000000",
      goalNumber: "1.1.1",
      title: "9th Grade On-Track Indicator",
      description:
        "Monitor and improve 9th grade on-track rates to 90% by identifying at-risk students early",
      level: 2,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "78.00",
    },
    {
      id: "b0001001-0001-0002-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001001-0001-0000-0000-000000000000",
      goalNumber: "1.1.2",
      title: "Credit Recovery Programs",
      description:
        "Expand credit recovery and alternative pathway options for students behind on credits",
      level: 2,
      orderPosition: 2,
      status: "in_progress",
      overallProgress: "65.00",
    },
  ]);

  // --- Eastside Objective 2: Academic Excellence (NEW) ---
  await db.insert(schema.goals).values({
    id: "b0001002-0000-0000-0000-000000000000",
    planId: PLAN_EASTSIDE,
    organizationId: ORG_EASTSIDE,
    goalNumber: "2",
    title: "Academic Excellence",
    description:
      "Deliver rigorous, engaging instruction that prepares students for the future",
    level: 0,
    orderPosition: 2,
    status: "in_progress",
    overallProgress: "60.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Eastside Objective 2
  await db.insert(schema.goals).values([
    {
      id: "b0001002-0001-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001002-0000-0000-0000-000000000000",
      goalNumber: "2.1",
      title: "STEM Education",
      description:
        "Expand STEM programs and increase participation across all demographics",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "55.00",
    },
    {
      id: "b0001002-0002-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001002-0000-0000-0000-000000000000",
      goalNumber: "2.2",
      title: "Literacy Across Content Areas",
      description:
        "Implement cross-curricular literacy strategies in all subjects",
      level: 1,
      orderPosition: 2,
      status: "completed",
      overallProgress: "92.00",
    },
  ]);

  // Sub-goals for Eastside Goal 2.1 (STEM Education)
  await db.insert(schema.goals).values([
    {
      id: "b0001002-0001-0001-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001002-0001-0000-0000-000000000000",
      goalNumber: "2.1.1",
      title: "Computer Science Pathways",
      description:
        "Launch K-12 computer science curriculum with AP CS offerings at all high schools",
      level: 2,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "45.00",
    },
    {
      id: "b0001002-0001-0002-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001002-0001-0000-0000-000000000000",
      goalNumber: "2.1.2",
      title: "STEM Teacher Development",
      description:
        "Provide ongoing STEM professional development and industry partnership opportunities",
      level: 2,
      orderPosition: 2,
      status: "not_started",
      overallProgress: "0.00",
    },
  ]);

  // --- Eastside Objective 3: Community Partnerships (NEW) ---
  await db.insert(schema.goals).values({
    id: "b0001003-0000-0000-0000-000000000000",
    planId: PLAN_EASTSIDE,
    organizationId: ORG_EASTSIDE,
    goalNumber: "3",
    title: "Community Partnerships",
    description:
      "Build strong community partnerships that enrich student learning and development",
    level: 0,
    orderPosition: 3,
    status: "not_started",
    overallProgress: "20.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Eastside Objective 3
  await db.insert(schema.goals).values([
    {
      id: "b0001003-0001-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001003-0000-0000-0000-000000000000",
      goalNumber: "3.1",
      title: "Business Mentorship Programs",
      description:
        "Establish mentorship programs with local businesses and industry partners",
      level: 1,
      orderPosition: 1,
      status: "not_started",
      overallProgress: "5.00",
    },
    {
      id: "b0001003-0002-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001003-0000-0000-0000-000000000000",
      goalNumber: "3.2",
      title: "Parent Engagement Initiatives",
      description:
        "Increase parent participation through targeted outreach and programming",
      level: 1,
      orderPosition: 2,
      status: "in_progress",
      overallProgress: "35.00",
    },
  ]);

  // --- Eastside Objective 4: Equity & Access (NEW) ---
  await db.insert(schema.goals).values({
    id: "b0001004-0000-0000-0000-000000000000",
    planId: PLAN_EASTSIDE,
    organizationId: ORG_EASTSIDE,
    goalNumber: "4",
    title: "Equity & Access",
    description:
      "Ensure equitable access to high-quality education for every student regardless of background",
    level: 0,
    orderPosition: 4,
    status: "on_hold",
    overallProgress: "30.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under Eastside Objective 4
  await db.insert(schema.goals).values([
    {
      id: "b0001004-0001-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001004-0000-0000-0000-000000000000",
      goalNumber: "4.1",
      title: "Digital Equity",
      description:
        "Provide 1:1 devices and reliable internet access for all students",
      level: 1,
      orderPosition: 1,
      status: "on_hold",
      overallProgress: "25.00",
    },
    {
      id: "b0001004-0002-0000-0000-000000000000",
      planId: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      parentId: "b0001004-0000-0000-0000-000000000000",
      goalNumber: "4.2",
      title: "Multilingual Learner Support",
      description:
        "Expand services and resources for multilingual and English learner students",
      level: 1,
      orderPosition: 2,
      status: "in_progress",
      overallProgress: "40.00",
    },
  ]);

  // =========================================================================
  // CCL GOALS (9 total: 3 objectives + 6 strategies)
  // =========================================================================

  // --- CCL Objective 1: College & Career Pathways ---
  await db.insert(schema.goals).values({
    id: "b0002001-0000-0000-0000-000000000000",
    planId: PLAN_CCL,
    organizationId: ORG_CCL,
    goalNumber: "1",
    title: "College & Career Pathways",
    description:
      "Expand and strengthen pathways that connect students to college and career opportunities",
    level: 0,
    orderPosition: 1,
    status: "in_progress",
    overallProgress: "64.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under CCL Objective 1
  await db.insert(schema.goals).values([
    {
      id: "b0002001-0001-0000-0000-000000000000",
      planId: PLAN_CCL,
      organizationId: ORG_CCL,
      parentId: "b0002001-0000-0000-0000-000000000000",
      goalNumber: "1.1",
      title: "Microcredential Programs",
      description:
        "Develop and scale microcredential programs aligned to high-demand industry sectors",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "64.00",
    },
    {
      id: "b0002001-0002-0000-0000-000000000000",
      planId: PLAN_CCL,
      organizationId: ORG_CCL,
      parentId: "b0002001-0000-0000-0000-000000000000",
      goalNumber: "1.2",
      title: "College Exposure Initiatives",
      description:
        "Increase student access to college visits, fairs, and shadow experiences",
      level: 1,
      orderPosition: 2,
      status: "in_progress",
      overallProgress: "58.00",
    },
  ]);

  // --- CCL Objective 2: Community & Industry Partnerships ---
  await db.insert(schema.goals).values({
    id: "b0002002-0000-0000-0000-000000000000",
    planId: PLAN_CCL,
    organizationId: ORG_CCL,
    goalNumber: "2",
    title: "Community & Industry Partnerships",
    description:
      "Build sustainable partnerships with industry and community stakeholders",
    level: 0,
    orderPosition: 2,
    status: "in_progress",
    overallProgress: "55.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under CCL Objective 2
  await db.insert(schema.goals).values([
    {
      id: "b0002002-0001-0000-0000-000000000000",
      planId: PLAN_CCL,
      organizationId: ORG_CCL,
      parentId: "b0002002-0000-0000-0000-000000000000",
      goalNumber: "2.1",
      title: "Industry Engagement",
      description:
        "Establish ongoing industry engagement through advisory boards and work-based learning",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "60.00",
    },
    {
      id: "b0002002-0002-0000-0000-000000000000",
      planId: PLAN_CCL,
      organizationId: ORG_CCL,
      parentId: "b0002002-0000-0000-0000-000000000000",
      goalNumber: "2.2",
      title: "Placement & Internship Programs",
      description:
        "Launch and expand student placement and internship opportunities with local employers",
      level: 1,
      orderPosition: 2,
      status: "not_started",
      overallProgress: "35.00",
    },
  ]);

  // --- CCL Objective 3: Student & Family Engagement ---
  await db.insert(schema.goals).values({
    id: "b0002003-0000-0000-0000-000000000000",
    planId: PLAN_CCL,
    organizationId: ORG_CCL,
    goalNumber: "3",
    title: "Student & Family Engagement",
    description:
      "Deepen student and family engagement to support post-secondary success",
    level: 0,
    orderPosition: 3,
    status: "in_progress",
    overallProgress: "70.00",
    overallProgressDisplayMode: "hidden",
  });

  // Level 1 strategies under CCL Objective 3
  await db.insert(schema.goals).values([
    {
      id: "b0002003-0001-0000-0000-000000000000",
      planId: PLAN_CCL,
      organizationId: ORG_CCL,
      parentId: "b0002003-0000-0000-0000-000000000000",
      goalNumber: "3.1",
      title: "Parent & Community Involvement",
      description:
        "Increase parent and community participation in career readiness events and workshops",
      level: 1,
      orderPosition: 1,
      status: "in_progress",
      overallProgress: "75.00",
    },
    {
      id: "b0002003-0002-0000-0000-000000000000",
      planId: PLAN_CCL,
      organizationId: ORG_CCL,
      parentId: "b0002003-0000-0000-0000-000000000000",
      goalNumber: "3.2",
      title: "Student Challenge Programs",
      description:
        "Implement competitive challenge programs that build career-ready skills",
      level: 1,
      orderPosition: 2,
      status: "completed",
      overallProgress: "82.00",
    },
  ]);

  console.log("   Done (48 goals).\n");

  // -------------------------------------------------------------------------
  // Section 5: Insert widgets
  // -------------------------------------------------------------------------
  console.log("6b. Inserting widgets...");

  // --- Eastside Widgets (10) — launch-traction template ---
  await db.insert(schema.widgets).values([
    {
      id: WIDGET_E1,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "donut",
      title: "Graduation Rate",
      subtitle: "Four-year cohort graduation rate",
      position: 0,
      isActive: true,
      config: {
        value: 91,
        target: 95,
        unit: "%",
        label: "Current Rate",
      },
    },
    {
      id: WIDGET_E2,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "big-number",
      title: "Total Enrollment",
      subtitle: "District-wide student enrollment",
      position: 1,
      isActive: true,
      config: {
        value: 12847,
        unit: "students",
        trend: "+3.2%",
        trendDirection: "up" as const,
      },
    },
    {
      id: WIDGET_E3,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "bar-chart",
      title: "State Assessment Proficiency",
      subtitle: "Percent proficient by subject area",
      position: 2,
      isActive: true,
      config: {
        legend: ["2024", "2025"],
        colors: ["#94a3b8", "#1e40af"],
        dataPoints: [
          { label: "ELA", values: [68, 72] },
          { label: "Math", values: [61, 65] },
          { label: "Science", values: [55, 59] },
          { label: "Social Studies", values: [70, 74] },
        ],
      },
    },
    {
      id: WIDGET_E4,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "area-line",
      title: "Enrollment Trend",
      subtitle: "Five-year historical enrollment",
      position: 3,
      isActive: true,
      config: {
        unit: "students",
        colors: ["#1e40af"],
        dataPoints: [
          { label: "2021", value: 11520 },
          { label: "2022", value: 11890 },
          { label: "2023", value: 12210 },
          { label: "2024", value: 12450 },
          { label: "2025", value: 12847 },
        ],
      },
    },
    {
      id: WIDGET_E5,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "progress-bar",
      title: "College Enrollment Rate",
      subtitle: "Post-secondary enrollment within 12 months",
      position: 4,
      isActive: true,
      config: {
        value: 68,
        target: 80,
        unit: "%",
      },
    },
    {
      id: WIDGET_E6,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "pie-breakdown",
      title: "Student Demographics",
      subtitle: "Enrollment by ethnicity",
      position: 5,
      isActive: true,
      config: {
        breakdownItems: [
          { label: "Hispanic/Latino", value: 42, color: "#3b82f6" },
          { label: "White", value: 28, color: "#10b981" },
          { label: "Black/African American", value: 18, color: "#f59e0b" },
          { label: "Asian", value: 8, color: "#8b5cf6" },
          { label: "Other", value: 4, color: "#6b7280" },
        ],
      },
    },
    {
      id: WIDGET_E7,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "donut",
      title: "Teacher Retention Rate",
      subtitle: "Year-over-year teacher retention",
      position: 6,
      isActive: true,
      config: {
        value: 87,
        target: 92,
        unit: "%",
        label: "Retained",
      },
    },
    {
      id: WIDGET_E8,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "big-number",
      title: "Average Class Size",
      subtitle: "District-wide average",
      position: 7,
      isActive: true,
      config: {
        value: 22,
        unit: "students",
        trend: "-1",
        trendDirection: "down" as const,
      },
    },
    {
      id: WIDGET_E9,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "progress-bar",
      title: "STEM Program Expansion",
      subtitle: "Schools with dedicated STEM programs",
      position: 8,
      isActive: true,
      config: {
        value: 14,
        target: 22,
        unit: "schools",
      },
    },
    {
      id: WIDGET_E10,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      type: "bar-chart",
      title: "Attendance Rate by Level",
      subtitle: "Average daily attendance",
      position: 9,
      isActive: true,
      config: {
        colors: ["#1e40af"],
        dataPoints: [
          { label: "Elementary", value: 95 },
          { label: "Middle", value: 92 },
          { label: "High", value: 89 },
        ],
      },
    },
  ]);

  // --- Westside Widgets (3) — hierarchical template ---
  await db.insert(schema.widgets).values([
    {
      id: WIDGET_W1,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      type: "donut",
      title: "Strategic Plan Progress",
      subtitle: "Overall plan completion",
      position: 0,
      isActive: true,
      config: {
        value: 47,
        target: 100,
        unit: "%",
        label: "Complete",
      },
    },
    {
      id: WIDGET_W2,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      type: "big-number",
      title: "Goals Completed",
      subtitle: "Strategies marked as completed",
      position: 1,
      isActive: true,
      config: {
        value: 3,
        trend: "+1 this quarter",
        trendDirection: "up" as const,
      },
    },
    {
      id: WIDGET_W3,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      type: "pie-breakdown",
      title: "Goals by Status",
      subtitle: "Distribution across all strategies",
      position: 2,
      isActive: true,
      config: {
        breakdownItems: [
          { label: "Completed", value: 3, color: "#10b981" },
          { label: "In Progress", value: 10, color: "#3b82f6" },
          { label: "Not Started", value: 4, color: "#6b7280" },
          { label: "On Hold", value: 2, color: "#f59e0b" },
        ],
      },
    },
  ]);

  // --- Westside Goal Widgets (12) — metric-driven display per goal ---
  await db.insert(schema.widgets).values([
    {
      id: WIDGET_WG1,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0001-0000-0000-000000000000", // 1.1 ELA/Reading
      type: "bar-chart",
      title: "ELA/Reading Proficiency Rate",
      subtitle: "State assessment proficiency",
      position: 0,
      isActive: true,
      config: {
        value: 72,
        baseline: 65,
        target: 85,
        unit: "%",
        isHigherBetter: true,
        indicatorText: "Off Track",
        indicatorColor: "red" as const,
        dataPoints: [
          { label: "2021", value: 65 },
          { label: "2022", value: 68 },
          { label: "2023", value: 70 },
          { label: "2024", value: 72 },
        ],
        colors: ["#1e40af"],
      },
    },
    {
      id: WIDGET_WG2,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0002-0000-0000-000000000000", // 1.2 Mathematics
      type: "bar-chart",
      title: "Math Proficiency Rate",
      subtitle: "State assessment proficiency",
      position: 0,
      isActive: true,
      config: {
        value: 65,
        baseline: 58,
        target: 80,
        unit: "%",
        isHigherBetter: true,
        indicatorText: "Off Track",
        indicatorColor: "red" as const,
        dataPoints: [
          { label: "2021", value: 58 },
          { label: "2022", value: 61 },
          { label: "2023", value: 63 },
          { label: "2024", value: 65 },
        ],
        colors: ["#7c3aed"],
      },
    },
    {
      id: WIDGET_WG3,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0003-0000-0000-000000000000", // 1.3 Science
      type: "big-number",
      title: "Science Proficiency Rate",
      subtitle: "State assessment proficiency",
      position: 0,
      isActive: true,
      config: {
        value: 0,
        target: 70,
        unit: "%",
        isHigherBetter: true,
        // No indicator — data not yet collected
      },
    },
    {
      id: WIDGET_WG4,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0004-0000-0000-000000000000", // 1.4 Growth Mindset
      type: "donut",
      title: "Growth Mindset Survey Score",
      subtitle: "Student survey composite score",
      position: 0,
      isActive: true,
      config: {
        value: 4.5,
        baseline: 3.8,
        target: 4.2,
        unit: "out of 5",
        label: "Current Score",
        isHigherBetter: true,
        indicatorText: "Exceeding Goals",
        indicatorColor: "green" as const,
      },
    },
    {
      id: WIDGET_WG5,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0005-0000-0000-000000000000", // 1.5 Student Engagement
      type: "bar-chart",
      title: "Chronic Absenteeism Rate",
      subtitle: "Students missing 10%+ of school days",
      position: 0,
      isActive: true,
      config: {
        value: 12,
        baseline: 18,
        target: 8,
        unit: "%",
        isHigherBetter: false,
        indicatorText: "Off Track",
        indicatorColor: "red" as const,
        dataPoints: [
          { label: "2021", value: 18 },
          { label: "2022", value: 16 },
          { label: "2023", value: 14 },
          { label: "2024", value: 12 },
        ],
        colors: ["#991b1b"],
      },
    },
    {
      id: WIDGET_WG6,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0005-0000-0000-000000000000", // 1.5 Student Engagement (2nd widget)
      type: "donut",
      title: "Student Engagement Survey",
      subtitle: "Annual student engagement composite",
      position: 1,
      isActive: true,
      config: {
        value: 3.6,
        baseline: 3.2,
        target: 4.2,
        unit: "out of 5",
        label: "Current Score",
        isHigherBetter: true,
        indicatorText: "On Target",
        indicatorColor: "green" as const,
      },
    },
    {
      id: WIDGET_WG7,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0006-0000-0000-000000000000", // 1.6 Early Childhood
      type: "progress-bar",
      title: "Kindergarten Readiness Rate",
      subtitle: "Students meeting readiness benchmarks",
      position: 0,
      isActive: true,
      config: {
        value: 80,
        baseline: 72,
        target: 90,
        unit: "%",
        isHigherBetter: true,
        indicatorText: "On Target",
        indicatorColor: "green" as const,
      },
    },
    {
      id: WIDGET_WG8,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000002-0001-0000-0000-000000000000", // 2.1 Instructional Quality
      type: "big-number",
      title: "Teacher Effectiveness Rating",
      subtitle: "Average classroom observation score",
      position: 0,
      isActive: true,
      config: {
        value: 3.2,
        baseline: 3.0,
        target: 3.8,
        unit: "out of 4",
        isHigherBetter: true,
        indicatorText: "Off Track",
        indicatorColor: "amber" as const,
      },
    },
    {
      id: WIDGET_WG9,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000002-0002-0000-0000-000000000000", // 2.2 Technology Integration
      type: "donut",
      title: "1:1 Device Deployment",
      subtitle: "Student device ratio",
      position: 0,
      isActive: true,
      config: {
        value: 100,
        target: 100,
        unit: "%",
        label: "Deployed",
        isHigherBetter: true,
        indicatorText: "Exceeding Goals",
        indicatorColor: "green" as const,
      },
    },
    {
      id: WIDGET_WG10,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000002-0003-0000-0000-000000000000", // 2.3 Professional Development
      type: "bar-chart",
      title: "PD Hours Completed",
      subtitle: "Average professional development hours per teacher",
      position: 0,
      isActive: true,
      config: {
        value: 42,
        baseline: 30,
        target: 50,
        unit: "hours",
        isHigherBetter: true,
        indicatorText: "On Target",
        indicatorColor: "green" as const,
        dataPoints: [
          { label: "2021", value: 30 },
          { label: "2022", value: 35 },
          { label: "2023", value: 38 },
          { label: "2024", value: 42 },
        ],
        colors: ["#059669"],
      },
    },
    {
      id: WIDGET_WG11,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000003-0001-0000-0000-000000000000", // 3.1 School Safety
      type: "big-number",
      title: "Safety Incident Rate",
      subtitle: "Incidents per 1,000 students",
      position: 0,
      isActive: true,
      config: {
        value: 4.2,
        baseline: 6.8,
        target: 3.0,
        unit: "per 1K",
        isHigherBetter: false,
        indicatorText: "On Target",
        indicatorColor: "green" as const,
      },
    },
    {
      id: WIDGET_WG12,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000003-0003-0000-0000-000000000000", // 3.3 Family Engagement
      type: "donut",
      title: "Parent Engagement Score",
      subtitle: "Annual parent satisfaction survey",
      position: 0,
      isActive: true,
      config: {
        value: 3.8,
        target: 4.5,
        unit: "out of 5",
        label: "Current Score",
        isHigherBetter: true,
        // No indicator — admin hasn't set one
      },
    },
  ]);

  // --- Westside Gap Widgets (4) — covering goals 3.2, 4.1, 4.2, 1.6 (2nd) ---
  await db.insert(schema.widgets).values([
    {
      id: WIDGET_WG13,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000003-0002-0000-0000-000000000000", // 3.2 Mental Health
      type: "area-line",
      title: "Counseling Sessions Delivered",
      subtitle: "Monthly sessions across district",
      position: 0,
      isActive: true,
      config: {
        value: 482,
        target: 600,
        unit: "sessions",
        isHigherBetter: true,
        indicatorText: "Ramping Up",
        indicatorColor: "amber" as const,
        dataPoints: [
          { label: "Sep", value: 210 },
          { label: "Oct", value: 285 },
          { label: "Nov", value: 340 },
          { label: "Dec", value: 390 },
          { label: "Jan", value: 482 },
        ],
        colors: ["#7c3aed"],
      },
    },
    {
      id: WIDGET_WG14,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000004-0001-0000-0000-000000000000", // 4.1 Fiscal Responsibility
      type: "pie-breakdown",
      title: "Budget Allocation",
      subtitle: "FY2025 operating budget distribution",
      position: 0,
      isActive: true,
      config: {
        breakdownItems: [
          { label: "Instruction", value: 58, color: "#3b82f6" },
          { label: "Support Services", value: 22, color: "#10b981" },
          { label: "Administration", value: 12, color: "#f59e0b" },
          { label: "Operations", value: 8, color: "#6b7280" },
        ],
      },
    },
    {
      id: WIDGET_WG15,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000004-0002-0000-0000-000000000000", // 4.2 Facilities
      type: "progress-bar",
      title: "Facility Upgrades Completed",
      subtitle: "Schools with modernized infrastructure",
      position: 0,
      isActive: true,
      config: {
        value: 4,
        target: 18,
        unit: "schools",
        isHigherBetter: true,
        indicatorText: "In Progress",
        indicatorColor: "amber" as const,
      },
    },
    {
      id: WIDGET_WG16,
      organizationId: ORG_WESTSIDE,
      planId: PLAN_WESTSIDE,
      goalId: "b0000001-0006-0000-0000-000000000000", // 1.6 Early Childhood (2nd widget)
      type: "pie-breakdown",
      title: "Pre-K Program Enrollment",
      subtitle: "Distribution by program type",
      position: 1,
      isActive: true,
      config: {
        breakdownItems: [
          { label: "Full-Day Pre-K", value: 340, color: "#3b82f6" },
          { label: "Half-Day Pre-K", value: 180, color: "#10b981" },
          { label: "Head Start", value: 120, color: "#f59e0b" },
          { label: "Partner Programs", value: 85, color: "#8b5cf6" },
        ],
      },
    },
  ]);

  // --- Eastside Goal Widgets (10) — metric-driven display per goal ---
  await db.insert(schema.widgets).values([
    {
      id: WIDGET_EG1,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001001-0001-0000-0000-000000000000", // 1.1 Graduation Rate
      type: "donut",
      title: "Four-Year Graduation Rate",
      subtitle: "Cohort graduation rate",
      position: 0,
      isActive: true,
      config: {
        value: 91,
        baseline: 85,
        target: 95,
        unit: "%",
        label: "Current Rate",
        isHigherBetter: true,
        indicatorText: "Near Target",
        indicatorColor: "amber" as const,
      },
    },
    {
      id: WIDGET_EG2,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001001-0002-0000-0000-000000000000", // 1.2 College Enrollment
      type: "area-line",
      title: "Post-Secondary Enrollment Trend",
      subtitle: "Percent enrolling within 12 months of graduation",
      position: 0,
      isActive: true,
      config: {
        value: 68,
        target: 80,
        unit: "%",
        isHigherBetter: true,
        indicatorText: "Off Track",
        indicatorColor: "red" as const,
        dataPoints: [
          { label: "2021", value: 55 },
          { label: "2022", value: 58 },
          { label: "2023", value: 62 },
          { label: "2024", value: 65 },
          { label: "2025", value: 68 },
        ],
        colors: ["#dc2626"],
      },
    },
    {
      id: WIDGET_EG3,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001002-0001-0000-0000-000000000000", // 2.1 STEM Education
      type: "bar-chart",
      title: "STEM Participation by Grade Band",
      subtitle: "Students enrolled in STEM courses",
      position: 0,
      isActive: true,
      config: {
        legend: ["2024", "2025"],
        colors: ["#94a3b8", "#1e40af"],
        isHigherBetter: true,
        indicatorText: "Off Track",
        indicatorColor: "red" as const,
        dataPoints: [
          { label: "K-5", values: [320, 380] },
          { label: "6-8", values: [480, 540] },
          { label: "9-12", values: [620, 710] },
        ],
      },
    },
    {
      id: WIDGET_EG4,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001002-0002-0000-0000-000000000000", // 2.2 Literacy
      type: "big-number",
      title: "Cross-Curricular Literacy Score",
      subtitle: "Average rubric score across content areas",
      position: 0,
      isActive: true,
      config: {
        value: 92,
        target: 90,
        unit: "%",
        isHigherBetter: true,
        indicatorText: "Exceeding Goals",
        indicatorColor: "green" as const,
      },
    },
    {
      id: WIDGET_EG5,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001003-0001-0000-0000-000000000000", // 3.1 Mentorship
      type: "progress-bar",
      title: "Mentorship Program Launch",
      subtitle: "Businesses with active mentorship agreements",
      position: 0,
      isActive: true,
      config: {
        value: 5,
        target: 100,
        unit: "partners",
        isHigherBetter: true,
        indicatorText: "Just Starting",
        indicatorColor: "gray" as const,
      },
    },
    {
      id: WIDGET_EG6,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001003-0002-0000-0000-000000000000", // 3.2 Parent Engagement
      type: "donut",
      title: "Parent Engagement Score",
      subtitle: "Annual parent involvement composite",
      position: 0,
      isActive: true,
      config: {
        value: 3.5,
        target: 4.5,
        unit: "out of 5",
        label: "Current Score",
        isHigherBetter: true,
        indicatorText: "Needs Improvement",
        indicatorColor: "amber" as const,
      },
    },
    {
      id: WIDGET_EG7,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001004-0001-0000-0000-000000000000", // 4.1 Digital Equity
      type: "pie-breakdown",
      title: "Device Distribution",
      subtitle: "Student device assignment by type",
      position: 0,
      isActive: true,
      config: {
        indicatorText: "In Progress",
        indicatorColor: "amber" as const,
        breakdownItems: [
          { label: "Chromebook", value: 5200, color: "#3b82f6" },
          { label: "iPad", value: 3100, color: "#10b981" },
          { label: "Laptop", value: 2800, color: "#f59e0b" },
          { label: "No Device", value: 1747, color: "#ef4444" },
        ],
      },
    },
    {
      id: WIDGET_EG8,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001004-0002-0000-0000-000000000000", // 4.2 Multilingual
      type: "area-line",
      title: "ELL Proficiency Progress",
      subtitle: "English learners meeting proficiency benchmarks",
      position: 0,
      isActive: true,
      config: {
        value: 40,
        target: 65,
        unit: "%",
        isHigherBetter: true,
        indicatorText: "Off Track",
        indicatorColor: "amber" as const,
        dataPoints: [
          { label: "2021", value: 22 },
          { label: "2022", value: 26 },
          { label: "2023", value: 31 },
          { label: "2024", value: 36 },
          { label: "2025", value: 40 },
        ],
        colors: ["#d97706"],
      },
    },
    {
      id: WIDGET_EG9,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001001-0001-0000-0000-000000000000", // 1.1 Graduation Rate (2nd widget)
      type: "bar-chart",
      title: "Graduation Rate by Subgroup",
      subtitle: "Four-year graduation rate by demographic",
      position: 1,
      isActive: true,
      config: {
        colors: ["#1e40af"],
        dataPoints: [
          { label: "Hispanic", value: 87 },
          { label: "Black", value: 85 },
          { label: "White", value: 94 },
          { label: "Asian", value: 96 },
        ],
      },
    },
    {
      id: WIDGET_EG10,
      organizationId: ORG_EASTSIDE,
      planId: PLAN_EASTSIDE,
      goalId: "b0001002-0001-0000-0000-000000000000", // 2.1 STEM (2nd widget)
      type: "big-number",
      title: "Students in STEM Programs",
      subtitle: "Total enrolled across all grade levels",
      position: 1,
      isActive: true,
      config: {
        value: 2340,
        trend: "+12%",
        trendDirection: "up" as const,
        isHigherBetter: true,
      },
    },
  ]);

  // --- CCL Widgets (5) — launch-traction template, plan-level ---
  await db.insert(schema.widgets).values([
    {
      id: WIDGET_C1,
      organizationId: ORG_CCL,
      planId: PLAN_CCL,
      type: "donut",
      title: "Microcredentials Earned",
      subtitle: "EARNED TO DATE",
      position: 0,
      isActive: true,
      config: {
        value: 324,
        target: 500,
        unit: "credentials",
        label: "EARNED TO DATE",
      },
    },
    {
      id: WIDGET_C2,
      organizationId: ORG_CCL,
      planId: PLAN_CCL,
      type: "area-line",
      title: "Engagement Momentum",
      subtitle: "Industry vs Community engagement trends",
      position: 1,
      isActive: true,
      config: {
        legend: ["Industry", "Community"],
        colors: ["#C62828", "#1a1a2e"],
        dataPoints: [
          { label: "Aug", values: [120, 80] },
          { label: "Sep", values: [150, 110] },
          { label: "Oct", values: [180, 135] },
          { label: "Nov", values: [210, 160] },
          { label: "Dec", values: [245, 190] },
        ],
      },
    },
    {
      id: WIDGET_C3,
      organizationId: ORG_CCL,
      planId: PLAN_CCL,
      type: "big-number",
      title: "Parent Impact",
      subtitle: "Parents engaged in career readiness programs",
      position: 2,
      isActive: true,
      config: {
        value: 480,
        trend: "+12% this month",
        trendDirection: "up" as const,
      },
    },
    {
      id: WIDGET_C4,
      organizationId: ORG_CCL,
      planId: PLAN_CCL,
      type: "bar-chart",
      title: "Student Challenges",
      subtitle: "Program participation and outcomes",
      position: 3,
      isActive: true,
      config: {
        legend: ["Involvement", "Placement Success"],
        colors: ["#C62828", "#1a1a2e"],
        dataPoints: [
          { label: "Engineering", values: [85, 62] },
          { label: "Healthcare", values: [72, 55] },
          { label: "Technology", values: [90, 70] },
          { label: "Business", values: [65, 48] },
        ],
      },
    },
    {
      id: WIDGET_C5,
      organizationId: ORG_CCL,
      planId: PLAN_CCL,
      type: "pie-breakdown",
      title: "College Exposure",
      subtitle: "Visit Type Breakdown",
      position: 4,
      isActive: true,
      config: {
        breakdownItems: [
          { label: "Campus Tours", value: 42, color: "#C62828" },
          { label: "Virtual Tours", value: 28, color: "#1a1a2e" },
          { label: "College Fairs", value: 18, color: "#ef5350" },
          { label: "Shadow Days", value: 12, color: "#37474f" },
        ],
      },
    },
  ]);

  console.log("   Done (44 widgets).\n");

  // -------------------------------------------------------------------------
  // Section 7: Create users via Better Auth API
  // -------------------------------------------------------------------------
  console.log("7. Creating users via Better Auth...");

  const users = [
    {
      email: "sysadmin@stratadash.com",
      password: "Stratadash123!",
      name: "System Admin",
    },
    {
      email: "admin@westside66.org",
      password: "Westside123!",
      name: "Westside Admin",
    },
    {
      email: "admin@eastside.edu",
      password: "Eastside123!",
      name: "Eastside Admin",
    },
    {
      email: "weichelmark22@gmail.com",
      password: "College123!",
      name: "Mark Weichel",
    },
  ];

  const createdUsers: Array<{ id: string; email: string }> = [];

  for (const u of users) {
    const result = await auth.api.signUpEmail({
      body: { email: u.email, password: u.password, name: u.name },
    });
    if (!result?.user?.id) {
      throw new Error(`Failed to create user: ${u.email}`);
    }
    createdUsers.push({ id: result.user.id, email: u.email });
    console.log(`   Created: ${u.email} (${result.user.id})`);
  }

  const sysadminId = createdUsers[0].id;
  const westsideAdminId = createdUsers[1].id;
  const eastsideAdminId = createdUsers[2].id;
  const cclAdminId = createdUsers[3].id;

  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 8: Set isSystemAdmin + create organization_members
  // -------------------------------------------------------------------------
  console.log("8. Setting roles and org memberships...");

  // Mark sysadmin as system admin
  await db
    .update(schema.user)
    .set({ isSystemAdmin: true })
    .where(sql`id = ${sysadminId}`);

  // Create organization memberships
  await db.insert(schema.organizationMembers).values([
    {
      organizationId: ORG_WESTSIDE,
      userId: sysadminId,
      role: "owner",
    },
    {
      organizationId: ORG_EASTSIDE,
      userId: sysadminId,
      role: "owner",
    },
    {
      organizationId: ORG_WESTSIDE,
      userId: westsideAdminId,
      role: "admin",
    },
    {
      organizationId: ORG_EASTSIDE,
      userId: eastsideAdminId,
      role: "admin",
    },
    {
      organizationId: ORG_CCL,
      userId: sysadminId,
      role: "owner",
    },
    {
      organizationId: ORG_CCL,
      userId: cclAdminId,
      role: "admin",
    },
  ]);
  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 9: Verification counts + summary
  // -------------------------------------------------------------------------
  console.log("9. Verifying seed data...\n");

  const [orgCount] = await db
    .select({ count: count() })
    .from(schema.organizations);
  const [planCount] = await db.select({ count: count() }).from(schema.plans);
  const [goalCount] = await db.select({ count: count() }).from(schema.goals);
  const [userCount] = await db.select({ count: count() }).from(schema.user);
  const [memberCount] = await db
    .select({ count: count() })
    .from(schema.organizationMembers);
  const [widgetCount] = await db
    .select({ count: count() })
    .from(schema.widgets);

  // Check all goals have plan_id set
  const [goalsWithoutPlan] = await db
    .select({ count: count() })
    .from(schema.goals)
    .where(sql`plan_id IS NULL`);

  console.log("   ==========================================");
  console.log(`   Organizations:  ${orgCount.count}`);
  console.log(`   Plans:          ${planCount.count}`);
  console.log(`   Goals:          ${goalCount.count}`);
  console.log(`   Users:          ${userCount.count}`);
  console.log(`   Org Members:    ${memberCount.count}`);
  console.log(`   Widgets:        ${widgetCount.count}`);
  console.log("   ==========================================");

  if (Number(goalsWithoutPlan.count) > 0) {
    console.log(
      `\n   WARNING: ${goalsWithoutPlan.count} goals are missing plan_id!`,
    );
  } else {
    console.log("   All goals have plan_id set.");
  }

  console.log("\nSeed complete!\n");
  console.log("Test credentials:");
  console.log("  sysadmin@stratadash.com    / Stratadash123!");
  console.log("  admin@westside66.org      / Westside123!");
  console.log("  admin@eastside.edu        / Eastside123!");
  console.log("  weichelmark22@gmail.com   / College123!");
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
