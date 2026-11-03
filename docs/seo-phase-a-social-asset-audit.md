# MOK Marketing Site — Open Graph source-of-truth (Phase A)

**2026-11-03, Draft PR #2 staging.** User-approved website only; no Production release.

Authenticated Preview crawl at `1fc6fee1708343443784b3dfea502eadd17f6a3f` exposed legacy social images despite otherwise correct canonical domains:
- `public/og-home.jpg` contained old gold theme and a generic `Airport delivery` claim (not verified as current policy).
- `public/og-image.jpg` contained old gold typography and a generic `Our Fleet` label.
- `/`, `/senai-airport-car-rental`, `/toyota-alphard-rental-jb`, `/about`, `/faq` override root `openGraph` metadata; they lacked `og:image` unless explicitly supplied.
- The prior Preview also generated Twitter images on transient staging hostname. Fixed absolute website URLs at `41e83cb`.

**Staging correction:** use existing official PWA `public/brand/mok-hero-2026.webp` already copied into the website (1536×1024 WebP) as the default Open Graph/Twitter image and in routes overriding root OG metadata. No new images or production copy changes. Existing `/og-home.jpg` and `/og-image.jpg` remain served to preserve any historical links but are no longer used by metadata. Individual car pages may use their own real vehicle image.

**QA:** check rendered HTML for root, guides, FAQ, About, /cars, Terms/Privacy (inherited) — `og:image` and `twitter:image` must use canonical `https://www.mokcarrental.com` host and return 200; no staging domain. Social platforms may crop the 3:2 hero image. A dedicated on-brand 1.91:1 artwork can be considered later as a separate reviewed creative asset, not invented marketing claims.

**Release gates unchanged:** legal/privacy and confirmed business policies, actual responsive browser QA, PWA conversion attribution plan, and separate Production approval.
