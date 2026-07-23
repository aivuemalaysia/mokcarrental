# MOK Car Rental — SEO Action Checklist

## CRITICAL FIXES (Already Done in Code) ✅

- [x] Contact form now actually submits to `/api/contact` and saves to Supabase
- [x] Email notifications enabled via Resend (once API key is set)
- [x] All pages have unique, keyword-rich titles and descriptions
- [x] `<html lang="ms">` fixed to `<html lang="en">`
- [x] `/cars` page converted to Server-Side Rendering (Google can see fleet)
- [x] Dynamic `generateMetadata()` on every page per car detail
- [x] JSON-LD structured data (CarRental + Product schema + BreadcrumbList)
- [x] Sitemap now dynamically includes all car detail pages from Supabase
- [x] Fleet redirect page cleaned up (no duplicate content penalty)
- [x] Breadcrumb navigation added to Cars, Contact, and Car Detail pages

---

## DEPLOYMENT STEPS (Do Before Sharing)

### 1. Set Environment Variables ⚠️ CRITICAL
In Vercel dashboard or `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://www.mokcarrental.com
NEXT_PUBLIC_SUPABASE_URL=https://suksakybghzumjkzfshj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Mok Car Rental <noreply@mokcarrental.com>
ADMIN_CONTACT_EMAIL=your_personal_email@gmail.com
GOOGLE_SITE_VERIFICATION=your_token_from_gsc
```

### 2. Replace Phone Number Placeholders
In [layout.tsx](C:\Users\MY PC\Documents\trae_projects\4d data\mok-car-rental\src\app\layout.tsx), line ~50:
- Change `telephone: '+60-XXXX-XXXXXXX'` to your actual phone number

### 3. Create OG Images
Place these images in `/public/`:
- `og-image.jpg` — 1200×630px, show your best car with brand name
- `og-home.jpg` — same dimensions, homepage social sharing image

You can use Canva (free) or any image tool. Key text on the image: "Mok Car Rental — Johor Bahru"

### 4. Verify Site Settings
Make sure your Supabase `content_sections` table has these settings populated:
- `whatsappNumber`: Your actual WhatsApp number
- `email`: Your business email
- `address`: Full JB address
- `workingHours`: Business hours text
- `mapsEmbedUrl`: Google Maps embed URL for your location
- `businessName`: "Mok Car Rental"

---

## POST-DEPLOYMENT STEPS

### Week 1: Foundation
- [ ] **Register Google Search Console** → https://search.google.com/search-console
  - Add property (domain or HTML tag verification)
  - Submit sitemap: `https://www.mokcarrental.com/sitemap.xml`
  - Use "URL Inspection" to request indexing of / /cars /about /contact

- [ ] **Set up Google Business Profile** → https://business.google.com
  - This is #1 for local search results (map pack)
  - Add photos of your cars, shop front, team
  - Get your first 5-10 customer reviews ASAP

- [ ] **Install Google Analytics 4**
  - Add GA4 tracking code to layout.tsx `<head>`
  - Track contact form submissions as events

### Month 1-3: Growth
- [ ] **Create Blog Content** (highest ROI activity)
  - Write at least 8 articles targeting specific search queries
  - Suggested topics below
  
- [ ] **Build Backlinks**
  - Submit to Malaysian business directories
  - Get listed on Singapore travel forums
  - Partner with Airbnb hosts near CIQ for referrals

- [ ] **Collect Customer Reviews**
  - SMS/WhatsApp follow-up after every rental
  - Link directly to Google Business review page

### Monthly Ongoing
- [ ] Monitor GSC for impressions/clicks on target keywords
- [ ] Publish 2-4 new blog posts
- [ ] Check PageSpeed Insights score monthly
- [ ] Review inquiry volume and source attribution

---

## BLOG CONTENT IDEAS (for content marketing)

1. "The Complete Guide to Renting a Car in Johor Bahru from Singapore (2026)"
2. "Alphard vs MPV vs Sedan: Which Rental Car Should You Choose in JB?"
3. "10 Must-Visit Places in Johor Bahru You Can Reach by Car"
4. "How to Cross the Causeway from Singapore to JB — Complete 2026 Guide"
5. "Senai Airport Pickup: How Our Car Rental Delivery Service Works"
6. "Business Car Rental in JB: Why Corporations Choose Mok Car Rental"
7. "Weekend Road Trips from Johor Bahru — Best Routes by Car"
8. "Car Rental Requirements for Foreigners in Malaysia"
9. "Cheapest Car Rental in JB: What to Watch Out For"
10. "Johor Bahru to Singapore Day Trip: Self-Drive vs Rent-a-Car"

Each post should be 1,500-2,500 words with:
- Keyword-rich title and meta description
- Internal links to /cars and booking
- FAQ section (targets featured snippets)
- Real photos (not stock images)

---

## KEYWORDS TO TARGET

| Primary Keyword | Search Intent | Target Page |
|----------------|---------------|-------------|
| car rental johor bahru | Commercial | Homepage |
| alphard rental jb | Commercial | /cars |
| mpv rental johor bahru | Commercial | /cars |
| cheap car rental jb | Commercial | Homepage |
| senai airport car rental | Transactional | Homepage / Blog |
| singapore to jb car rental | Transactional | Blog post |
| car rental jb with driver | Transactional | Blog post / new page |
| luxury car rental jb | Commercial | /cars |
| self drive car rental jb | Transactional | Blog post |
