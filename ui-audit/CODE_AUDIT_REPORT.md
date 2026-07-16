# MOK Car Rental — Full System Code Audit Report

> Generated: 2026-07-16
> Scope: Complete source code review (111 source files, 32 API routes, 21 pages, 15 DB migrations)
> Tech Stack: Next.js 14.2 · React 18 · TypeScript · TailwindCSS · Supabase · Resend · Sharp

---

## 1. Architecture Overview

| Layer | Technology | Status |
|-------|-----------|--------|
| Framework | Next.js 14.2 (App Router) | ✅ Stable |
| Language | TypeScript (strict mode) | ✅ Enforced |
| Styling | TailwindCSS v3 + custom gold theme | ✅ Well-structured |
| Database | Supabase (PostgreSQL) | ✅ 15 migrations |
| Auth | Cookie + HMAC-signed session tokens | ✅ Implemented |
| Storage | Supabase Storage (car-images bucket) | ✅ Multi-variant processing |
| Email | Resend API | ✅ Integrated |
| Image Processing | Sharp (resize → WebP) | ✅ Efficient |
| Realtime | Supabase Postgres Changes | ✅ Basic |
| Monitoring | Client Error Monitor + Audit Logs | ✅ Partial |
| Deployment | Vercel + custom deploy scripts | ✅ Configured |

### Page Structure (21 pages)
- **Public**: Home, Cars, Car Detail, Booking, About, FAQ, Contact, Terms, Privacy, Start Business, Fleet (redirect)
- **Admin**: Login, Dashboard, Cars, Car Photos, Inquiries, Business Applications, Content, Branding, Settings
- **API Routes**: 32 routes covering admin CRUD, content CMS, execution engine, health checks, and monitoring

---

## 2. Security Audit

### 🔴 CRITICAL ISSUES

#### 2.1 Hardcoded Development Password
**File:** src/lib/adminAuth.ts
`	ypescript
export const ADMIN_PASSWORD = process.env.NODE_ENV !== 'production' ? 'admin123' : '';
`
- **Risk:** Plain-text fallback password in source code
- **Impact:** Anyone with repo access can log in during development
- **Recommendation:** Remove entirely; enforce PBKDF2 hash-only auth everywhere

#### 2.2 Admin Password Stored in localStorage
**File:** src/app/admin/login/page.tsx
`	ypescript
localStorage.setItem('adminUser', JSON.stringify(data?.data?.user || { email, name: 'Admin' }));
`
- **Risk:** Admin session data persisted in browser storage
- **Impact:** XSS could steal admin identity; survives tab closure
- **Recommendation:** Remove localStorage admin storage; rely solely on HTTP-only cookie

#### 2.3 Service Role Key Exposed in Client API Calls
**File:** src/app/api/inquiries/route.ts
`	ypescript
function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
`
- **Risk:** Server-side route uses service role key (acceptable for RSC/API routes)
- **Assessment:** ⚠️ Acceptable since this is a Route Handler (runs on server), NOT a client component
- **Note:** The supabase.ts client correctly uses anon key for client-side queries

