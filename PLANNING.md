# Strategic Planning Dashboard - Project Planning

**Last Updated:** 2025-11-05  
**Status:** Ready for execution

---

## 📊 Project Overview

This document outlines the roadmap to take our strategic planning dashboard from "admin tool proof-of-concept" to "production-ready B2B SaaS product" ready for district acquisition.

### Current State
- ✅ Admin backend validated (client impressed)
- ✅ Technical foundation solid (Vite, React, Supabase, RLS)
- ✅ Core features complete (goals, metrics, Excel import)
- ⚠️ Public views need polish (parent engagement layer)
- ❌ Marketing site not started
- ❌ Free tier/monetization not implemented

### Target State (9 weeks)
- ✅ Demo-ready for Westside client feedback
- ✅ Engaging public views (parent/community facing)
- ✅ Marketing website (Frill.co-style B2B landing)
- ✅ Free tier with upgrade path
- ✅ Ready to acquire first 10 districts

---

## 🎯 Milestones

### Milestone 1: Pre-Launch Polish (Weeks 1-2)
**Due:** Dec 18, 2025  
**Goal:** Get demo-ready for Westside client

**Issues (6 total):**
- [#31](https://github.com/ptoney514/strategic-plan-app/issues/31) Fix hardcoded landing page data (60 min) 🔴 P0
- [#32](https://github.com/ptoney514/strategic-plan-app/issues/32) Wire Excel template download (30 min) 🔴 P0
- [#33](https://github.com/ptoney514/strategic-plan-app/issues/33) Make SlidePanel responsive (30 min) 🔴 P0
- [#34](https://github.com/ptoney514/strategic-plan-app/issues/34) Add first-run onboarding wizard (90 min) 🔴 P0
- [#35](https://github.com/ptoney514/strategic-plan-app/issues/35) Add admin CTAs to empty states (45 min) 🟡 P1
- [#54](https://github.com/ptoney514/strategic-plan-app/issues/54) Test on real mobile devices (60 min) 🟡 P1

**Total Time:** ~6 hours  
**Outcome:** Ready to demo admin + public to Westside

---

### Milestone 2: Public View Polish (Weeks 3-4)
**Due:** Jan 2, 2026  
**Goal:** Make parent-facing views engaging for marketing screenshots

**Issues (7 total):**
- [#36](https://github.com/ptoney514/strategic-plan-app/issues/36) Simplify landing page - merge sections (75 min) 🟡 P1
- [#37](https://github.com/ptoney514/strategic-plan-app/issues/37) Add "How this helps students" field (60 min) 🟡 P1
- [#38](https://github.com/ptoney514/strategic-plan-app/issues/38) Add visual hierarchy to AdminDashboard (75 min) 🟡 P1
- [#39](https://github.com/ptoney514/strategic-plan-app/issues/39) Add Zod schema validation (75 min) 🟡 P1
- [#40](https://github.com/ptoney514/strategic-plan-app/issues/40) Add publish/draft workflow (90 min) 🟡 P1
- [#52](https://github.com/ptoney514/strategic-plan-app/issues/52) Add success story module (90 min) 🟢 P2
- [#53](https://github.com/ptoney514/strategic-plan-app/issues/53) Add social share buttons (45 min) 🟢 P2

**Total Time:** ~9 hours  
**Outcome:** Beautiful public views ready for screenshots

---

### Milestone 3: Marketing Site MVP (Weeks 5-6)
**Due:** Jan 16, 2026  
**Goal:** Build B2B marketing site to acquire districts

**Issues (6 total):**
- [#41](https://github.com/ptoney514/strategic-plan-app/issues/41) Create B2B homepage (90 min)
- [#42](https://github.com/ptoney514/strategic-plan-app/issues/42) Build pricing page (75 min)
- [#43](https://github.com/ptoney514/strategic-plan-app/issues/43) Create features page (60 min) 🟢 P2
- [#44](https://github.com/ptoney514/strategic-plan-app/issues/44) Create demo page (60 min) 🟢 P2
- [#45](https://github.com/ptoney514/strategic-plan-app/issues/45) Implement signup flow (90 min) 🟡 P1
- [#46](https://github.com/ptoney514/strategic-plan-app/issues/46) Write marketing copy (90 min) 🟢 P2

**Total Time:** ~8 hours  
**Outcome:** Self-serve signups enabled

---

### Milestone 4: Free Tier & Monetization (Weeks 7-8)
**Due:** Jan 30, 2026  
**Goal:** Enable freemium model with paid upgrade path

**Issues (5 total):**
- [#47](https://github.com/ptoney514/strategic-plan-app/issues/47) Add tier column to districts table (45 min)
- [#48](https://github.com/ptoney514/strategic-plan-app/issues/48) Add tier gating for limits (90 min) 🟡 P1
- [#49](https://github.com/ptoney514/strategic-plan-app/issues/49) Add upgrade CTA (45 min) 🟢 P2
- [#50](https://github.com/ptoney514/strategic-plan-app/issues/50) Integrate Stripe (120+ min) 🟢 P2
- [#51](https://github.com/ptoney514/strategic-plan-app/issues/51) Handle trial expiration (90 min) 🟢 P2

**Total Time:** ~7 hours  
**Outcome:** Revenue-ready with paid tiers

---

### Milestone 5: Launch Ready (Week 9)
**Due:** Feb 6, 2026  
**Goal:** Final testing and soft launch prep

**Issues (1 total):**
- [#55](https://github.com/ptoney514/strategic-plan-app/issues/55) Add E2E tests for critical workflows (90 min) 🟢 P2

**Total Time:** ~2 hours  
**Outcome:** Production-ready for soft launch

---

## 🎨 UX Simplification Summary

Based on comprehensive UX audit, here are the key simplifications:

### 1. DistrictLandingPage
**Before:** 5 sections (Header, Hero, Overview, Mission/Vision/Values, Footer)  
**After:** 3 sections (Hero + Mission, Goal Cards Preview, Footer)  
**Impact:** Faster load, clearer CTA, less scrolling

### 2. DistrictDashboard  
**Before:** Fixed 512px slide panel (breaks mobile)  
**After:** Responsive 90vw (mobile) / 600px (desktop)  
**Impact:** Mobile-friendly, better UX

### 3. AdminDashboard
**Before:** 6 equal-prominence action cards (cognitive overload)  
**After:** 1 primary CTA + 2-3 secondary + collapsed "More"  
**Impact:** Clear next step for new users

### 4. ObjectiveBuilder
**Before:** All fields at once (overwhelming)  
**After:** 4-step wizard with progressive disclosure  
**Impact:** Higher completion rate, less confusion

### 5. SlidePanel
**Before:** All content expanded (too much scrolling)  
**After:** Accordion sections (collapsed by default)  
**Impact:** Faster initial render, less overwhelming

---

## 📋 Free Tier Definition

| Feature | Free | Starter ($99/mo) | Pro ($299/mo) | Enterprise |
|---------|------|------------------|---------------|------------|
| **Objectives** | 3 | Unlimited | Unlimited | Unlimited |
| **Goals** | 10 | Unlimited | Unlimited | Unlimited |
| **Metrics** | 20 | Unlimited | Unlimited | Unlimited |
| **Schools** | 1 | Unlimited | Unlimited | Unlimited |
| **Public Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Custom Branding** | Logo + 2 colors | Full palette | Full palette | Full palette |
| **Success Stories** | ❌ | ✅ | ✅ | ✅ |
| **Remove "Powered by"** | ❌ | ✅ | ✅ | ✅ |
| **Role-Based Dashboards** | ❌ | ❌ | ✅ | ✅ |
| **Custom Domain** | ❌ | ❌ | ✅ | ✅ |
| **Analytics** | ❌ | ❌ | ✅ | ✅ |
| **Email Newsletter** | ❌ | ❌ | ✅ | ✅ |
| **Data Integrations** | ❌ | ❌ | ❌ | ✅ |
| **White-Label** | ❌ | ❌ | ❌ | ✅ |
| **SSO** | ❌ | ❌ | ❌ | ✅ |
| **Support** | Community | Email (48h) | Email (24h) | Dedicated CSM |

**Trial:** 14 days for all paid tiers (no credit card required)

---

## 🚀 Marketing Site Structure

Based on Frill.co reference:

### Homepage (`/`)
```
Hero + Problem + Solution + Features + Social Proof + Pricing Teaser + CTA
```

### Pricing (`/pricing`)
```
4-column comparison table + FAQ + Annual discount CTA
```

### Features (`/features`)
```
Admin features + Public features + Insights (coming soon)
```

### Demo (`/demo`)
```
Video walkthrough + Interactive iframe + CTA
```

### Signup (`/signup`)
```
Form: Email, District Name, Password → Create account → Onboarding
```

---

## 📊 Success Metrics (Post-Launch)

### Acquisition
- Website visitors (target: 500/month by Month 3)
- Demo requests (target: 20/month)
- Free signups (target: 10/month by Month 2)
- Free → Paid conversion (target: 10%)

### Activation
- % districts that create first objective within 7 days (target: 80%)
- % districts that publish public dashboard within 30 days (target: 60%)

### Engagement
- Admin logins per week (target: 2+)
- Public dashboard views per district (target: 100/month)
- Metrics updated per month (target: 1+)

### Retention
- Monthly active districts (target: 80%)
- Churn rate (target: <5% annually)

### Revenue
- MRR (target: $1K by Month 3, $5K by Month 6)
- ARR (target: $70K by end of Year 1)
- Average contract value (target: $1,500)

---

## 🎯 Next Actions

### This Week (Week 1)
1. [#31](https://github.com/ptoney514/strategic-plan-app/issues/31) Fix hardcoded landing page data
2. [#32](https://github.com/ptoney514/strategic-plan-app/issues/32) Wire Excel template download
3. [#33](https://github.com/ptoney514/strategic-plan-app/issues/33) Make SlidePanel responsive
4. [#34](https://github.com/ptoney514/strategic-plan-app/issues/34) Add onboarding wizard
5. [#54](https://github.com/ptoney514/strategic-plan-app/issues/54) Mobile testing

**Goal:** Demo-ready for Westside by end of week

### Next Week (Week 2)
1. Get Westside feedback on admin + public views
2. Start Milestone 2 (Public View Polish)
3. Take screenshots of polished views for marketing

---

## 📚 Resources

- **GitHub Milestones:** https://github.com/ptoney514/strategic-plan-app/milestones
- **All Issues:** https://github.com/ptoney514/strategic-plan-app/issues
- **Product Evaluation:** See Product & Growth Lead agent report
- **UX Wireframes:** See this document (sections above)
- **Original Vision:** `/Users/pernelltoney/Downloads/Lets take this a step further...md`

---

**Questions? Feedback?**  
Review this plan and let's discuss priorities before diving into Week 1 sprint!
