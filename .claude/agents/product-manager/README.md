# Product Manager (Core)

Expert Product Manager for PRDs, roadmaps, user stories, prioritization frameworks, stakeholder management, and user research across all product stages.

## Overview

This agent provides **pure product management expertise** applicable across all product lifecycle stages (0→1, growth, scaling, maturity). Unlike specialized agents focused on growth, architecture, or design, this agent focuses on core PM fundamentals: defining **what** to build, **why**, and **for whom**.

## Core Capabilities

### Product Discovery & User Research
- Design user interview guides and research plans
- Validate user pain points and problem severity
- Create user personas and journey maps
- Define Jobs-to-be-Done (JTBD) frameworks
- Synthesize research into actionable insights

### Product Requirements & Specifications
- Write comprehensive PRDs with clear requirements
- Define functional and non-functional requirements
- Document edge cases, error states, and constraints
- Specify success metrics and acceptance criteria
- Create detailed user stories

### Prioritization Frameworks
- **RICE:** Reach × Impact × Confidence / Effort
- **Value vs. Effort Matrix:** 2×2 grid (Quick Wins, Strategic Bets)
- **MoSCoW:** Must have, Should have, Could have, Won't have
- **Kano Model:** Basic needs, Performance needs, Delighters

### Product Roadmapping
- Create Now/Next/Later roadmaps
- Build theme-based or outcome-based roadmaps
- Define quarterly/monthly timelines
- Communicate trade-offs and dependencies
- Update roadmaps based on learning

### Stakeholder Management
- Align cross-functional teams (engineering, design, business)
- Navigate conflicting priorities diplomatically
- Communicate decisions and trade-offs clearly
- Use RACI framework for decision-making
- Say "no" gracefully with rationale

### Product Strategy & Vision
- Define product vision (3-5 year aspiration)
- Establish North Star Metric
- Create product principles for decision-making
- Align with company mission and strategy

### Competitive Analysis
- Analyze direct and indirect competitors
- Create competitive feature matrices
- Identify differentiation opportunities
- Size markets (TAM, SAM, SOM)

### Product Metrics & Analytics
- Define metrics: Acquisition, Activation, Engagement, Retention, Revenue
- Create metric dashboards
- Measure feature success post-launch
- Use data to inform product decisions

## When to Use This Agent

✅ **Use this agent when:**
- Writing comprehensive PRDs for complex features
- Prioritizing backlog using frameworks (RICE, Value vs. Effort)
- Creating quarterly or annual product roadmaps
- Conducting user research and defining personas
- Managing stakeholder alignment and communication
- Defining product strategy and vision
- Breaking epics into user stories with acceptance criteria
- Performing competitive analysis

❌ **Don't use this agent for:**
- Growth experiments and analytics (use **Product Operations**)
- Deep technical architecture (use **Technical Architect**)
- Visual design and mockups (use **UX/UI Designer**)
- Fast MVP execution (use **Product & Growth Lead 0→1**)
- Code implementation (use development agents)

## Example Use Cases

### 1. Comprehensive PRD for Data Export Feature

**Task:** "Create a PRD for allowing users to export their data to CSV/Excel"

**Output includes:**
- Executive summary with problem statement and solution
- User personas (power users, admins, analysts)
- User stories with acceptance criteria
- Functional requirements (P0: CSV export, P1: Excel with formatting, P2: scheduled exports)
- Non-functional requirements (performance: <5s for 10K rows, security: auth required)
- Edge cases (large datasets, format options, download failures)
- Success metrics (% users who export, export completion rate)
- Launch plan with rollout strategy

### 2. Prioritize 15 Feature Requests Using RICE

**Task:** "We have 15 feature requests from customers, sales, and internal teams. Help me prioritize."

**Output includes:**
- RICE scoring table for all 15 features
- Ranked list by RICE score
- Top 3 recommendations with rationale
- Trade-off analysis (doing X means delaying Y)
- Communication plan for declined requests

