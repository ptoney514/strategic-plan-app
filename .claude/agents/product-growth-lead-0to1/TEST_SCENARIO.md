# Test Scenario: Product & Growth Lead (0→1) Agent

**Version:** 1.0
**Date:** 2025-11-01
**Purpose:** Validate that the Product & Growth Lead agent can produce all expected outputs for a realistic 0→1 product scenario.

---

## Test Scenario Overview

**Product Context:**
You're building **ShipFast**, a web + iOS app that helps indie hackers and small teams publish beautiful release notes and track the impact on user activation/retention.

**Current Stage:** 0→1 MVP, 2-person team (you + 1 engineer), no users yet

**This Week's Goal:** Ship the first version of "Apple Sign In" feature to reduce mobile signup friction

**Problem:**
- Mobile signup conversion is currently 8% (web is 15%)
- User research shows 60% of iOS users abandon signup at "create password" step
- Competitor apps with social auth have 12%+ mobile conversion

**Your Task:**
Use the Product & Growth Lead agent to plan and ship this feature in 1 week.

---

## Test Cases

### Test Case 1: PRD One-Pager

**Input:**
```
Please use the Product & Growth Lead (0→1) agent to create a PRD one-pager for adding Apple Sign In to our mobile app.

Context:
- Product: ShipFast (release notes + KPI tracking)
- Platform: Web (React) + iOS (Swift)
- Current mobile signup conversion: 8%
- Target: 12%+ mobile conversion
- Team: 2 people
- Timeline: 1 week to ship
```

**Expected Output:**
- [ ] Elevator pitch (1-2 sentences)
- [ ] Target user (specific persona)
- [ ] Problem statement (quantified pain)
- [ ] MVP requirements (P0/P1/P2 breakdown)
- [ ] Acceptance criteria for each requirement
- [ ] Explicit out-of-scope items
- [ ] Success metric (primary + secondary)
- [ ] Launch criteria checklist
- [ ] Timeline with milestones
- [ ] Open questions / risks / assumptions
- [ ] Should reference templates/prd_onepager.md structure

**Success Criteria:**
- PRD is ≤2 pages (scannable)
- Requirements are specific and actionable
- Success metric is measurable and time-bound
- Assumptions are clearly flagged

---

### Test Case 2: Tech Spec One-Pager

**Input:**
```
Using the Product & Growth Lead agent, create a lean Tech Spec for implementing Apple Sign In.

Tech Stack:
- Frontend: React (web), Swift (iOS)
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL)
- Auth: Currently email/password only
- Hosting: Vercel (FE) + Railway (BE)

Constraints:
- Must support rollback via feature flag
- p95 API response time must stay <300ms
- No breaking changes to existing auth
```

**Expected Output:**
- [ ] High-level architecture diagram (text or Mermaid)
- [ ] Component breakdown (FE/BE/DB)
- [ ] Data model changes (SQL or schema)
- [ ] 3-5 key API endpoints with request/response examples
- [ ] Feature flag + rollout plan
- [ ] SLOs (performance targets)
- [ ] Security notes (auth, secrets, PII)
- [ ] Testing strategy (unit/integration/E2E)
- [ ] CI/CD approach
- [ ] Monitoring & alerting plan
- [ ] Implementation timeline (tasks + estimates)
- [ ] Should reference templates/techspec_onepager.md structure

**Success Criteria:**
- Tech Spec is ≤3 pages
- Includes rollback plan
- Security considerations addressed
- Trade-offs documented

---

### Test Case 3: Weekly Ship Plan

**Input:**
```
Create a 7-item weekly ship plan using the Product & Growth Lead agent.

Goal: Ship Apple Sign In by Friday (5 days from now)
Team: 1 engineer (full-stack)
Current status: PRD approved, Tech Spec reviewed
```

**Expected Output:**
- [ ] 7 specific, actionable tickets/tasks
- [ ] Each task scoped to ≤1 day
- [ ] Tasks in dependency order
- [ ] Clear acceptance criteria per task
- [ ] Owner assigned (even if just "Engineer")
- [ ] Includes testing, deployment, monitoring tasks (not just feature work)
- [ ] Format: Markdown checklist or table

