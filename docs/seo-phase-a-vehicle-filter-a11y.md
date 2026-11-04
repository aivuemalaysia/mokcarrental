# SEO Phase A — vehicle listing accessibility

At reviewed staging SHA `fc0f887c9ea1c0f5bf17307ff4a6b816befd1090`, the `/cars` search input used a placeholder but had no accessible name; category filter buttons had no `aria-pressed` state. Touch targets were also below the 44px design target.

Staging-only source fix: add visible-to-screen-readers label and stable search field ID, proper `type=search`, `aria-pressed` for category state, `min-h-11` filter targets, polite live results count, and mark search/filter icons decorative. No change to the category-search algorithm, API, or booking PWA.

Tests in `__tests__/seo-vehicle-filter-a11y.test.ts` are static source regression assertions. They must execute in the existing Vercel build gate; they do not substitute for interactive keyboard/screen-reader testing.

Release remains blocked on real visual/browser QA at 390/768/1440px and Owner/legal signoff. No new spending, Production or MOK PWA changes.
