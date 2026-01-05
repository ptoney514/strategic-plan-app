# Onboarding Guide - StrataDash

This guide covers onboarding procedures for new districts (customers), district admins, and system admins.

## Table of Contents

1. [New District Onboarding](#new-district-onboarding)
2. [District Admin Onboarding](#district-admin-onboarding)
3. [System Admin Onboarding](#system-admin-onboarding)
4. [Quick Reference Checklists](#quick-reference-checklists)

---

## New District Onboarding

When a new school district signs up as a paying customer, follow this checklist to fully provision their account.

### Prerequisites

- District name and preferred URL slug (e.g., "westside" for westside.stratadash.org)
- Primary contact email
- Logo file (optional, can be added later)
- Brand colors (optional, can be added later)
- List of initial admin users (emails)

### Step 1: DNS Configuration (Cloudflare)

Since we use Cloudflare for DNS, each district subdomain must be added manually.

> **Important**: We use Cloudflare's proxy (orange cloud) because Vercel cannot issue wildcard SSL certificates with external DNS. Cloudflare handles SSL termination for us.

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **stratadash.org** domain
3. Go to **DNS** → **Records**
4. Click **Add record**:
   - **Type**: `CNAME`
   - **Name**: `{district-slug}` (e.g., `westside`)
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: **Proxied** (orange cloud) - **REQUIRED**
   - **TTL**: Auto
5. Click **Save**

The subdomain should work within seconds since Cloudflare handles SSL.

### Step 2: Vercel Domain Configuration (Optional but Recommended)

With Cloudflare Proxied mode, Vercel's SSL isn't strictly required (Cloudflare handles it). However, adding the domain to Vercel ensures proper routing and is good practice.

```bash
# From the project directory
vercel domains add {slug}.stratadash.org

# Example:
vercel domains add westside.stratadash.org
```

Note: If the domain is already covered by a wildcard (`*.stratadash.org`), you may see an "already assigned" message - that's fine, the wildcard covers it.

### Step 3: Create District in Database

**Option A: Via System Admin UI (Recommended)**

1. Go to [admin.stratadash.org](https://admin.stratadash.org)
2. Log in with system admin credentials
3. Click **+ New District**
4. Fill in:
   - **Name**: Full district name (e.g., "Westside Community Schools")
   - **Slug**: URL-safe identifier (e.g., "westside") - must match DNS!
   - **Admin Email**: Primary contact email
   - **Logo URL**: (optional) Upload to storage first, then paste URL
   - **Primary Color**: Brand color hex code (e.g., "#1e40af")
   - **Is Public**: Check if district dashboard should be publicly viewable
5. Click **Create District**

**Option B: Via Supabase Dashboard (Direct)**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Project → Table Editor
2. Select `spb_districts` table
3. Click **Insert row**
4. Fill in fields (id will auto-generate)

### Step 4: Create Admin User Accounts

For each district admin user:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Users
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: Admin's email address
   - **Password**: Temporary password (they should reset)
   - **Auto Confirm User**: Check this box
4. Click **Create user**
5. Copy the **User UID** for the next step

### Step 5: Assign District Admin Permissions

**Option A: Via System Admin UI**

1. Go to [admin.stratadash.org/users](https://admin.stratadash.org/users)
2. Click **Add Admin**
3. Enter the User UUID from Step 4
4. Select the district from dropdown
5. Click **Assign**

**Option B: Via Supabase Dashboard**

1. Go to Table Editor → `spb_district_admins`
2. Insert row:
   - **user_id**: UUID from Step 4
   - **district_id**: UUID of the district
   - **district_slug**: The slug (e.g., "westside")
   - **created_by**: Your user UUID (optional)

### Step 6: Verify Setup

1. **Test public access**: Visit `https://{slug}.stratadash.org`
   - Should show the district's public dashboard (empty initially)

2. **Test admin access**:
   - Go to `https://{slug}.stratadash.org/admin`
   - Or go to login and sign in as the new admin
   - Should redirect to district admin dashboard

3. **Verify SSL**: Check for padlock icon in browser

### Step 7: Welcome Communication

Send welcome email to district admins with:
- Login URL: `https://{slug}.stratadash.org/admin`
- Temporary credentials
- Link to user guide (if available)
- Support contact information

---

## District Admin Onboarding

Adding a new admin user to an existing district.

### Prerequisites

- Admin's email address
- District they should have access to
- Admin's full name (for records)

### Checklist

- [ ] **Create Supabase Auth user** (if new user)
  1. Supabase Dashboard → Authentication → Users → Add user
  2. Enter email and temporary password
  3. Check "Auto Confirm User"
  4. Copy the User UID

- [ ] **Assign to district**
  1. admin.stratadash.org/users → Add Admin
  2. Enter User UUID
  3. Select district
  4. Click Assign

- [ ] **Send credentials**
  - Login URL
  - Temporary password
  - Password reset instructions

- [ ] **Verify access**
  - Have them log in and confirm they can see their district

### Multi-District Admins

A single user can admin multiple districts. Simply repeat the "Assign to district" step for each district they need access to.

---

## System Admin Onboarding

System admins have full access to all districts and system-wide settings. This should be limited to internal staff only.

### Prerequisites

- Staff member's email
- Confirmation from management (system admin is a privileged role)

### Checklist

- [ ] **Create Supabase Auth user** (if new)
  1. Supabase Dashboard → Authentication → Users → Add user
  2. Enter email and password
  3. Check "Auto Confirm User"

- [ ] **Set system_admin role**
  1. In Supabase Dashboard → Authentication → Users
  2. Find the user and click to edit
  3. Under **User Metadata**, add:
     ```json
     {
       "role": "system_admin"
     }
     ```
  4. Save changes

- [ ] **Verify access**
  1. Go to admin.stratadash.org
  2. Log in with the new credentials
  3. Should see System Administration dashboard

### Revoking System Admin Access

1. Supabase Dashboard → Authentication → Users
2. Find the user
3. Remove `"role": "system_admin"` from User Metadata
4. Save

---

## Quick Reference Checklists

### New District - Quick Checklist

```
□ Cloudflare: Add CNAME record ({slug} → cname.vercel-dns.com, PROXIED orange cloud)
□ Vercel: vercel domains add {slug}.stratadash.org (optional, wildcard covers it)
□ Test: Visit https://{slug}.stratadash.org (should work immediately)
□ Create: District in admin.stratadash.org (slug must match DNS!)
□ Create: Admin user(s) in Supabase Auth
□ Assign: Admin permissions in admin.stratadash.org/users
□ Test: Admin login works at https://{slug}.stratadash.org/admin
□ Send: Welcome email with credentials
```

### New District Admin - Quick Checklist

```
□ Create user in Supabase Auth (if new)
□ Copy User UUID
□ Assign to district at admin.stratadash.org/users
□ Send login credentials
□ Verify they can access their district
```

### New System Admin - Quick Checklist

```
□ Create user in Supabase Auth
□ Add {"role": "system_admin"} to User Metadata
□ Verify access at admin.stratadash.org
```

---

## Troubleshooting

### "Site can't be reached" for new subdomain

1. Check Cloudflare DNS record exists for this specific subdomain
2. **Verify Proxy status is Proxied (orange cloud)** - This is the most common issue!
   - "DNS only" (gray cloud) will NOT work because Vercel can't issue wildcard SSL with external DNS
   - Cloudflare's proxy handles SSL termination for us
3. If using wildcard (*) record, it must also be Proxied (requires Cloudflare paid plan)
   - Better approach: Add explicit CNAME for each district with Proxied status
4. Clear browser cache and try again (old DNS may be cached)

### Admin can't log in

1. Verify user exists in Supabase Auth
2. Check `spb_district_admins` table has entry for user_id + district_id
3. Verify district_slug matches the actual district slug exactly
4. Have user clear browser cache and try again

### Admin sees wrong district / no access

1. Check `spb_district_admins` entries for that user_id
2. Verify district_slug is correct (case-sensitive)
3. Check RLS policies are enabled on the table

### System admin can't access admin subdomain

1. Verify user_metadata contains `{"role": "system_admin"}`
2. Check both `user_metadata` AND `app_metadata` in Supabase
3. Have user log out completely and log back in

---

## Access Levels Reference

| Role | Access Scope | Set Via |
|------|--------------|---------|
| **System Admin** | All districts, all settings | `user_metadata.role = "system_admin"` |
| **District Admin** | Assigned district(s) only | `spb_district_admins` table |
| **School Admin** | Assigned school(s) only | `spb_school_admins` table |
| **Public User** | View public districts only | No setup needed |

---

## Contact

For technical issues during onboarding, contact: [your support email]
