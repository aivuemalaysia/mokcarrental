# Phase A Preview QA execution gate

This is a **staging-only** unmerged source proposal for the MOK marketing website (aivuemalaysia/mokcarrental, Draft PR #2).
The Vercel project already executes its build using `vercel.json`.

The new buildCommand runs in order:
1. `pnpm exec tsc --noEmit` — independent TypeScript source check.
2. `pnpm exec jest --runInBand --testPathPattern='(seo|bookingHandoff)'` — SEO and PWA-handoff regression suites.
3. `pnpm exec next build` — official Next.js production build.

Only if all three commands return success should Vercel mark the Preview READY.
This does **not** trigger new GitHub Actions workflow usage.
Existing `.github/workflows/deploy.yml` only echoes deployment information.

## Evidence required
- Verify `vercel.json` at the exact PR head still contains the QA gates.
- Inspect the Vercel build logs for all three commands and any warnings. Deployment READY alone is weaker evidence if project-level buildCommand overrides exist.
- Execute authenticated browser checks at 390, 768 and 1440px; test real 404 vs database failure (without touching customer data), sitemap, robots, canonical, landmarks and handoff to `https://app.mokcarrental.com/cars`.
- Current scope remains the website Preview. No Production merge or PWA source change.
- No new software or subscription is authorized; this reuses existing Vercel Preview builds. Review usage limits before broader CI expansion.
