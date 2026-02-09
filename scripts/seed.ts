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

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sql, count } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../api/lib/schema/index.js";

// ---------------------------------------------------------------------------
// Section 0: Standalone DB + Auth setup (dynamic driver)
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

const isNeon = DATABASE_URL.includes("neon.tech");

let db: NeonHttpDatabase<typeof schema>;
let rawSql: (query: string) => Promise<unknown>;

if (isNeon) {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const neonSql = neon(DATABASE_URL);
  db = drizzle(neonSql, { schema });
  rawSql = (query: string) => neonSql(query as unknown as TemplateStringsArray);
} else {
  const pg = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pool = new pg.default.Pool({ connectionString: DATABASE_URL });
  db = drizzle(pool, { schema }) as unknown as NeonHttpDatabase<typeof schema>;
  rawSql = (query: string) => pool.query(query);
}

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
});

// ---------------------------------------------------------------------------
// Deterministic UUIDs (preserved from old seed for consistency)
// ---------------------------------------------------------------------------

const ORG_EASTSIDE = "a0000000-0000-0000-0000-000000000001";
const ORG_WESTSIDE = "a0000000-0000-0000-0000-000000000002";

const PLAN_EASTSIDE = "c0000000-0000-0000-0000-000000000001";
const PLAN_WESTSIDE = "c0000000-0000-0000-0000-000000000002";

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Seeding Neon database...\n");

  // -------------------------------------------------------------------------
  // Section 1: TRUNCATE all tables (CASCADE) — clean slate
  // -------------------------------------------------------------------------
  console.log("1. Truncating all tables...");
  await rawSql(`TRUNCATE TABLE
      stock_photos,
      status_overrides,
      staged_metrics,
      staged_goals,
      import_sessions,
      school_admins,
      metric_time_series,
      contact_submissions,
      metrics,
      goals,
      plans,
      schools,
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
    },
    {
      id: ORG_WESTSIDE,
      name: "Westside Community Schools",
      slug: "westside",
      entityType: "district",
      entityLabel: "District",
      logoUrl:
        "https://www.westside66.org/cms/lib/NE50000555/Centricity/Template/GlobalAssets/images//logos/Westside District STAR BOX.png",
      primaryColor: "#C03537",
      secondaryColor: "#000000",
      adminEmail: "admin@westside.edu",
      isPublic: true,
      isActive: true,
      tagline: "Community. Innovation. Excellence.",
    },
  ]);
  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 3: Insert plans
  // -------------------------------------------------------------------------
  console.log("3. Inserting plans...");
  await db.insert(schema.plans).values([
    {
      id: PLAN_EASTSIDE,
      organizationId: ORG_EASTSIDE,
      name: "Eastside Strategic Plan 2025",
      slug: "strategic-plan-2025",
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
  ]);
  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 4: Insert stock photos
  // -------------------------------------------------------------------------
  console.log("4. Inserting stock photos...");
  await db.insert(schema.stockPhotos).values([
    {
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
      altText: "Students celebrating success",
      category: "achievement",
    },
    {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      altText: "Students collaborating",
      category: "collaboration",
    },
    {
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
      altText: "Teacher with students",
      category: "teaching",
    },
    {
      url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45",
      altText: "Students studying",
      category: "learning",
    },
    {
      url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b",
      altText: "School classroom",
      category: "environment",
    },
    {
      url: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc",
      altText: "Students reading",
      category: "literacy",
    },
    {
      url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
      altText: "Education books",
      category: "resources",
    },
    {
      url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
      altText: "Students with technology",
      category: "technology",
    },
    {
      url: "https://images.unsplash.com/photo-1588072432836-e10032774350",
      altText: "Online learning",
      category: "digital",
    },
    {
      url: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178",
      altText: "Graduation celebration",
      category: "success",
    },
  ]);
  console.log("   Done.\n");

  // -------------------------------------------------------------------------
  // Section 5: Insert goals (level 0 → 1 → 2, all with planId)
  // -------------------------------------------------------------------------
  console.log("5. Inserting goals...");

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
    status: "on-target",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    coverPhotoAlt: "Students celebrating success",
  });

  // Level 1 goals under Westside Objective 1
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
      status: "on-target",
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
      status: "on-target",
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
      status: "at-risk",
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
      status: "on-target",
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
      status: "critical",
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
      status: "on-target",
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
      status: "on-target",
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
      status: "at-risk",
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
      status: "on-target",
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
      status: "on-target",
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
      status: "on-target",
    },
  ]);

  // --- Westside Objective 2: Educational Excellence ---
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
    status: "at-risk",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    coverPhotoAlt: "Teacher with students",
  });

  // Level 1 goals under Westside Objective 2
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
      status: "at-risk",
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
      status: "on-target",
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
      status: "on-target",
    },
  ]);

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
    status: "on-target",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178",
    coverPhotoAlt: "Graduation celebration",
  });

  // Level 1 goals under Eastside Objective 1
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
      status: "on-target",
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
      status: "at-risk",
    },
  ]);

  console.log("   Done (19 goals).\n");

  // -------------------------------------------------------------------------
  // Section 6: Insert metrics
  // -------------------------------------------------------------------------
  console.log("6. Inserting metrics...");
  await db.insert(schema.metrics).values([
    // Metrics for Goal 1.1.1 (K-2 Reading Foundation)
    {
      id: "a0000001-0001-0001-0001-000000000000",
      goalId: "b0000001-0001-0001-0000-000000000000",
      name: "K-2 Reading Proficiency Rate",
      metricType: "percent",
      dataSource: "state_testing",
      currentValue: "85",
      targetValue: "90",
      unit: "%",
      status: "near-target",
      chartType: "bar",
      isHigherBetter: true,
      metricCalculationType: "percentage",
    },
    {
      id: "a0000001-0001-0001-0002-000000000000",
      goalId: "b0000001-0001-0001-0000-000000000000",
      name: "Benchmark Assessment Pass Rate",
      metricType: "percent",
      dataSource: "map_data",
      currentValue: "88",
      targetValue: "92",
      unit: "%",
      status: "on-target",
      chartType: "line",
      isHigherBetter: true,
      metricCalculationType: "percentage",
    },
    // Metrics for Goal 1.1.2 (Grade 3-5 Reading)
    {
      id: "a0000001-0001-0002-0001-000000000000",
      goalId: "b0000001-0001-0002-0000-000000000000",
      name: "Reading Comprehension Score",
      metricType: "rating",
      dataSource: "state_testing",
      currentValue: "3.8",
      targetValue: "4.0",
      unit: "out of 5",
      status: "near-target",
      chartType: "gauge",
      isHigherBetter: true,
      metricCalculationType: "numeric",
    },
    {
      id: "a0000001-0001-0002-0002-000000000000",
      goalId: "b0000001-0001-0002-0000-000000000000",
      name: "Fluency Words Per Minute",
      metricType: "number",
      dataSource: "map_data",
      currentValue: "145",
      targetValue: "160",
      unit: "wpm",
      status: "off-target",
      chartType: "bar",
      isHigherBetter: true,
      metricCalculationType: "numeric",
    },
    // Metrics for Goal 1.2.1 (Elementary Math)
    {
      id: "a0000001-0002-0001-0001-000000000000",
      goalId: "b0000001-0002-0001-0000-000000000000",
      name: "Math Proficiency Rate",
      metricType: "percent",
      dataSource: "state_testing",
      currentValue: "82",
      targetValue: "85",
      unit: "%",
      status: "on-target",
      chartType: "bar",
      isHigherBetter: true,
      metricCalculationType: "percentage",
    },
    {
      id: "a0000001-0002-0001-0002-000000000000",
      goalId: "b0000001-0002-0001-0000-000000000000",
      name: "Number Sense Assessment",
      metricType: "percent",
      dataSource: "map_data",
      currentValue: "90",
      targetValue: "88",
      unit: "%",
      status: "on-target",
      chartType: "line",
      isHigherBetter: true,
      metricCalculationType: "percentage",
    },
    // Metrics for Goal 1.5 (Student Engagement)
    {
      id: "a0000001-0005-0000-0001-000000000000",
      goalId: "b0000001-0005-0000-0000-000000000000",
      name: "Chronic Absenteeism Rate",
      metricType: "percent",
      dataSource: "total_number",
      currentValue: "12",
      targetValue: "8",
      unit: "%",
      status: "off-target",
      chartType: "line",
      isHigherBetter: false,
      metricCalculationType: "ratio",
      baselineValue: "15",
    },
    {
      id: "a0000001-0005-0000-0002-000000000000",
      goalId: "b0000001-0005-0000-0000-000000000000",
      name: "Student Engagement Survey",
      metricType: "rating",
      dataSource: "survey",
      currentValue: "3.6",
      targetValue: "4.2",
      unit: "out of 5",
      status: "off-target",
      chartType: "gauge",
      isHigherBetter: true,
      metricCalculationType: "numeric",
    },
    // Narrative metric for Goal 2.1 (Instructional Quality)
    {
      id: "a0000002-0001-0000-0001-000000000000",
      goalId: "b0000002-0001-0000-0000-000000000000",
      name: "Instructional Framework Implementation",
      metricType: "narrative",
      dataSource: "narrative",
      chartType: "narrative",
      isHigherBetter: true,
      metricCalculationType: "qualitative",
    },
  ]);
  console.log("   Done (9 metrics).\n");

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
  const [metricCount] = await db
    .select({ count: count() })
    .from(schema.metrics);
  const [userCount] = await db.select({ count: count() }).from(schema.user);
  const [memberCount] = await db
    .select({ count: count() })
    .from(schema.organizationMembers);
  const [photoCount] = await db
    .select({ count: count() })
    .from(schema.stockPhotos);

  // Check all goals have plan_id set
  const [goalsWithoutPlan] = await db
    .select({ count: count() })
    .from(schema.goals)
    .where(sql`plan_id IS NULL`);

  console.log("   ==========================================");
  console.log(`   Organizations:  ${orgCount.count}`);
  console.log(`   Plans:          ${planCount.count}`);
  console.log(`   Goals:          ${goalCount.count}`);
  console.log(`   Metrics:        ${metricCount.count}`);
  console.log(`   Users:          ${userCount.count}`);
  console.log(`   Org Members:    ${memberCount.count}`);
  console.log(`   Stock Photos:   ${photoCount.count}`);
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
  console.log("  sysadmin@stratadash.com / Stratadash123!");
  console.log("  admin@westside66.org    / Westside123!");
  console.log("  admin@eastside.edu      / Eastside123!");
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
