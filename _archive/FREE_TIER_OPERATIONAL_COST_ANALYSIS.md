# FREE Tier Operational Cost Analysis

## Strategic Plan Builder SaaS

**Version:** 1.0
**Date:** November 5, 2025
**Author:** Product & Growth Lead
**Purpose:** Calculate investment required to support FREE tier users (Years 1-3)

---

## Executive Summary

### Bottom Line: What Will It Cost?

| Scenario                    | Year 1 (100 FREE users) | Year 2 (350 FREE users) | Year 3 (500 FREE users) |
| --------------------------- | ----------------------- | ----------------------- | ----------------------- |
| **Lean (Bootstrap)**        | **$1,920**              | **$4,560**              | **$5,760**              |
| **Base Case (Recommended)** | **$7,720**              | **$17,060**             | **$21,860**             |
| **Growth (VC-funded)**      | **$25,720**             | **$67,060**             | **$91,860**             |

### Key Insights

1. **Infrastructure costs are VERY LOW**: $1-2/month per FREE user (Supabase Free tier covers 500+ users)
2. **Support is the main variable**: Community (free) vs. dedicated community manager ($36K-60K/year)
3. **Marketing drives total cost**: Organic-only ($0 CAC) vs. paid acquisition ($150-800 CAC)
4. **Break-even conversion**: Need 7-10 FREE → STARTER conversions to cover Year 1 Base Case costs

### Recommendation: Start Lean, Scale to Base Case

- **Months 1-6:** Lean scenario ($960 first 6 months)
- **Months 7-12:** Transition to Base Case as conversions validate model
- **Year 2+:** Base Case with selective paid marketing

---

## 1. Infrastructure Costs (Per User Breakdown)

### 1.1 Supabase Database & Storage Costs

#### FREE Tier Specifications (Per User)

- **1 district** with minimal metadata (~5 KB)
- **3 strategic objectives** (~3 rows, 1 KB)
- **10 goals total** (~10 rows, 15 KB)
- **20 metrics total** (~20 rows, 30 KB)
- **1 logo upload** (~100 KB average)
- **Historical data** (goal/metric updates, ~10 KB/month growth)

**Total storage per FREE user:**

- Initial: ~151 KB (0.15 MB)
- After 12 months: ~271 KB (0.27 MB)

#### Database Operations (Per User Per Month)

- **Reads:** ~500-800 (dashboard views + admin edits)
- **Writes:** ~50-100 (goal/metric updates)
- **Storage growth:** ~10 KB/month

#### Supabase Pricing Analysis

**Free Tier ($0/month):**

- 500 MB database storage (supports **1,850 FREE users** at 0.27 MB/user)
- 1 GB file storage (supports **10,240 users** at 100 KB/user)
- 2 GB egress/month (supports **13,333 users** at 150 KB/month average)
- 50,000 MAUs (far exceeds our needs)
- **Verdict:** Free tier covers all Year 1-3 FREE users (100-500 users)

**Pro Tier ($25/month):**

