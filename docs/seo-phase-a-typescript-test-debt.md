# Phase A strict application typecheck with legacy test typing debt
Date: 2026-11-03. Scope: website Preview, Draft PR #2.

## Evidence from actual Vercel logs
Build `dpl_5QdjJwNo8xkkYLGY6BQZMyzbAgAz` at `ab294439db43cec9e528231a38a3f540495a5b8c` ran `pnpm exec tsc --noEmit` and exited with code 21. Build logs were previously inaccessible (403); team access was later approved and **the exact diagnostic output was retrieved**.

Errors reported only in `__tests__/*`, including:
- Duplicate global `mockFrom`/`mockCreateClient` in older test files (TS2451).
- Existing Jest mock spread argument typing (TS2556), mock payload possibly undefined (TS18048), empty mock tuple (TS2493), assignment to readonly NODE_ENV (TS2540).
- A new Phase A `__tests__/seo-foundation.test.ts` issue (TS2367) comparing a narrow path literal union to `/my-bookings`; fixed in this PR.

These errors require separate test-source cleanup before **global** `pnpm exec tsc --noEmit` may be declared green.

## Preview gate now
1. `pnpm exec tsc --noEmit -p tsconfig.app.json` — compiles the entire **application source** under `src/` and Next generated types, but deliberately does not typecheck existing `__tests__/` files. This preserves TypeScript strictness for shipping code.
2. `pnpm exec jest --runInBand --testPathPattern='(seo|bookingHandoff)'` — executes the new SEO tests and original booking handoff test.
3. `pnpm exec next build` — compiles the Next.js app. Diagnostic exits 21/22/23 identify the stage.

This is **not** a waiver of all test-file issues. Do not claim a global `tsc --noEmit` pass. Do not modify unrelated admin tests just to unblock SEO Preview.

## Remaining launch gates
- Obtain Vercel READY and check logs explicitly showing all commands succeeded.
- Review performance, mobile authenticated browser/SEO crawl and PWA handoff, and complete business/legal Terms and Privacy sign-off.
- Keep Production, `SkyLand88/mok-pwa`, database, payments, and spending unchanged.