#### 2.4 Missing CSRF Protection on Admin Endpoints
**Files:** All admin API routes (/api/admin/*)
- **Risk:** Cookie-based auth without CSRF tokens vulnerable to cross-site request forgery
- **Impact:** Malicious sites could trigger admin actions via browser cookies
- **Recommendation:** Add CSRF token validation or use SameSite=strict (already set for login cookie, but PUT/DELETE endpoints lack additional CSRF guards)

#### 2.5 Weak Input Validation on Business Applications
**File:** src/app/api/business-applications/route.ts
- **Risk:** Email field not validated for format; no phone number format check
- **Impact:** Garbage data in business leads
- **Recommendation:** Add email regex validation and phone number sanitization

### 🟡 MEDIUM ISSUES

#### 2.6 No Rate Limiting on Public Inquiry Submission
**File:** src/app/api/inquiries/route.ts
- Rate limiting exists (20/min per IP) but uses in-memory Map
- **Risk:** Memory leak under high traffic; resets on server restart
- **Recommendation:** Use Redis or Supabase-backed rate limiter for production

#### 2.7 Audit Log Endpoint Returns Empty Data
**File:** src/app/api/admin/audit-logs/route.ts
`	ypescript
return NextResponse.json({ ok: true, data: [] });
`
- **Issue:** writeAuditLog() inserts into udit_logs table but the API never reads from it
- **Recommendation:** Implement actual audit log retrieval endpoint

#### 2.8 Analytics Dashboard Uses Fake Revenue Calculation
**File:** src/components/admin/AnalyticsDashboard.tsx
`	ypescript
monthlyRevenue: totalInquiries * 200,
`
- **Issue:** Revenue is estimated (inquiries × RM200), not actual
- **Recommendation:** Add a ookings or evenue table; track actual confirmed bookings

#### 2.9 Client-Side Settings Sync Race Condition
**File:** src/hooks/useSiteSettings.tsx
- **Issue:** Settings loaded from both localStorage AND API; localStorage wins on subsequent renders
- **Risk:** Admin saves settings via API, but client shows stale localStorage data
- **Recommendation:** Always prefer API data; use localStorage only as cache with TTL

### 🟢 LOW ISSUES

#### 2.10 No Content-Security-Policy Headers
- **Risk:** Potential XSS vector if user-generated content is rendered unsanitized
- **Mitigation:** sanitize-html is used in several places (good!), but CSP headers would add defense-in-depth

#### 2.11 WhatsApp Float Button Opens Without Pre-filled Context
- **File:** src/components/WhatsAppFloat.tsx
- **Issue:** Generic message; no page context (which car, which page)
- **Recommendation:** Pass current page/car context to WhatsApp message

#### 2.12 Unused leet Page
- **File:** src/app/fleet/page.tsx
- **Issue:** Simple redirect to /cars; adds unnecessary route
- **Recommendation:** Remove or keep as SEO alias

---

## 3. Database & Migration Audit

### Tables (15 migrations)
| Table | Purpose | RLS Enabled | Notes |
|-------|---------|-------------|-------|
| cars | Vehicle inventory | ✅ | Has vailable boolean + status text |
| car_images | Multi-variant image storage | ✅ | CASCADE delete on car removal |
| inquiries | Customer booking requests | ✅ | Lockdown migration (011) removed public insert policy |
| inquiries_events | Realtime change triggers | ✅ | |
| content_sections | CMS for dynamic content | ✅ | Soft-delete via deleted_at |
| dmin_auth | Admin credentials (PBKDF2) | ✅ | Singleton pattern |
| login_attempts | Brute-force protection | ✅ | 7-day auto-cleanup |
| udit_logs | Admin action tracking | ⚠️ | Not referenced by any API route |
| user_roles | RBAC for execution system | ✅ | |
| usiness_applications | B2B lead submissions | ✅ | |
| usiness_application_images | Lead photo uploads | ✅ | |

### Migration Quality Assessment
- **✅ Good:** Sequential numbering, idempotent (IF NOT EXISTS), proper indexes
- **⚠️ Concern:** Migration 011 drops public inquiry creation policy but inquiries/route.ts uses service role key — should work, but verify RLS policy allows service_role inserts
- **✅ Good:** Migration 015 enforces RLS on ALL tables dynamically
- **⚠️ Concern:** No migration to clean up usiness_applications2 stray table (referenced in 015 but relies on DROP TABLE IF EXISTS)

---

## 4. Component Architecture Review

### Public Components (18 components)
| Component | Purpose | Issues |
|-----------|---------|--------|
| Hero | Landing page hero | Uses hardcoded Unsplash image (not configurable) |
| Navbar | Navigation with dynamic business name | Splits business name by space — fragile if name has >2 words |
| CarCard | Car listing card | No lazy loading for images beyond Next.js default |
| Footer | Site footer | LegalContactInfo component renders address from settings |
| WhatsAppFloat | Floating WhatsApp button | No page context passed |
| WhatsAppInquiryProvider | Inquiry modal + WhatsApp redirect | Saves inquiry to DB AND opens WhatsApp — race condition if WhatsApp blocks popup |
| ErrorBoundary | Client-side error catching | Basic; doesn't report to monitoring service |
| ClientErrorMonitor | Sends errors to /api/monitoring/client-error | Only logs chunk load errors; misses JS runtime errors |
| FeaturedCars | Homepage car showcase | Fetches from Supabase client (anon key) |
| WhyChooseUs | Dynamic CMS content | Reads from content_sections |
| RentalProcess | How-it-works section | Static content |
| CustomerReviews | Testimonials | No source indicated (static?) |
| FAQ | Accordion-style FAQ | Static content |
| CTASection | Call-to-action banner | Links to booking |

### Admin Components (11 components)
| Component | Purpose | Issues |
|-----------|---------|--------|
| AdminLayout | Sidebar + header + theme toggle | Auth check on every navigation — could be optimized |
| AnalyticsDashboard | Stats cards + recent inquiries | Revenue calculation is fake; no chart library |
| CarFleetManager | CRUD for cars | Inline modal form; no form library (React Hook Form) |
| CarImageUploader | Multi-image upload with Sharp processing | Good: validates constraints server-side |
| InquiryManager | View/update inquiry status | Polls every 30s + realtime subscription — redundant |
| SettingsManager | Site settings + password change | Password change works but no confirmation dialog |
| BrandingManager | Logo + colors | **localStorage only** — no API sync, lost on device swap |
| WhyChooseContentManager | Edit "Why Choose Us" CMS content | Good: validates 6 items required |
| PickupLocationsManager | Edit pickup locations | Good: validates uniqueness |
| RichTextEditor | HTML content editor | Uses sanitize-html on server |
| ConfirmDialog | Delete confirmation modal | Basic implementation |

---

## 5. API Route Analysis

### Authentication Flow
1. **Login** (POST /api/admin/login) → PBKDF2 verification → HMAC session cookie
2. **Session Check** (GET /api/admin/session) → Cookie verification
3. **Logout** (POST /api/admin/logout) → Clear cookie
4. **Middleware** → Protects /admin/* routes client-side + server-side

### Rate Limiting
| Endpoint | Limit | Window | Storage |
|----------|-------|--------|---------|
| Admin Login | 10 attempts | 15 min | Supabase login_attempts |
| Inquiry Submit | 20 requests | 60 sec | In-memory Map ⚠️ |
| Execution Engine | 30 requests | 60 sec | In-memory Map ⚠️ |

### Execution Engine (/api/execution)
- **Purpose:** AI/automated system integration (Trae editor control)
- **Operations:** supabase.reload_schema_cache, content.why_choose.update_item
- **Auth:** Supabase JWT + role-based access (dmin, editor, 	rae_executor)
- **Audit:** All operations logged with input redaction
- **Assessment:** Well-designed; good separation of concerns

### Content Management APIs
- **Site Settings** (/api/admin/content/site-settings) — GET/PUT
- **Pickup Locations** (/api/admin/content/pickup-locations) — GET/PUT/DELETE
- **Why Choose Us** (/api/admin/content/why-choose) — GET/PUT/DELETE
- **Public Content** (/api/content/*) — GET only, uses anon key

---

## 6. Data Flow & State Management

### Settings Flow
`
Admin saves → API → Supabase content_sections → 
  ├─ Client hook reads API → localStorage cache
  └─ Subsequent loads: localStorage → API override
`
**Issue:** Bidirectional sync can cause stale data. No optimistic updates or loading states.

### Inquiry Flow
`
User fills form → 
  ├─ POST /api/inquiries → Supabase (service role)
  ├─ POST inquiries_events → Realtime trigger
  ├─ Popup WhatsApp → Opens in new tab
  └─ Resend email notification → Admin
`
**Race Condition:** If popup blocker prevents WhatsApp, inquiry is still saved. No fallback mechanism.

### Car Image Upload Flow
`
User selects files → 
  ├─ Client sends multipart/form-data
  ├─ Server processes with Sharp (thumb + medium + original)
  ├─ Uploads 3 variants to Supabase Storage
  ├─ Inserts car_images row
  └─ Updates cars.image + cars.images array
`
**Assessment:** Well-implemented with proper error handling and cleanup on failure.

---

## 7. Performance & Optimization

### ✅ Strengths
- **Image Processing:** Sharp converts to WebP automatically (30-50% smaller than JPEG)
- **Next.js Image Component:** Lazy loading, responsive sizing, built-in optimization
- **Supabase Client:** Proper server-side vs client-side separation
- **In-memory Rate Limiting:** Fast for low-traffic scenarios

### ⚠️ Opportunities
1. **No ISR/SSR for Car Listings** — All pages are client-side rendered; SEO benefit reduced
2. **No Caching on Admin APIs** — Every dashboard refresh hits Supabase
3. **Inline Styles in Components** — Could use Tailwind classes consistently
4. **No Code Splitting for Admin Routes** — Admin bundle loaded on all pages
5. **Supabase unoptimized: true** — Disables Next.js Image Optimization; images served raw

### 📊 Bundle Size Estimate
Based on dependencies:
- 
ext@14.2.35 + eact@18.2.0 + ramer-motion + sharp + @supabase/supabase-js
- Expected production bundle: **~250-350KB** (reasonable for this feature set)

---

## 8. SEO & Accessibility

### ✅ Good Practices
- Semantic HTML with proper heading hierarchy
- metadataBase, OpenGraph, Twitter cards configured
- obots.txt excludes /admin/
- sitemap.xml lists all public pages
- Alt text on all images
- ARIA labels on interactive elements

### ⚠️ Missing
1. **No JSON-LD Structured Data** — Missing LocalBusiness schema for car rental
2. **No Language Attribute** — <html lang="en"> but site targets Malay/Singapore audience
3. **No Canonical URLs** — Could cause duplicate content issues
4. **Accessibility: Color Contrast** — Gold (#D4AF37) on white has borderline contrast ratio (3.1:1)
5. **No Skip Navigation Link** — Missing for keyboard users

---

## 9. Testing

### Current State
- **Jest configured** (jest.config.js) with jsdom environment
- **No test files found** in __tests__/ directory
- **No E2E tests** (Playwright/Cypress)
- **No unit tests** for API routes, validation, or auth logic

### Recommendation Priority
1. **HIGH:** Auth flow tests (login, session, password change)
2. **HIGH:** Inquiry validation tests
3. **MEDIUM:** Image processing tests (Sharp pipeline)
4. **LOW:** UI component snapshot tests

---

## 10. Environment Variables

### Required (from .env.example)
| Variable | Purpose | Risk if Missing |
|----------|---------|----------------|
| NEXT_PUBLIC_SUPABASE_URL | Database connection | App crashes on startup |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Client DB access | No data loading |
| SUPABASE_SERVICE_ROLE_KEY | Server DB access | Admin APIs fail |
| RESEND_API_KEY | Email notifications | Silent failure |
| ADMIN_SESSION_SECRET | HMAC token signing | Dev: unsigned tokens |
| ADMIN_PASSWORD_HASH | PBKDF2 hash | Required in production |
| ADMIN_PASSWORD_SALT | PBKDF2 salt | Required in production |
| SUPABASE_CAR_IMAGES_BUCKET | Storage bucket | Falls back to 'car-images' |

### ⚠️ Missing from Example
- NEXT_PUBLIC_SITE_URL — Used for metadata (falls back to VERCEL_URL)
- SUPABASE_BUSINESS_APPLICATIONS_BUCKET — Used in business app uploads

---

## 11. Deployment Readiness

### ✅ Production-Ready Features
- HTTPS cookies (secure: true in production)
- Strict SameSite cookie policy
- Schema cache retry logic
- Multi-variant image processing
- Rate limiting on login
- Audit logging infrastructure
- Diagnostic endpoints
- Rollback scripts

### ⚠️ Pre-Production Checklist
- [ ] Run all 15 Supabase migrations
- [ ] Configure Supabase Storage buckets (car-images, business-applications)
- [ ] Set ADMIN_PASSWORD_HASH + ADMIN_PASSWORD_SALT (generate via script)
- [ ] Set ADMIN_SESSION_SECRET (32-byte random hex)
- [ ] Configure Resend API key
- [ ] Set up Vercel environment variables
- [ ] Verify domain configuration in Vercel
- [ ] Test inquiry submission flow end-to-end
- [ ] Test admin login + session management
- [ ] Test car image upload pipeline
- [ ] Add JSON-LD structured data
- [ ] Fix gold color contrast ratio
- [ ] Add CSRF protection for state-changing admin endpoints
- [ ] Replace in-memory rate limiter with Supabase-backed version
- [ ] Implement actual revenue tracking (remove fake calculation)
- [ ] Add audit log retrieval endpoint
- [ ] Write authentication tests

---

## 12. Summary & Recommendations

### Overall Grade: **B+ (Good)**

This is a well-architected, feature-complete car rental management system. The codebase demonstrates strong engineering practices:

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 9/10 | Clean separation, good module organization |
| Security | 7/10 | Auth implemented but needs hardening |
| Performance | 7/10 | Good image processing, lacks caching |
| UX/UI | 8/10 | Professional design, responsive |
| Testing | 3/10 | Jest configured but zero tests |
| Documentation | 6/10 | README exists but API docs missing |
| SEO | 7/10 | Good basics, missing structured data |

### Top 5 Action Items
1. **Remove hardcoded dmin123 password** — Enforce PBKDF2-only auth
2. **Add CSRF protection** to admin state-changing endpoints
3. **Replace in-memory rate limiter** with database-backed solution
4. **Write tests** for auth flow and inquiry validation (critical path)
5. **Add JSON-LD structured data** for LocalBusiness SEO

---

*Report generated by Codex AI — Full source code audit*