### 3. Q2 Roadmap Focused on User Retention

**Task:** "Create our Q2 roadmap. Main goal is improving user retention from 40% to 55% D7."

**Output includes:**
- Theme-based roadmap (retention focus)
- Now (Month 1): Onboarding redesign
- Next (Month 2-3): Email re-engagement, push notifications
- Later (Backlog): Personalized recommendations
- Success metrics for each initiative
- Dependencies (design, engineering, marketing)
- What we're NOT doing this quarter

## PRD Template Structure

The agent uses this comprehensive PRD template:

```markdown
# [Feature Name] PRD

## Executive Summary
- Problem statement
- Proposed solution
- Success metric
- Target launch date

## Background & Context
## Goals & Success Metrics
## User Personas & Target Audience
## User Stories & Use Cases
## Functional Requirements (P0, P1, P2)
## Non-Functional Requirements
## User Experience & Design
## Technical Considerations
## Edge Cases & Error Handling
## Out of Scope
## Open Questions & Risks
## Launch Plan
## Appendix
```

## Prioritization Frameworks

### RICE Framework

```
Feature: One-click Apple Sign-In
- Reach: 1,000 new users/month
- Impact: 2 (massive improvement)
- Confidence: 80%
- Effort: 2 person-months
- RICE Score: (1000 × 2 × 0.8) / 2 = 800
```

### Value vs. Effort Matrix

```
High Value, Low Effort  → Quick Wins (do first)
High Value, High Effort → Strategic Bets (plan carefully)
Low Value, Low Effort   → Fill-ins (do if time permits)
Low Value, High Effort  → Time Sinks (avoid)
```

## Best Practices

### User-Centric Thinking
- Always start with user problems, not solutions
- Validate assumptions with user research
- Include user quotes in PRDs
- Test prototypes before building

### Data-Driven Decisions
- Define success metrics before building
- Use quantitative (analytics) and qualitative (interviews) data
- Measure impact post-launch
- Kill features that don't deliver value

### Clear Communication
- Write concisely, avoid jargon
- Use visuals (diagrams, wireframes, tables)
- Provide context and rationale
- Document everything

### Collaboration
- Involve engineering and design early
- Co-create solutions with cross-functional team
- Respect specialist expertise
- Build trust through transparency

## How to Invoke

**In Claude Code:**
```
I need help writing a PRD for [feature].

Launch a Product Manager agent using the prompt from:
agents/product-manager/AGENT.md
```

**Direct reference:**
```
Please read agents/product-manager/AGENT.md and help me prioritize
our backlog using RICE framework.
```

## Configuration

- **Model:** Sonnet (recommended for balanced speed/quality)
  - Use Opus for complex strategic decisions
  - Use Haiku for simple user stories or quick prioritization
- **Thoroughness:** Comprehensive (default), or specify "lean" for one-pagers
- **Output:** Markdown (default), can generate tables, JSON

## Related Agents

**Use together with:**
- **Product & Growth Lead 0→1** - For MVP speed execution (weeks 1-12)
- **Product Operations** - For analytics, experiments, launch execution
- **Technical Architect** - For deep technical specifications
- **UX/UI Designer** - For visual design and mockups

**Product Manager sits at the center:**
- Defines requirements → Technical Architect implements
- Validates problems → UX/UI Designer creates solutions
- Plans launches → Product Operations executes experiments
- Leads 0→1 → Product & Growth Lead 0→1 for speed

## Tips for Best Results

1. **Provide context:** Share product stage, users, business goals
2. **Be specific about output:** "Comprehensive PRD" vs. "One-pager"
3. **Share constraints:** Timeline, team size, technical limitations
4. **Include data:** User feedback, analytics, research insights
5. **Iterate:** First draft is for feedback; refine together

## Version History

- **1.0.0** (2025-11-05) - Initial version with core PM capabilities

---

**Questions?**
- See [AGENT.md](./AGENT.md) for complete agent instructions
- See [agents/README.md](../README.md) for general agent guidance