**Success Criteria:**
- All 7 tasks fit in 5 business days for 1 person
- Critical path identified
- No missing steps (e.g., doesn't forget QA or deployment)

---

### Test Case 4: Experiment Brief (ICE Framework)

**Input:**
```
Using the Product & Growth Lead agent, create an experiment brief for Apple Sign In using the ICE framework.

Baseline metrics:
- Mobile signup conversion: 8%
- Desktop signup conversion: 15%
- Current mobile signups: 50/week
```

**Expected Output:**
- [ ] One-line hypothesis
- [ ] ICE score breakdown (Impact/Confidence/Ease, each 1-10)
- [ ] Total ICE score (out of 30)
- [ ] Primary metric + current baseline + target
- [ ] Secondary + anti-metrics
- [ ] Success criteria (quantified)
- [ ] Control vs. Variant description
- [ ] Traffic allocation plan
- [ ] Implementation checklist
- [ ] Analytics events to track
- [ ] Sample size calculation
- [ ] Rollback plan
- [ ] Decision framework (what happens if succeed/fail/inconclusive)
- [ ] Should reference templates/experiment_brief.md structure

**Success Criteria:**
- ICE score is justified
- Success criteria is statistically sound
- Rollback plan is clear
- Events are specific (event names + properties)

---

### Test Case 5: Event Tracking Plan

**Input:**
```
Create an event tracking plan for Apple Sign In using the Product & Growth Lead agent.

Include events for:
- Signup funnel (started, method selected, completed, failed)
- Activation (onboarding, first release created)
- Errors (auth failures)
```

**Expected Output:**
- [ ] Markdown table with columns: Event Name | Trigger | Properties | Owner
- [ ] OR JSON format matching resources/event_tracking_plan.json structure
- [ ] At least 5-7 events
- [ ] Each event has:
  - Clear trigger description
  - 2-5 properties with types and examples
  - Owner (Growth/Product/Engineering)
- [ ] Events cover success AND failure cases
- [ ] Consistent naming convention (snake_case)

**Success Criteria:**
- Can hand this to an engineer to implement
- Properties include types and examples
- Covers edge cases (errors, timeouts)

---

### Test Case 6: User Flow Diagram (Mermaid)

**Input:**
```
Use the Product & Growth Lead agent to create a user flow diagram for Apple Sign In.

Flow:
1. User lands on signup page
2. User sees "Sign up with Email" and "Sign up with Apple" buttons
3. If Apple: OAuth flow → create account → onboarding
4. If Email: Enter email/password → create account → onboarding
5. After onboarding: Dashboard with "Create your first release" prompt
6. User creates release → Release published → KPI dashboard visible
```

**Expected Output:**
- [ ] Mermaid flowchart (flowchart TD or LR)
- [ ] Includes decision points (diamond shapes)
- [ ] Shows both happy path and error paths
- [ ] Labels are clear and concise
- [ ] Renders correctly (valid Mermaid syntax)
- [ ] Should match examples in AGENT.md

**Success Criteria:**
- Diagram is complete (no missing steps)
- Decision logic is clear
- Can be understood by non-technical stakeholder

---

### Test Case 7: Sitemap / IA (Mermaid)

**Input:**
```
Create a sitemap using the Product & Growth Lead agent.

App structure:
- Landing page (public)
- Auth pages (Login, Signup)
- Dashboard (authenticated)
  - Releases list
  - Analytics (KPI dashboard)
  - Settings
    - Profile
    - Billing
    - Integrations
```

**Expected Output:**
- [ ] Mermaid flowchart (flowchart LR recommended)
- [ ] Shows parent-child relationships
- [ ] All pages/screens included
- [ ] Clear hierarchy
- [ ] Valid Mermaid syntax

**Success Criteria:**
- All pages are represented
- Hierarchy is logical
- Easy to scan visually

---

### Test Case 8: Sequence Diagram (Mermaid)

**Input:**
```
Use the Product & Growth Lead agent to create a sequence diagram for the Apple Sign In flow.

Technical flow:
1. User clicks "Sign Up with Apple" (Frontend)
2. Frontend redirects to Apple OAuth
3. Apple returns token to Frontend
4. Frontend sends token to Backend API
5. Backend validates token with Apple
6. Backend creates user in Database
7. Backend returns user + JWT to Frontend
8. Frontend stores JWT and redirects to Dashboard
```

**Expected Output:**
- [ ] Mermaid sequence diagram
- [ ] Shows interactions between: User, Frontend, Backend API, Apple API, Database
- [ ] Request/response flow is clear
- [ ] Includes error case (e.g., invalid token)
- [ ] Valid Mermaid syntax

**Success Criteria:**
- Flow is technically accurate
- Timing/order is correct
- Error handling shown

---

### Test Case 9: Wireframes (Lo-Fi)

**Input:**
```
Create wireframes for the Apple Sign In signup screen using the Product & Growth Lead agent.

Requirements:
- Platform: iOS mobile (375x667px - iPhone SE size)
- Elements: Logo, "Sign up with Apple" button, "OR" divider, Email signup form, "Already have an account? Log in" link
- Style: Lo-fi (boxes and labels, no visual polish)
```

**Expected Output (depends on environment):**

**If Claude Code:**
- [ ] Option to choose wireframe format (text, HTML, PNG via canvas-design, Excalidraw)
- [ ] If text: ASCII art or structured markdown
- [ ] If HTML: Basic HTML/CSS file with layout
- [ ] If PNG: Invoke canvas-design skill to generate wireframe image

**If Claude Desktop:**
- [ ] Text-based wireframe description with structure
- [ ] OR ASCII art representation
- [ ] OR link to Excalidraw/Figma with instructions

**Success Criteria:**
- Layout is clear and understandable
- All required elements are present
- Visual hierarchy is evident (even in lo-fi)
- Annotations explain interactions

---

### Test Case 10: Release Notes

**Input:**
```
Write release notes for the Apple Sign In feature using the Product & Growth Lead agent.

Shipped:
- Apple Sign In button on signup page (iOS only)
- Updated auth flow to support social auth
- Feature flag for gradual rollout

Audience: End users (indie hackers and small teams)
```

**Expected Output:**
- [ ] Human-readable summary (user-facing language, not technical)
- [ ] Benefit-focused (why users care)
- [ ] Change list (bullet points)
- [ ] Optional: Known issues or limitations
- [ ] Friendly, concise tone

**Example Format:**
```
# What's New - November 1, 2025

## Faster signup with Apple Sign In (iOS)

You can now sign up for ShipFast using your Apple ID—no password required. This is especially handy on iPhone where creating passwords can be a pain.

**What changed:**
- ✨ New "Sign up with Apple" button on the signup screen (iOS only)
- 🔒 Your existing email/password login still works (we didn't change anything there)
- 🚀 Faster signup = get to your first release notes in under 30 seconds

**Known limitations:**
- Apple Sign In is iOS-only for now. Android and web coming soon.

Happy shipping! 🚀
```

**Success Criteria:**
- Non-technical users can understand it
- Focuses on benefits, not implementation details
- Includes limitations/caveats if relevant

---

### Test Case 11: Launch Micro-Plan (GTM)

**Input:**
```
Create a launch micro-plan for Apple Sign In using the Product & Growth Lead agent.

Channels available:
- Email list (100 beta users)
- Twitter (500 followers)
- Product Hunt (planning a launch)

Goal: Drive awareness and get 20+ iOS signups in the first week
```

**Expected Output:**
- [ ] Launch checklist (pre-launch, launch day, post-launch)
- [ ] Copy for each channel (email subject/body, tweet, Product Hunt post)
- [ ] Assets needed (screenshots, GIFs, demo video)
- [ ] Timeline (what happens when)
- [ ] Success metrics to track

**Success Criteria:**
- Actionable copy ready to use
- Timeline is realistic
- Metrics are specific

---

## Full Integration Test: Complete Visual Pack

**Input:**
```
Use the Product & Growth Lead (0→1) agent to create a complete visual pack for Apple Sign In:

1. User flow diagram (Mermaid)
2. Sitemap (Mermaid)
3. Sequence diagram for auth flow (Mermaid)
4. Wireframes for signup screen (lo-fi, mobile)
5. Wireframe checklist (verify completeness)

Use the templates and resources in the agent directory.
```

**Expected Output:**
- [ ] All 5 artifacts delivered
- [ ] Artifacts are internally consistent (e.g., user flow matches wireframes)
- [ ] Ready to hand off to engineering
- [ ] Follows "show, don't tell" principle

---

## Agent Behavior Tests

### Test: Defaults and Assumptions

**Input:**
```
Create a PRD for Apple Sign In. I'm not providing all the context.
```

**Expected Behavior:**
- [ ] Agent asks clarifying questions OR
- [ ] Agent makes sensible assumptions and flags them clearly
- [ ] Agent does NOT invent fake data (e.g., specific user counts without basis)
- [ ] Agent proposes safe defaults (e.g., "I'll assume Supabase for auth unless you specify otherwise")

---

### Test: Integration with canvas-design

**Input (Claude Code environment):**
```
Create wireframes for the Apple Sign In screen. I want polished PNG files.
```

**Expected Behavior:**
- [ ] Agent recognizes it can invoke canvas-design skill
- [ ] Agent either:
  - Invokes canvas-design skill directly, OR
  - Asks if you want it to invoke canvas-design, OR
  - Creates lo-fi first, then offers to upgrade to PNG via canvas-design

---

### Test: One Metric That Matters

**Input:**
```
We're working on multiple things: Apple Sign In, onboarding improvements, and a new analytics dashboard. What should we focus on measuring?
```

**Expected Behavior:**
- [ ] Agent recommends ONE primary metric (OMTM)
- [ ] Justifies the choice based on product stage (0→1 = focus on activation)
- [ ] Suggests tracking secondary metrics but not optimizing for them yet
- [ ] References KPI framework (Acquisition → Activation → Retention → Revenue)

---

## Success Criteria for Agent

**The agent is working correctly if:**

1. **Output Quality:**
   - All outputs are scannable (tables, bullets, headers)
   - Uses templates from `templates/` directory as structure
   - Follows "lo-fi first" principle for wireframes
   - Mermaid diagrams have valid syntax

2. **Completeness:**
   - Covers success AND failure cases (e.g., signup errors)
   - Includes rollback plans for risky changes
   - Documents assumptions and open questions
   - Provides realistic timelines

3. **Consistency:**
   - User flow → wireframes → sequence diagram all tell the same story
   - Event names follow consistent naming (snake_case)
   - Metrics align with KPI framework in resources/kpi_definitions.json

4. **Practicality:**
   - Outputs are actionable (engineer can implement from Tech Spec)
   - Scoped to 1-week iterations
   - Acknowledges constraints (team size, timeline, tech stack)

5. **Expertise:**
   - Demonstrates Product + Growth + Ops knowledge
   - Uses industry best practices (ICE scoring, A/B testing, feature flags)
   - Calls out risks and trade-offs
   - Recommends "boring technology" for MVP unless user opts into risk

---

## How to Run This Test

### Manual Testing (Recommended)

1. **Copy the TEST_SCENARIO.md to a new project:**
   ```bash
   mkdir ~/test-product-growth-agent
   cp ~/Documents/Projects/skills-agents/agents/product-growth-lead-0to1/TEST_SCENARIO.md ~/test-product-growth-agent/
   cd ~/test-product-growth-agent
   ```

2. **Open Claude Code and invoke the agent:**
   ```
   Please use the Product & Growth Lead (0→1) agent from
   ~/Documents/Projects/skills-agents/agents/product-growth-lead-0to1/AGENT.md

   [Paste Test Case 1 input here]
   ```

3. **Validate output against expected criteria:**
   - Check off items in the "Expected Output" checklist
   - Verify "Success Criteria" are met
   - Note any issues or improvements needed

4. **Iterate:**
   - If output doesn't meet success criteria, refine the agent instructions in AGENT.md
   - Bump version number and document changes
   - Re-run tests

5. **Repeat for all 11 test cases.**

---

## Test Results Log (Example)

| Test Case | Date | Pass/Fail | Notes |
|-----------|------|-----------|-------|
| 1: PRD One-Pager | 2025-11-01 | ✅ Pass | Good structure, hit all checklist items |
| 2: Tech Spec | 2025-11-01 | ⚠️ Partial | Missing monitoring section, fixed in v1.0.1 |
| 3: Weekly Ship Plan | 2025-11-01 | ✅ Pass | Realistic timeline |
| 4: Experiment Brief | 2025-11-01 | ✅ Pass | ICE scores well justified |
| 5: Event Tracking | 2025-11-01 | ✅ Pass | Clear properties and examples |
| 6: User Flow | 2025-11-01 | ✅ Pass | Valid Mermaid syntax |
| 7: Sitemap | 2025-11-01 | ✅ Pass | Clear hierarchy |
| 8: Sequence Diagram | 2025-11-01 | ✅ Pass | Accurate flow |
| 9: Wireframes | 2025-11-01 | ⚠️ Partial | Text-based works, need to test PNG via canvas-design |
| 10: Release Notes | 2025-11-01 | ✅ Pass | User-friendly tone |
| 11: Launch Plan | 2025-11-01 | ✅ Pass | Actionable copy |
| Integration: Full Visual Pack | 2025-11-01 | ✅ Pass | All artifacts consistent |

---

## Next Steps After Testing

1. **If all tests pass:**
   - Mark agent as v1.0.0 stable
   - Use in real projects
   - Collect feedback and iterate

2. **If tests fail:**
   - Document failures
   - Update AGENT.md instructions
   - Bump version (e.g., v1.0.1)
   - Re-run failed tests

3. **Continuous improvement:**
   - Add new test cases as you discover edge cases
   - Refine templates based on real-world usage
   - Share learnings in version history

---

**End of Test Scenario**

This test suite validates that the Product & Growth Lead (0→1) agent can handle realistic 0→1 product planning, design, analytics, and launch tasks. Run these tests whenever you update the agent to ensure consistent quality.
