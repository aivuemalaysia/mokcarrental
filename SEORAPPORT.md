# MOK Car Rental — SEO Improvement Report

## What We Fixed (Code-Level Changes)

### 1. Critical: Contact Form Now Actually Submits
- **Before:** The contact form only set `submitted = true` without calling any API. Users appeared to "send" messages but nothing was saved.
- **After:** Created `/api/contact` endpoint that saves inquiries to Supabase AND sends email notifications via Resend. The contact page now calls this endpoint with proper error handling.

### 2. Fixed `<html lang="ms">` → `<html lang="en">`
- **Problem:** `ms` = Bahasa Malay, but the entire site is in English. Google could misrank for wrong audience.
- **Fix:** Changed to `lang="en"` with `dir="ltr"`. Added `locale: "en_MY"` for OpenGraph signals.

### 3. Dynamic Metadata on Every Page
Every page now has unique, keyword-rich titles and descriptions targeting the right search terms:
- **Home:** Targets "car rental Johor Bahru", "affordable car rental JB"
- **Cars:** Targets "Alphard rental JB", "MPV rental Johor Bahru"  
- **Car Details:** Dynamically generates title like "Toyota Alphard — RM350/day Rental | Johor Bahru Car Rental"
- **About:** Targets "trusted car rental service Johor Bahru"
- **FAQ:** Targets "car rental questions Johor Bahru"
- **Contact:** Targets "book your car in Johor Bahru"

### 4. Server-Side Rendering for /cars Listing
- **Problem:** Cars page was `'use client'` fetching from Supabase on the client — Google couldn't see the fleet.
- **Fix:** Converted to Server Component that fetches cars at build/request time, passes data to a lightweight client component for filtering/search.

### 5. Structured Data (JSON-LD) Added
- **CarRental** schema in layout.tsx (existing, enhanced with more detail)
- **Product/Car** schema on every car detail page (new) — shows price directly in Google results
- **BreadcrumbList** schema on car detail pages (new)
- **Offer** structured data with price, currency, availability

### 6. Dynamic Sitemap
- **Before:** Hardcoded list missing all car detail pages
- **After:** Fetches available cars from Supabase and includes each `/cars/[id]` page automatically

### 7. Fleet Page Redirect Fix
- Removed `robots: { index: false }` approach — now uses clean Next.js redirect to avoid duplicate content penalty

### 8. Content Enhancements
- Keyword-rich H1 headings on every page
- Expanded About page content (from ~400 words to ~800+)
- Breadcrumb navigation added to Cars, Contact, and Car Detail pages
- Richer meta descriptions with specific price points and service details

---

## What You Still Need To Do (Non-Code Steps)

### Immediate Actions (Do This Week)

1. **Google Search Console**
   - Verify your domain at https://search.google.com/search-console
   - Submit your sitemap: https://www.mokcarrental.com/sitemap.xml
   - Request indexing of all major pages after deployment

2. **Google Business Profile**
   - Claim/list your business at https://business.google.com
   - Use exact address matching what's in your site settings
   - Add photos of your fleet, hours, and WhatsApp contact
   - This is THE #1 ranking factor for local "car rental near me" searches

3. **Create OG Images**
   - Generate a 1200x630px image at `/public/og-image.jpg`
   - Also create `/public/og-home.jpg` for the homepage social sharing
   - Image should show a quality car with your brand name and "Johor Bahru" text

4. **Set Environment Variables** (in `.env.local` or Vercel dashboard):
   ```
   NEXT_PUBLIC_SITE_URL=https://www.mokcarrental.com
   RESEND_API_KEY=your_resend_api_key_here
   RESEND_FROM_EMAIL=Mok Car Rental <noreply@mokcarrental.com>
   ADMIN_CONTACT_EMAIL=your_email@gmail.com
   GOOGLE_SITE_VERIFICATION=your_verification_token_here
   ```

5. **Update Placeholders in Schema**
   - Replace `+60-XXXX-XXXXXX` with actual phone number in layout.tsx
   - Update `info@mokcarrental.com` with real email

### Medium-Term (Next 2-4 Weeks)

6. **Create a Blog Section** — this is the single biggest opportunity for ranking:
   - "Complete Guide to Renting a Car in Johor Bahru from Singapore"
   - "Alphard vs MPV vs Sedan — Which Car Rental Choice is Right for You?"
   - "Best Weekend Road Trips from Johor Bahru"
   - "How to Cross the Causeway from Singapore to JB in 2026"
   - Each article targets long-tail keywords competitors rank for

7. **Collect Reviews**
   - Ask every satisfied customer for a Google review
   - Embed Google reviews on the website (testimonials boost E-E-A-T signals)
   - Target: 50+ five-star reviews within 3 months

8. **Chinese Language Page**
   - Consider a Mandarin version at `/zh/` 
   - Huge traffic source from Chinese tourists visiting JB
   - At minimum, add Chinese keywords to metadata

9. **Build Backlinks**
   - List on Singapore travel blogs and forums (Reddit r/Singapore, HardwareZone)
   - Get listed on Malaysian tourism directories
   - Partner with Singapore hotels/Airbnb hosts for referrals

### Long-Term (Ongoing)

10. **Monitor Analytics**
    - Install Google Analytics 4
    - Track which pages get the most organic traffic
    - Monitor bounce rate on contact page (should be <60%)

11. **Track Rankings**
    - Monitor positions for target keywords monthly
    - Top targets: "car rental johor bahru", "alphard rental jb", "cheap car rental jb"

12. **Add More Service Pages**
    - `/airport-transfer` — Senai Airport pickup/drop-off service
    - `/corporate-rental` — B2B corporate rental plans
    - `/wedding-car` — Premium wedding car service
    - Each targets high-intent search terms

---

## Expected Timeline

| Timeframe | Expected Impact |
|-----------|----------------|
| 1 week | Contact form working — enquiries start flowing in |
| 2 weeks | Google re-crawls, sees improved metadata and structure |
| 1 month | Organic visibility begins improving for mid-tail keywords |
| 3 months | Competitive positioning for "car rental JB" and related terms |
| 6 months | Strong local pack presence if GMB is optimized |

## Key Metrics to Watch

- **Organic Traffic** (Google Search Console impressions & clicks)
- **Enquiry Volume** (Supabase `inquiries` table count per week)
- **WhatsApp Conversations** (tracked separately)
- **Average Position** for target keywords
- **Page Load Speed** (Core Web Vitals in PageSpeed Insights)
