# SEO Phase A — privacy content review and semantic HTML audit
Date: 2026-11-03. Scope: website marketing pages only, Draft PR #2. No booking PWA, production, database or payment change.

## Staging corrections
- The website's Privacy Policy was dated January 2024, made unverified statements about data uses and age eligibility and did not distinguish the SEO marketing site from the separate booking PWA.
- The staging `/privacy` copy now clearly separates general website enquiries from bookings/documents in `app.mokcarrental.com`; retains the URL/self canonical and provides contact channels.
- The draft is **NOT** a verified statutory privacy notice. Owner/legal must validate the controller/company legal name, hosting/providers, website access logs and analytics/cookies, actual data recipients, retention, data-subject request handling, marketing consent and transfer mechanisms before publishing. Do not copy or use this text as finalized legal policy.
- `src/app/layout.tsx` previously wrapped all children in `<main>` even though some child pages already return their own `<main>`, creating nested main landmarks. Replaced the root outer main with a `<div id="main-content">` while preserving skip-link target. The new homepage defines its own `<main>` landmark.
- Removed the inherited homepage Open Graph `url` from the shared root metadata to avoid assigning the root URL to pages without their own OG URL. Existing canonical link metadata remains separate.

## Release verification required
- Authenticated browser inspect `/`, `/booking`, `/cars`, `/privacy`, `/terms`, both new guide pages and an individual car page. Check meaningful landmarks, skip-link keyboard focus, metadata, canonical, social URL and headings.
- Do not assume any website analytics, data retention, third-party disclosure or consent mechanism that has not been confirmed.
- Legal sign-off is a separate mandatory gate alongside the PWA booking terms version review.
- Standalone `npx tsc --noEmit`, Jest and mobile browser QA still required before Production readiness. Vercel READY alone is not sufficient.
