# Experiment Brief: [Experiment Name]

**Date:** [YYYY-MM-DD]
**Owner:** [Growth Lead Name]
**Status:** [Planning / Running / Complete / Abandoned]
**Experiment ID:** [EXP-001]

---

## Experiment Overview

**One-line summary:**
[What are we testing in one sentence?]

**Example:** "Testing if adding Apple Sign In increases mobile signup conversion from 8% to 12%."

---

## Hypothesis

**We believe that:**
[Action/change we're making]

**Will result in:**
[Expected outcome]

**Because:**
[Reasoning/insight from data or research]

**Example:**
- **We believe that:** Adding 1-click Apple Sign In for iOS users
- **Will result in:** 15%+ of new signups using Apple (vs. 0% baseline) and overall mobile conversion increasing from 8% to 12%
- **Because:** User research shows 60% of our mobile users abandon signup at the "create password" step, citing friction

---

## ICE Score (Prioritization)

**Impact:** [1-10] - How much will this move the metric?
- 1-3: Minimal impact (<5% change)
- 4-7: Moderate impact (5-20% change)
- 8-10: High impact (>20% change)

**Confidence:** [1-10] - How sure are we this will work?
- 1-3: Low confidence (speculative)
- 4-7: Medium confidence (some evidence)
- 8-10: High confidence (proven pattern)

**Ease:** [1-10] - How easy is this to implement?
- 1-3: Hard (>2 weeks, complex dependencies)
- 4-7: Medium (1-2 weeks, moderate complexity)
- 8-10: Easy (<1 week, simple change)

**Total ICE Score:** [Sum of above] / 30

**Example:**
- Impact: 8/10 (could increase mobile conversion by 50%)
- Confidence: 7/10 (proven pattern in other apps)
- Ease: 6/10 (requires Apple Developer setup)
- **Total: 21/30** ← High priority

---

## Target Metric

**Primary Metric:**
- Metric name: [e.g., Mobile signup conversion rate]
- Current baseline: [X%]
- Target: [Y%]
- Measurement period: [Duration to run experiment]

**Secondary Metrics:**
- [Metric 2]: [Current] → [Target]
- [Metric 3]: [Current] → [Target]

**Anti-Metrics (Guardrails):**
- [Metric to watch]: Should NOT drop below [threshold]
- Example: Desktop signup conversion should stay above 10%

---

## Success Criteria

**Experiment succeeds if:**
- [ ] [Primary metric] reaches [target] within [timeframe]
- [ ] [Secondary metric] stays above [threshold]
- [ ] No degradation in [anti-metric]
- [ ] Statistical significance reached (p < 0.05, 95% confidence)

**Experiment fails if:**
- [ ] [Primary metric] doesn't improve by at least [minimum threshold]
- [ ] [Anti-metric] drops below [threshold]
- [ ] User complaints increase by >X%

**Example success criteria:**
- ✅ Apple Sign In used by >15% of mobile signups
- ✅ Mobile conversion increases from 8% to >10% (min. 25% relative lift)
- ✅ Desktop conversion stays above 10%
- ✅ No increase in auth errors (<1%)

---

## Experiment Design

### Control vs. Variant

**Control (A):**
- Current experience: [Describe]
- Example: Email/password signup only

**Variant (B):**
- New experience: [Describe]
- Example: Email/password + Apple Sign In button (above email option)

### Traffic Allocation

- **Control:** [X]% of users
- **Variant:** [Y]% of users
- **Total traffic:** [Z]% of eligible users

**Example:**
- Control: 50% of iOS mobile users
- Variant: 50% of iOS mobile users
- Total: 100% of iOS mobile users (Android excluded)

### Targeting / Segmentation

**Who is included:**
- Platform: [e.g., iOS mobile only]
- Geography: [e.g., US users only]
- User type: [e.g., New users only, not existing users]

**Who is excluded:**
- [e.g., Android users, existing users, etc.]

---

## Implementation Plan

### Changes Required

**Frontend:**
- [ ] Add Apple Sign In button to signup page
- [ ] Handle Apple auth token exchange
- [ ] Update signup flow UX

**Backend:**
- [ ] Implement `/auth/apple` endpoint
- [ ] Store `auth_method` in user table
- [ ] Validate Apple tokens with Apple API

**Analytics:**
- [ ] Track `signup_method_selected` event
- [ ] Track `signup_completed` with `auth_method` property
- [ ] Update conversion funnel dashboard

### Feature Flag

```javascript
{
  "apple_signin_enabled": {
    "enabled": true,
    "rollout_percentage": 50,
    "targeting": {
      "platform": "iOS",
      "user_type": "new"
    }
  }
}
```

### Timeline

| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
| Design Apple button variant | [Name] | [Date] | [ ] |
| Implement frontend changes | [Name] | [Date] | [ ] |
| Implement backend endpoint | [Name] | [Date] | [ ] |
| Add analytics tracking | [Name] | [Date] | [ ] |
| QA on staging | [Name] | [Date] | [ ] |
| Enable for 10% (test) | [Name] | [Date] | [ ] |
| Enable for 50% (experiment) | [Name] | [Date] | [ ] |
| Analyze results | [Name] | [Date] | [ ] |

---

## Analytics & Tracking

### Events to Track

| Event Name | Trigger | Properties | Owner |
|------------|---------|------------|-------|
| `signup_started` | User lands on signup page | `platform`, `variant` | [Name] |
| `signup_method_selected` | User clicks auth button | `method` (email/apple) | [Name] |
| `signup_completed` | Account created | `method`, `variant`, `duration` | [Name] |
| `signup_failed` | Signup error | `method`, `error_type` | [Name] |

### Funnel to Monitor

```
1. Landing page view          100% (baseline)
   ↓
2. Signup page view            60%
   ↓
3. Auth method selected        45%
   ↓
4. Signup completed            8% (control) vs. 12% (target for variant)
```

### Dashboard Setup

**Real-time monitoring:**
- Conversion rate by variant (updated hourly)
- Error rate by auth method
- Sample size & statistical significance

**Weekly review:**
- Cohort retention (D1, D7, D30)
- Activation rate by signup method
- Qualitative feedback from user surveys

---

## Sample Size & Duration

**Minimum sample size:**
- Control: [X] conversions
- Variant: [Y] conversions
- Total: [Z] conversions needed for 95% confidence, 80% power

**Expected duration:**
- At current traffic ([N] signups/day), need [X] days to reach significance

**Early stopping criteria:**
- If variant performs >50% worse, stop after 3 days
- If variant performs >100% better, can call early after 7 days (if statistically significant)

**Calculator:** [Link to sample size calculator or tool]

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Apple auth fails intermittently | Medium | High | Implement retry logic + error tracking; fallback to email |
| Users confused by 2 auth options | Low | Medium | A/B test button copy and positioning |
| Variant performs worse | Low | Medium | Monitor daily; kill experiment if conversion drops >10% |
| Not enough traffic to reach significance | Medium | Low | Extend experiment duration or increase traffic allocation |

---

## Rollback Plan

**If we need to stop the experiment:**
1. Disable feature flag (takes <1 minute)
2. Users in variant automatically see control
3. No data loss (all auth methods supported)

**Rollback triggers:**
- Conversion drops by >10% in variant
- Error rate exceeds 2%
- User complaints spike (>20 in 24hrs)
- Apple API downtime >4 hours

---

## Decision Framework

**After [X] days or [Y] conversions:**

**If experiment succeeds (hit success criteria):**
- [ ] Roll out to 100% of iOS users
- [ ] Plan Android variant (Google Sign In)
- [ ] Remove feature flag after 2 weeks of stability
- [ ] Document learnings for future experiments

**If experiment fails (doesn't hit success criteria):**
- [ ] Analyze why (qualitative user feedback, funnel drop-off)
- [ ] Decide: Iterate on variant OR sunset feature
- [ ] Document learnings

**If results are inconclusive:**
- [ ] Extend experiment duration
- [ ] Increase traffic allocation
- [ ] Revise hypothesis and retry

---

## Post-Experiment Analysis

**Questions to answer:**
1. Did we hit our target metric? By how much?
2. Were there unexpected side effects (good or bad)?
3. Did results vary by segment (geography, device, time of day)?
4. What did we learn about user behavior?
5. What should we test next based on these results?

**Learnings template:**
```
# Experiment Results: [Name]

## Summary
- Result: [Success / Fail / Inconclusive]
- Metric: [X%] → [Y%] ([+/-Z%] change)
- Statistical significance: [Yes/No, p-value]

## What worked
- [Insight 1]
- [Insight 2]

## What didn't work
- [Insight 1]
- [Insight 2]

## Next steps
- [Action 1]
- [Action 2]
```

---

## Resources & Links

**Related docs:**
- PRD: [Link]
- Tech Spec: [Link]
- Design mockups: [Figma link]

**Tools:**
- Analytics dashboard: [Link]
- Feature flag dashboard: [Link]
- A/B test calculator: [Link]

**Prior art / research:**
- [Research study 1]
- [Competitor analysis]
- [User feedback summary]

---

## Stakeholder Sign-off

- [ ] Growth Lead: [Name] - [Date]
- [ ] Product Lead: [Name] - [Date]
- [ ] Engineering Lead: [Name] - [Date]
- [ ] Data/Analytics: [Name] - [Date]

---

**Experiment Checklist (before launch):**

- [ ] Hypothesis clearly defined
- [ ] Success criteria agreed upon
- [ ] Sample size calculated
- [ ] Feature flag configured
- [ ] Analytics events implemented and tested
- [ ] Dashboard created for real-time monitoring
- [ ] Rollback plan documented
- [ ] Stakeholders notified
- [ ] QA completed on staging
- [ ] Launched to initial % (smoke test)
