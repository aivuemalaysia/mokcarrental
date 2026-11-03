# Phase A authenticated Preview SEO crawl — 2026-11-03

**Evidence:** User-authorized staging QA via the connected Vercel account, deployment `dpl_8N7em2qyg7VEMgp5zGj3HezGyj8q` at `1fc6fee1708343443784b3dfea502eadd17f6a3f`. The provider accessed the protected Preview using a **temporary deployment share link** expiring within 23 hours; Production protection settings were not changed. The link is not included in this report.

## Direct HTTP findings before follow-up fixes
- `/robots.txt` HTTP 200, permits `/`, disallows `/admin/`, references the production sitemap.
- `/sitemap.xml` HTTP 200, **36 unique HTTPS www URLs**: 11 static (including new Senai and Alphard guides), 25 legacy car UUID URLs; no admin/my-bookings URLs. 25 timestamps on car URLs.
- Home, `/faq`, `/booking`, `/about`, `/terms`, `/privacy`, `/contact`, `/cars`, both new guide pages, and a real Perodua Bezza URL all returned HTTP 200 with canonical links and crawlable HTML. The two new guides and legacy car URL had correct page titles, H1 and production self-canonical.
- A valid-format nonexistent car UUID returned **404/noindex**, as desired.
- A malformed vehicle identifier (`/cars/invalid-ID`) returned **500** rather than 404. Add route-parameter validation before UUID DB lookup.
- Homepage HTML title lacked brand suffix (`Car Rental Johor Bahru (JB)`) because the root page did not apply the parent title template. Set explicit full homepage title.
- Root Open Graph/Twitter images linked to a transient Preview domain instead of the canonical `www` hostname. Make image metadata absolute to `SEO_ORIGIN` while retaining the existing real public image assets.
- The car fleet heading still implied a live rental catalogue and certain vehicle upkeep, despite website being non-booking informational. Clarify copy.
- The marketing Privacy page linked to PWA `/terms` but labelled it a privacy notice. The PWA repo currently has `/terms`, not a dedicated `/privacy` page. Clarify this is the booking terms, and leave privacy documentation for Owner/legal sign-off.

## Retest exact new head before release
- Test `/cars/invalid-ID` returns HTTP **404** and **noindex**, while a real car profile remains HTTP 200 and existing canonical.
- Verify homepage title has MOK brand once, not duplicated, and `twitter:image` and `og:image` resolve to `https://www.mokcarrental.com/...`.
- Verify responsive navigation, header logo/hero crop, keyboard focus, and content at widths 390/768/1440px in a real browser. The Vercel tool can fetch HTML but does not operate a visual browser.
- Rerun app TypeScript, SEO/booking Jest and Next.js build. Legacy global TS test debt remains.
- Marketing site Terms & Privacy and PWA terms version 2026-10-v1 remain subject to separate Owner/legal review; no Production.
