# MOK website SEO Phase A baseline and release contract
Date: 2026-11-03. Scope: **aivuemalaysia/mokcarrental** → website Vercel project only.
Baseline Production commit: `696904078eef79c2677371ac847b2e220c16b5e4`.
**Do not merge or deploy this PR without separate CEO Production approval.**
**Do not change** `SkyLand88/mok-pwa`, `app.mokcarrental.com`, Supabase data or payment flows.
No spending, new software subscription, database migration or unverified business promises.

## First-party performance baseline (Windsor.ai / Google Search Console)
GSC property: `https://www.mokcarrental.com/`; date ranges are complete days as at 3 November 2026.
- Last 28 complete days: 26 clicks; 966 impressions; 2.69% CTR; average position 27.99.
- Last 7 complete days: 7 clicks; 224 impressions; 3.12% CTR; average position 29.36.
- Last 90 complete days: page-row total 74 clicks and approximately 2,718 impressions; homepage accounted for all observed clicks. Four other reported pages had one impression each: `/about`, `/cars`, `/faq`, `/start-business`. These figures do **not** establish whether other URLs are indexed.
- 90-day query opportunities: `car rental johor bahru` 291 impressions, average position 43.20; `car rental jb` 149, position 36.80; `car rental johor bahru airport` 77, position 37.27; `long term car rental johor bahru` 63, position 31.46; `alphard rental jb` 23, position 8.43; `alphard rental jb price` 21, position 10.10.
- Search Console sitemap connector returned a single null-path / zero-submission row; this does not prove the sitemap is not submitted. **Verify in GSC UI before asserting.**
- No connected GA4 property, confirmed Google-selected canonical list, full index-coverage export, or audited backlinks supplied; do not fabricate.

## Source-supported findings / risk
1. Root layout previously supplied a homepage canonical inherited by routes without explicit canonical. Root metadataBase could resolve to Preview/localhost. Staging change makes the base stable and requires each indexable page to specify its own canonical.
2. Root JSON-LD previously contained hardcoded street address, coordinates, prices, hours, 4.9 rating and 200 reviews that were not verified. Staging change replaces that with minimal schema not claiming these facts.
3. Homepage/carousel and content previously claimed RM150-RM600 pricing, free airport delivery, 24/7 assistance and 500+ customers. Claim validity not established; staging homepage removes those claims.
4. The Contact page fell back to placeholder phone and map copy. Staging change suppresses placeholder numbers and uses factual service-area contact wording.
5. Homepage had client-fetched featured vehicles. Staging homepage uses crawlable, server-rendered rental topic links; existing `/cars` and `/cars/[id]` remain.
6. Dynamic vehicle sitemap relies on the legacy website car table, not MOK PWA live inventory. No mapping of website IDs to PWA IDs is permitted; the booking destination remains `/cars` on the PWA.
7. `/cars` and legacy vehicle URLs **MUST NOT** be deleted or bulk redirected until GSC indexing, backlinks and relevance are audited URL by URL.

## Remaining before Production approval
- Verify official business name, phone, email, operational service area, opening/support hours, prices, fees, deposit/mileage/cancellation policies and real reviews/photos.
- Run full URL crawl and export Google-selected canonicals, Page Indexing report and submitted sitemap state in Search Console.
- Validate current `/robots.txt`, `/sitemap.xml`, homepage, `/cars`, two new service pages and representative UUID car URL: HTTP status, self-canonical, indexability, meta title, description, H1, JSON-LD and links.
- Confirm Preview uses deployment protection and is not indexed.
- Run `npx tsc --noEmit`, `next build`, relevant Jest tests, and visual QA on desktop/mobile before claiming release-ready.
- Validate PWA handoff on desktop/mobile without changing PWA; examine attribution requirements before altering tags, GA4 or PWA.
- Obtain fresh Search Console baseline and previous Vercel READY deployment ID as rollback reference before any approved launch.
- Check both Architecture and Cybersecurity perspectives: public pages only; no PWA/database/customer records; schema truthfulness; safe URL handling; no tracking PII.

## Phased content strategy (NOT all authorized in this Phase A PR)
1. Phase A: preserve SEO URLs; create PWA-branded homepage and initial truthful pages for Senai and Alphard; technical canonicals/sitemap/schema; remove unsupported homepage copy.
2. Phase B after review: improve fleet/individual vehicle content and add targeted MPV, economy, long-term and Singapore visitor pages, each with original utility.
3. Phase C: Google Business Profile, review request workflow, local partnerships, earned links and cross-subdomain conversion analytics with consent and owner-controlled release.

The SEO objective is qualified organic clicks and tracked PWA bookings, not guaranteed top-three rankings. Never claim an increase in SEO performance without post-launch data.