- Only needed if:
  - FREE users exceed 500 (won't happen in Year 3)
  - Need longer log retention (nice-to-have, not critical)
  - Want higher egress limits (2 GB → 250 GB)
- **Verdict:** NOT required for FREE tier support

**Cost Per FREE User (Infrastructure Only):**

- **Months 1-36:** $0/user (Supabase Free tier sufficient)
- **IF Pro tier needed:** $25/mo ÷ 500 users = **$0.05/user/month**

### 1.2 Vercel Hosting Costs

#### Traffic Assumptions (Per FREE User Per Month)

- **Dashboard views:** 20 views/month (public + admin)
- **Page size:** ~500 KB initial load (JS bundle + assets)
- **Cached repeat visits:** ~50 KB (client-side caching)
- **Bandwidth per user:** (20 views × 0.5 MB) / 2 = **5 MB/month**

#### Vercel Pricing Analysis

**Hobby Plan ($0/month):**

- 100 GB bandwidth/month (supports **20,480 FREE users** at 5 MB/user)
- 150,000 serverless function invocations/month
- **Verdict:** Free tier covers all Year 1-3 FREE users (100-500 users)

**Pro Plan ($20/month per user):**

- 1 TB bandwidth/month (for TEAM, not per-customer needs)
- Only needed if Hobby bandwidth exceeded (won't happen)
- **Verdict:** NOT required for FREE tier support

**Cost Per FREE User (Hosting Only):**

- **Months 1-36:** $0/user (Vercel Hobby plan sufficient)

### 1.3 Supabase Auth Costs

**Authentication API Calls (Per FREE User Per Month):**

- Login events: ~4-8 logins/month (weekly admin access)
- Session refreshes: ~10-20/month
- **Total Auth API calls:** ~15-30/month

**Supabase Auth Pricing:**

- Included in Free tier (50,000 MAUs covers all users)
- No overage charges for Auth on Free tier
- **Cost:** $0/user

### 1.4 Total Infrastructure Cost Summary

| Infrastructure Component      | Year 1 (100 users) | Year 2 (350 users) | Year 3 (500 users) | Cost/User/Month |
| ----------------------------- | ------------------ | ------------------ | ------------------ | --------------- |
| Supabase (Database + Storage) | $0                 | $0                 | $0                 | $0.00           |
| Vercel (Hosting + CDN)        | $0                 | $0                 | $0                 | $0.00           |
| Supabase Auth                 | $0                 | $0                 | $0                 | $0.00           |
| **TOTAL INFRASTRUCTURE**      | **$0**             | **$0**             | **$0**             | **$0.00**       |

**KEY INSIGHT:** Infrastructure costs are **ZERO** for FREE tier until 500+ users. Supabase Free tier and Vercel Hobby plan cover all projected growth.

---

## 2. Support Costs

### 2.1 Community Support (FREE Tier Specification)

**Support Channels:**

- Discord or community forum (Discourse, Circle, etc.)
- Knowledge base / help docs
- Email support (STARTER tier only)

### 2.2 Community Platform Costs

#### Option A: Discord (Recommended for Lean)

- **Cost:** $0/month (free tier)
- **Moderation time:** 2-5 hours/month (founder-led)
- **Scalability:** Good for 100-500 users
- **Pros:** Free, familiar to users, easy setup
- **Cons:** Not searchable, no knowledge base

#### Option B: Circle Community

- **Cost:** $39-99/month (Community plan)
- **Moderation time:** 3-7 hours/month
- **Scalability:** Excellent for 500-5,000 users
- **Pros:** Searchable, knowledge base, better UX
- **Cons:** Monthly cost, steeper learning curve

#### Option C: Discourse (Self-hosted)

- **Cost:** $100/month (DigitalOcean hosting)
- **Moderation time:** 5-10 hours/month (includes setup/maintenance)
- **Scalability:** Excellent for 1,000+ users
- **Pros:** Full control, SEO-friendly, free software
- **Cons:** Requires DevOps, higher time investment

**Recommendation:**

- **Lean scenario:** Discord (free)
- **Base Case scenario:** Circle Community ($39-99/mo)
- **Growth scenario:** Discourse ($100/mo) + community manager

### 2.3 Support Labor Costs

#### Lean Scenario (Founder-Led)

- **Time commitment:** 2-5 hours/month
- **Opportunity cost:** $0 (nights/weekends)
- **Response time:** 48-72 hours
- **Scalability:** Up to 100-150 FREE users

#### Base Case Scenario (Part-Time Community Manager)

- **Time commitment:** 10-15 hours/month ($30/hour contractor)
- **Monthly cost:** $300-450/month
- **Response time:** 24-48 hours
- **Scalability:** Up to 500-1,000 FREE users

#### Growth Scenario (Full-Time Community Manager)

- **Time commitment:** 160 hours/month (full-time)
- **Salary + benefits:** $60K/year ($5,000/month)
- **Response time:** <12 hours
- **Scalability:** Up to 5,000+ FREE users

### 2.4 Support Cost Summary

| Scenario      | Platform Cost    | Labor Cost         | Total Support/Month | Annual Support Cost |
| ------------- | ---------------- | ------------------ | ------------------- | ------------------- |
| **Lean**      | $0 (Discord)     | $0 (founder)       | **$0**              | **$0**              |
| **Base Case** | $99 (Circle)     | $450 (part-time)   | **$549**            | **$6,588**          |
| **Growth**    | $100 (Discourse) | $5,000 (full-time) | **$5,100**          | **$61,200**         |

---

## 3. Marketing & Acquisition Costs

### 3.1 Customer Acquisition Cost (CAC) by Channel

**From PRD Section 4.4 (Marketing Channels & Budget Allocation):**

| Channel                        | CAC/FREE User | Conversion Quality       | Scalability              |
| ------------------------------ | ------------- | ------------------------ | ------------------------ |
| **Organic (SEO + Content)**    | $150          | High (40% activate)      | Slow start, compounds    |
| **Paid Ads (Google/LinkedIn)** | $450          | Medium (30% activate)    | Fast, expensive          |
| **Conferences**                | $800          | Very High (60% activate) | Seasonal, limited volume |
| **Referrals**                  | $0            | Very High (70% activate) | Slow, requires base      |
| **Partnerships**               | $0            | High (50% activate)      | Relationship-dependent   |

### 3.2 Marketing Budget Scenarios

#### Lean Scenario (Organic Only)

**Year 1 (100 FREE users):**

- 100% organic (SEO, content marketing, referrals)
- No paid ads
- No conferences (except free/local)
- **Budget:** $1,920/year ($160/month)

**Breakdown:**

- Content creation: $800/year (ghostwriter, 12 blog posts @ $50-100/post)
- SEO tools: $480/year (Ahrefs Lite $40/mo)
- Email marketing: $240/year (ConvertKit free tier + $20/mo upgrades)
- Graphics/design: $400/year (Canva Pro)

**Expected FREE signups:** 100 users (organic only, slow growth)

#### Base Case Scenario (70% Organic, 30% Paid)

**Year 1 (100 FREE users):**

- 70 organic (SEO, content, referrals)
- 30 paid (Google Ads, LinkedIn retargeting)
- **Budget:** $7,720/year ($643/month)

**Breakdown:**

- Content creation: $3,000/year (24 blog posts, 3 case studies)
- SEO tools: $600/year (Ahrefs)
- Email marketing: $480/year (ConvertKit)
- Paid ads: $3,240/year (30 users × $108 avg CAC)
- Graphics/design: $400/year (Canva Pro)

**Expected FREE signups:** 100 users (blended CAC: $77/user)

#### Growth Scenario (50% Organic, 50% Paid + Conferences)

**Year 1 (100 FREE users):**

- 40 organic
- 40 paid ads
- 20 conference leads
- **Budget:** $25,720/year ($2,143/month)

**Breakdown:**

- Content creation: $5,000/year (agency-quality content)
- SEO tools: $1,200/year (Ahrefs + SEMrush)
- Email marketing: $720/year (ConvertKit Pro)
- Paid ads: $18,000/year (40 users × $450 CAC)
- Conference (1 major): $8,000/year (booth + travel for AASA)
- Graphics/design: $800/year (Canva Pro + stock photos)

**Expected FREE signups:** 100 users (blended CAC: $257/user)

### 3.3 Marketing Cost by Growth Year

| Scenario      | Year 1 (100 users) | Year 2 (350 total, +250 new) | Year 3 (500 total, +150 new) |
| ------------- | ------------------ | ---------------------------- | ---------------------------- |
| **Lean**      | $1,920             | $4,560                       | $5,760                       |
| **Base Case** | $7,720             | $17,060                      | $21,860                      |
| **Growth**    | $25,720            | $67,060                      | $91,860                      |

**Year 2 Scaling Assumptions:**

- Organic CAC decreases (SEO compounds, referrals kick in)
- Paid ads CAC decreases (better targeting, brand recognition)
- Conference attendance increases (2-3 conferences in Year 2)

**Year 3 Scaling Assumptions:**

- Organic accounts for 60-70% of FREE signups (vs. 40-50% in Year 1)
- Referral program generates 20-30 FREE signups (cost: $100 credit/referral)
- Paid ads optimized (CAC down to $320 from $450)

---

## 4. Marginal Cost Analysis

### 4.1 Cost Per FREE User (All-In)

| Cost Component        | Lean              | Base Case         | Growth             |
| --------------------- | ----------------- | ----------------- | ------------------ |
| Infrastructure        | $0.00/user/mo     | $0.00/user/mo     | $0.00/user/mo      |
| Support               | $0.00/user/mo     | $1.10/user/mo     | $10.20/user/mo     |
| Marketing (amortized) | $1.60/user/mo     | $6.43/user/mo     | $21.43/user/mo     |
| **TOTAL**             | **$1.60/user/mo** | **$7.53/user/mo** | **$31.63/user/mo** |

**Calculation Notes:**

- Support cost: Annual support / (12 months × avg FREE users)
- Marketing cost: Annual marketing budget / (12 months × avg FREE users)
- Avg FREE users: Year 1 = 50 avg, Year 2 = 225 avg, Year 3 = 425 avg

### 4.2 Break-Even Analysis

**Question:** How many FREE → STARTER conversions needed to cover FREE tier costs?

**STARTER Tier Unit Economics (from PRD):**

- Price: $99/month
- Gross margin: 90%
- Contribution margin: $89.10/month

**Break-Even Calculations:**

#### Lean Scenario (Year 1)

- Total FREE tier cost: $1,920/year
- Break-even conversions: $1,920 / ($89.10 × 12 months) = **1.8 conversions**
- **Conclusion:** Need 2 FREE → STARTER conversions to cover costs

#### Base Case Scenario (Year 1)

- Total FREE tier cost: $7,720/year (infrastructure + support + marketing)
- Break-even conversions: $7,720 / ($89.10 × 12) = **7.2 conversions**
- **Conclusion:** Need 8 FREE → STARTER conversions to cover costs

#### Growth Scenario (Year 1)

- Total FREE tier cost: $25,720/year
- Break-even conversions: $25,720 / ($89.10 × 12) = **24.0 conversions**
- **Conclusion:** Need 24 FREE → STARTER conversions to cover costs

**PRD Projection: 25 FREE → STARTER conversions in Year 1 (25% conversion rate)**

**Key Insight:** Base Case scenario breaks even at 8 conversions (vs. 25 projected). Growth scenario requires 24 conversions (nearly all projected conversions just to cover FREE tier costs, not total business costs).

---

## 5. Scenario Comparison Table

### 5.1 Year 1 Investment Summary (100 FREE Users)

| Item                        | Lean         | Base Case          | Growth              |
| --------------------------- | ------------ | ------------------ | ------------------- |
| **Infrastructure**          |              |                    |                     |
| Supabase                    | $0           | $0                 | $0                  |
| Vercel                      | $0           | $0                 | $0                  |
| Auth                        | $0           | $0                 | $0                  |
| **Support**                 |              |                    |                     |
| Platform                    | $0 (Discord) | $1,188 (Circle)    | $1,200 (Discourse)  |
| Labor                       | $0 (founder) | $5,400 (part-time) | $60,000 (full-time) |
| **Marketing**               |              |                    |                     |
| Content                     | $800         | $3,000             | $5,000              |
| SEO tools                   | $480         | $600               | $1,200              |
| Email marketing             | $240         | $480               | $720                |
| Paid ads                    | $0           | $3,240             | $18,000             |
| Conferences                 | $0           | $0                 | $8,000              |
| Graphics/design             | $400         | $400               | $800                |
| **TOTAL YEAR 1**            | **$1,920**   | **$14,308**        | **$94,920**         |
| **Excluding Support Labor** | **$1,920**   | **$8,908**         | **$34,920**         |

**Why Two Totals?**

- **Including support labor:** Full cost if hiring part-time/full-time help
- **Excluding support labor:** Cash outlay only (founder handles support)

**Realistic Base Case for Year 1:** $8,908 (founder handles support, outsource content/ads)

### 5.2 Year 2 Investment Summary (350 Total FREE Users)

| Item                        | Lean       | Base Case   | Growth       |
| --------------------------- | ---------- | ----------- | ------------ |
| Infrastructure              | $0         | $0          | $0           |
| Support (platform + labor)  | $0         | $6,588      | $61,200      |
| Marketing                   | $4,560     | $17,060     | $67,060      |
| **TOTAL YEAR 2**            | **$4,560** | **$23,648** | **$128,260** |
| **Excluding Support Labor** | **$4,560** | **$18,248** | **$68,260**  |

### 5.3 Year 3 Investment Summary (500 Total FREE Users)

| Item                        | Lean       | Base Case   | Growth       |
| --------------------------- | ---------- | ----------- | ------------ |
| Infrastructure              | $0         | $0          | $0           |
| Support (platform + labor)  | $0         | $6,588      | $61,200      |
| Marketing                   | $5,760     | $21,860     | $91,860      |
| **TOTAL YEAR 3**            | **$5,760** | **$28,448** | **$153,060** |
| **Excluding Support Labor** | **$5,760** | $23,048\*\* | **$93,060**  |

---

## 6. Cash Flow Model (First 12 Months)

### 6.1 Base Case Scenario (Recommended)

**Assumptions:**

- Start with Lean approach (Months 1-3)
- Scale to Base Case (Months 4-12)
- Founder handles support in Months 1-6 (no labor cost)
- Part-time community manager starts Month 7

| Month     | FREE Signups | Cumulative FREE | Infrastructure | Support    | Marketing  | Monthly Total | Cumulative Investment |
| --------- | ------------ | --------------- | -------------- | ---------- | ---------- | ------------- | --------------------- |
| **Jan**   | 5            | 5               | $0             | $0         | $160       | $160          | $160                  |
| **Feb**   | 5            | 10              | $0             | $0         | $160       | $160          | $320                  |
| **Mar**   | 8            | 18              | $0             | $0         | $160       | $160          | $480                  |
| **Apr**   | 10           | 28              | $0             | $99        | $643       | $742          | $1,222                |
| **May**   | 10           | 38              | $0             | $99        | $643       | $742          | $1,964                |
| **Jun**   | 12           | 50              | $0             | $99        | $643       | $742          | $2,706                |
| **Jul**   | 10           | 60              | $0             | $549       | $643       | $1,192        | $3,898                |
| **Aug**   | 12           | 72              | $0             | $549       | $643       | $1,192        | $5,090                |
| **Sep**   | 15           | 87              | $0             | $549       | $643       | $1,192        | $6,282                |
| **Oct**   | 8            | 95              | $0             | $549       | $643       | $1,192        | $7,474                |
| **Nov**   | 10           | 105             | $0             | $549       | $643       | $1,192        | $8,666                |
| **Dec**   | 10           | 115             | $0             | $549       | $643       | $1,192        | $9,858                |
| **TOTAL** | **115**      | -               | **$0**         | **$3,591** | **$6,267** | **$9,858**    | -                     |

**Key Insights:**

- **Cumulative investment by Month 6:** $2,706 (Lean approach)
- **Monthly burn stabilizes:** $1,192/month (Months 7-12)
- **Total Year 1 investment:** $9,858 (close to $8,908 excluding founder labor)

### 6.2 Conversion Revenue (Offsetting Costs)

**Assumed Conversions (Year 1):**

- 25 FREE → STARTER conversions
- Conversion timeline: 45 days median (PRD assumption)
- First conversions start Month 3

| Month     | New STARTER Conversions | Cumulative STARTER | Monthly MRR | Cumulative Revenue (12mo) |
| --------- | ----------------------- | ------------------ | ----------- | ------------------------- |
| Jan       | 0                       | 0                  | $0          | $0                        |
| Feb       | 0                       | 0                  | $0          | $0                        |
| Mar       | 2                       | 2                  | $198        | $198                      |
| Apr       | 3                       | 5                  | $495        | $693                      |
| May       | 4                       | 9                  | $891        | $1,584                    |
| Jun       | 5                       | 14                 | $1,386      | $2,970                    |
| Jul       | 3                       | 17                 | $1,683      | $4,653                    |
| Aug       | 2                       | 19                 | $1,881      | $6,534                    |
| Sep       | 3                       | 22                 | $2,178      | $8,712                    |
| Oct       | 1                       | 23                 | $2,277      | $10,989                   |
| Nov       | 1                       | 24                 | $2,376      | $13,365                   |
| Dec       | 1                       | 25                 | $2,475      | $15,840                   |
| **TOTAL** | **25**                  | **25**             | **$2,475**  | **$15,840**               |

**Break-Even Analysis:**

- Total FREE tier investment (Year 1 Base Case): $9,858
- Total STARTER revenue (Year 1): $15,840
- **Net contribution:** +$5,982 (FREE tier MORE than pays for itself!)

**Key Insight:** Base Case scenario is PROFITABLE in Year 1 if 25% conversion rate holds. FREE tier is a customer acquisition channel, not a cost center.

---

## 7. Recommendations

### 7.1 Recommended Path: Lean → Base Case Transition

**Months 1-6 (Lean Approach):**

- Use Discord for community support (free)
- Founder handles support (2-5 hours/month)
- Organic-only marketing ($160/month)
- **Investment:** $960 first 6 months
- **Goal:** 50 FREE signups, 10 STARTER conversions

**Months 7-12 (Base Case Transition):**

- Upgrade to Circle community platform ($99/month)
- Hire part-time community manager ($450/month)
- Add paid ads ($270/month, 3-5 users)
- **Investment:** $6,900 next 6 months
- **Goal:** 65 additional FREE signups, 15 additional STARTER conversions

**Year 1 Total Investment:** $7,860 (vs. $9,858 Base Case model)

**Rationale:**

- Conserves cash in early months (pre-product-market fit)
- Scales investment as conversions validate model
- Avoids premature hiring (founder learns support pain points first)
- Still achieves 100 FREE / 25 STARTER target

### 7.2 When to Scale from Lean to Base Case

**Trigger Metrics (Green Light to Scale):**

- ✅ 10+ FREE → STARTER conversions (validates 10%+ conversion rate)
- ✅ Activation rate >65% (onboarding working)
- ✅ Support volume >10 questions/week (founder can't keep up)
- ✅ MRR >$1,500 (enough revenue to cover Base Case costs)

**Red Flags (Stay Lean):**

- 🚩 Conversion rate <5% (product-market fit not proven)
- 🚩 High churn in first 3 months (retention problem)
- 🚩 Low activation rate <50% (onboarding broken)

### 7.3 When NOT to Pursue Growth Scenario

**Growth scenario ($94K Year 1) only makes sense if:**

- VC funding secured ($500K+ seed round)
- Aggressive land-grab strategy (beat competitors to market)
- Enterprise pipeline requires brand credibility (conferences, PR)

**For bootstrapped founder:**

- Growth scenario burns 12 months of runway to acquire 100 FREE users
- Return on investment takes 18-24 months (via STARTER conversions)
- Risk: High spend before product-market fit validation

**Recommendation:** Avoid Growth scenario until Year 2, after achieving:

- $50K+ ARR (product-market fit proven)
- 100+ FREE users (Lean/Base Case sufficient)
- 15%+ conversion rate (justifies higher CAC)

### 7.4 Key Decisions for Founder

#### Decision 1: Community Platform (Month 1)

- **Option A:** Discord (free, start today)
- **Option B:** Circle ($99/mo, more professional)
- **Recommendation:** Start with Discord, evaluate Circle at Month 6

#### Decision 2: Support Labor (Month 6)

- **Option A:** Founder continues handling support (10 hours/month)
- **Option B:** Hire part-time community manager ($450/month)
- **Recommendation:** Hire if support >10 hours/week OR if needed for core product work

#### Decision 3: Paid Marketing (Month 4)

- **Option A:** Organic only (0 paid spend)
- **Option B:** Small paid test ($270/month, 3-5 users)
- **Recommendation:** Run 3-month paid test (Months 4-6), pause if CAC >$500

#### Decision 4: Conferences (Year 1 vs. Year 2)

- **Option A:** Skip Year 1 (save $8K)
- **Option B:** Attend 1 state conference (lower cost, $2K)
- **Recommendation:** Skip national conferences in Year 1, try 1 local/state conference in Q3-Q4

---

## 8. Risk Factors & Mitigation

### 8.1 Risk: Infrastructure Costs Spike

**Scenario:** FREE users exceed 500 (Supabase Free tier limit)

**Likelihood:** Low (Year 3 target is 500 users)

**Impact:** $25/month (Supabase Pro tier)

**Mitigation:**

1. Monitor Supabase usage dashboard monthly
2. Optimize database queries (reduce reads/writes)
3. Implement client-side caching (reduce egress)
4. If needed, upgrade to Pro tier ($25/mo is negligible cost)

### 8.2 Risk: Support Volume Overwhelms Founder

**Scenario:** 100 FREE users generate 30+ support questions/week

**Likelihood:** Medium (depends on product quality, documentation)

**Impact:** 15-20 hours/week founder time (unsustainable)

**Mitigation:**

1. Build comprehensive knowledge base (self-serve FAQs)
2. Implement in-app tooltips (reduce "how do I..." questions)
3. Hire part-time community manager earlier (Month 4 vs. Month 7)
4. Set support SLA: "48-72 hour response for FREE tier" (manage expectations)

### 8.3 Risk: Conversion Rate Below 10%

**Scenario:** FREE → STARTER conversion rate is 5% (vs. 25% projected)

**Likelihood:** Medium (25% is aggressive for FREE tier PLG)

**Impact:** Only 5 conversions in Year 1 (vs. 25 projected)

**Mitigation:**

1. **Product changes:**
   - Reduce FREE tier limits (3 objectives → 2, 10 goals → 5)
   - Add "upgrade to unlock" prompts earlier in user journey
   - Show STARTER feature previews (success stories module)
2. **Pricing changes:**
   - Offer annual discount (2 months free, $990 → $792/year)
   - First-month free trial for STARTER (reduce risk)
3. **Messaging changes:**
   - Emphasize ROI (save 10 hours/month)
   - Add customer testimonials/case studies

### 8.4 Risk: CAC Higher Than Expected

**Scenario:** Blended CAC is $200/FREE user (vs. $77 Base Case)

**Likelihood:** Medium (depends on market competition, ad performance)

**Impact:** Year 1 marketing budget $20K (vs. $7.7K projected)

**Mitigation:**

1. **Pause paid ads** if CAC >$500 (focus on organic)
2. **Double down on SEO** (compounds over time, lower CAC)
3. **Launch referral program** earlier (Month 6 vs. Month 12)
4. **Partner with state associations** (co-marketing, lower CAC)

---

## 9. Conclusion & Next Steps

### 9.1 Investment Required (Base Case Recommendation)

| Timeframe        | Investment | Expected FREE Users | Expected STARTER Conversions | Net Position              |
| ---------------- | ---------- | ------------------- | ---------------------------- | ------------------------- |
| **Months 1-6**   | $2,706     | 50                  | 10                           | +$3,234 revenue           |
| **Months 7-12**  | $7,152     | 65 additional       | 15 additional                | +$12,606 revenue          |
| **Year 1 Total** | **$9,858** | **115**             | **25**                       | **+$5,982** (profitable!) |
| **Year 2 Total** | $23,648    | 350 total           | 125 total                    | +$725K ARR                |
| **Year 3 Total** | $28,448    | 500 total           | 290 total                    | +$2.26M ARR               |

### 9.2 Key Takeaways

1. **Infrastructure is NOT a constraint:** Supabase Free + Vercel Hobby cover 500 FREE users ($0 cost)
2. **Support is manageable:** Founder can handle 50-100 users solo (10 hours/month)
3. **Marketing is the variable:** Lean ($1,920/year) vs. Growth ($94,920/year) is 49X difference
4. **FREE tier pays for itself:** At 10%+ conversion rate, STARTER revenue exceeds FREE tier costs
5. **Start Lean, scale smart:** Validate conversions before increasing spend

### 9.3 Go/No-Go Decision Framework

**GREEN LIGHT to invest in FREE tier if:**

- ✅ Product-market fit validated (10+ design partners enthusiastic)
- ✅ Founder can commit 10-20 hours/month to support (Months 1-6)
- ✅ $10K available for Year 1 investment (Base Case)
- ✅ Comfortable with 6-9 month payback period

**RED LIGHT / delay FREE tier if:**

- 🚩 Product not ready (MVP incomplete, bugs, poor UX)
- 🚩 No capacity for support (founder 100% on product development)
- 🚩 <$5K available (insufficient runway for Base Case)
- 🚩 No STARTER tier built (can't monetize conversions)

### 9.4 Immediate Next Steps (Weeks 1-4)

**Week 1: Infrastructure Setup**

- [ ] Confirm Supabase Free tier sufficient (audit current usage)
- [ ] Confirm Vercel Hobby plan sufficient (audit bandwidth)
- [ ] Set up usage monitoring (Supabase dashboard alerts)

**Week 2: Support Setup**

- [ ] Create Discord server for community support
- [ ] Write 10-15 FAQ articles (knowledge base)
- [ ] Set up email notifications for support questions

**Week 3: Marketing Prep**

- [ ] Identify 3-5 SEO keywords ("strategic planning software schools")
- [ ] Outline first 6 blog posts (content calendar)
- [ ] Set up ConvertKit for email nurture sequence

**Week 4: Conversion Optimization**

- [ ] Add "upgrade" prompts to FREE tier (when hitting limits)
- [ ] Create STARTER tier comparison page (pricing page)
- [ ] Write 7-email onboarding sequence for FREE users

### 9.5 Success Metrics (Track Weekly)

**Acquisition:**

- FREE signups/week (target: 8-10/month in Year 1)
- Signup source (organic vs. referral vs. paid)

**Activation:**

- % users who create first goal in 7 days (target: 70%)
- Time to first goal (target: <3 days)

**Conversion:**

- FREE → STARTER conversion rate (target: 10-25%)
- Time to conversion (target: <60 days)

**Support:**

- Support questions/week (founder time commitment)
- % questions answered in <48 hours (target: 80%)

---

## Appendix A: Detailed Cost Assumptions

### A.1 Supabase Usage per FREE User (Detailed)

**Database Schema (per FREE user):**

```
spb_districts: 1 row × 5 KB = 5 KB
spb_goals: 13 rows (3 objectives + 10 goals) × 1.5 KB = 19.5 KB
spb_metrics: 20 rows × 1.5 KB = 30 KB
spb_district_admins: 1 row × 0.5 KB = 0.5 KB
spb_goal_updates (historical): 10 updates/year × 1 KB = 10 KB/year
spb_metric_values (historical): 20 metrics × 4 updates/year × 0.5 KB = 40 KB/year
```

**Total Year 1 storage growth:** 5 + 19.5 + 30 + 0.5 + 10 + 40 = **105 KB** (0.1 MB)

**Database Operations (per month):**

- Public dashboard views: 15 views × 5 reads (goals + metrics) = 75 reads
- Admin edits: 10 sessions × 20 reads = 200 reads
- Admin writes: 10 goal updates + 15 metric updates = 25 writes
- **Total:** ~300 reads, 25 writes per user per month

**Egress Calculation:**

- Dashboard page load: 50 KB (JSON payload)
- 20 views/month × 50 KB = 1,000 KB (1 MB/month)
- **Supabase Free tier:** 2 GB egress/month = 2,048 MB / 1 MB/user = **2,048 users** before hitting limit

### A.2 Vercel Bandwidth Calculation

**Page Load Breakdown:**

- Initial HTML: 5 KB
- JS bundle (Vite): 480 KB (gzipped, from STATUS.md)
- CSS: 15 KB
- Fonts: 20 KB (if not cached)
- **First visit:** ~520 KB

**Repeat Visits (cached):**

- HTML: 5 KB
- JS bundle (if cache-busted): 0 KB (304 Not Modified)
- **Repeat visit:** ~5-50 KB (depending on cache hit rate)

**Monthly Bandwidth (per FREE user):**

- First visit: 520 KB
- Repeat visits: 19 visits × 50 KB = 950 KB
- **Total:** ~1.5 MB/month per user

**Vercel Hobby Plan:** 100 GB / 1.5 MB/user = **66,666 users** before hitting limit

### A.3 Community Platform Comparison

| Platform      | Free Tier    | Paid Tier       | Pros                                | Cons                      | Recommendation   |
| ------------- | ------------ | --------------- | ----------------------------------- | ------------------------- | ---------------- |
| **Discord**   | Unlimited    | $0              | Free, familiar, easy                | Not searchable, ephemeral | **Lean**         |
| **Circle**    | None         | $39-99/mo       | Searchable, knowledge base, courses | Monthly cost              | **Base Case**    |
| **Discourse** | Free (OSS)   | $100/mo hosting | SEO-friendly, full control          | Requires DevOps           | Growth           |
| **Slack**     | 10K messages | $8/user/mo      | Familiar, integrations              | Expensive at scale        | ❌ Too expensive |
| **Reddit**    | Free         | $0              | Free, SEO-friendly                  | Less control              | ❌ Brand risk    |

---

## Appendix B: Conversion Revenue Model (Detailed)

### B.1 STARTER Tier Unit Economics

**Pricing:**

- Monthly: $99/month
- Annual: $990/year (2 months free = 17% discount)

**Gross Margin Breakdown:**

- Payment processing (Stripe): 2.9% + $0.30 = ~$3.17/month
- Infrastructure (Supabase Pro share): ~$0.50/month (amortized)
- **Gross margin:** $99 - $3.17 - $0.50 = **$95.33/month (96.3%)**

**Contribution Margin (excluding support):**

- Gross margin: $95.33/month
- Support cost (allocated): ~$5/month per STARTER user (email support 48hr SLA)
- **Contribution margin:** $95.33 - $5 = **$90.33/month**

### B.2 Conversion Payback Analysis

**Question:** How long to recover FREE tier investment per user?

**Lean Scenario:**

- Cost per FREE user: $1,920/100 = $19.20
- STARTER contribution margin: $90.33/month
- **Payback:** $19.20 / $90.33 = **0.2 months** (~6 days)

**Base Case Scenario:**

- Cost per FREE user: $9,858/115 = $85.72
- STARTER contribution margin: $90.33/month
- **Payback:** $85.72 / $90.33 = **0.95 months** (~29 days)

**Growth Scenario:**

- Cost per FREE user: $94,920/100 = $949.20
- STARTER contribution margin: $90.33/month
- **Payback:** $949.20 / $90.33 = **10.5 months**

**Key Insight:** Base Case scenario has <1 month payback per conversion. Growth scenario has 10+ month payback (requires very high confidence in conversion rate).

---

## Appendix C: Benchmarking Data

### C.1 SaaS PLG Conversion Benchmarks

| Metric                 | Industry Low | Industry Median | Industry High | Our Target |
| ---------------------- | ------------ | --------------- | ------------- | ---------- |
| FREE → Paid conversion | 2%           | 5%              | 15%           | 10-25%     |
| Activation rate        | 30%          | 50%             | 80%           | 70%        |
| Time to activation     | 7 days       | 3 days          | 1 day         | 3 days     |
| Time to conversion     | 90 days      | 45 days         | 14 days       | 45 days    |

**Sources:**

- OpenView Partners PLG Benchmarks (2024)
- ProductLed.com State of PLG Report (2024)

### C.2 Education SaaS Comparables

| Company      | Tier Structure             | FREE Tier Limits                     | Conversion Rate | Notes              |
| ------------ | -------------------------- | ------------------------------------ | --------------- | ------------------ |
| **Canva**    | FREE, Pro, Teams           | Unlimited designs, limited templates | 3-5%            | Freemium, consumer |
| **Loom**     | FREE, Business, Enterprise | 25 videos, 5 min limit               | 8-12%           | Freemium, SMB      |
| **Notion**   | FREE, Plus, Business       | Unlimited pages, limited blocks      | 4-7%            | Freemium, prosumer |
| **Airtable** | FREE, Plus, Pro            | 1,200 records/base                   | 6-10%           | Freemium, SMB      |

**Key Insight:** Our 10-25% conversion target is aggressive but achievable if:

1. Hard limits create urgency (10 goals, 20 metrics)
2. Clear value prop (save 10 hours/month)
3. Low price point ($99/mo vs. $200-300 competitors)

---

**End of Report**

**Last Updated:** November 5, 2025
**Next Review:** January 1, 2026 (after first 50 FREE users acquired)
