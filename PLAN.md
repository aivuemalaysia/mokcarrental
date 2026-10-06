# MOK Car Rental — The Plan (what we're actually doing, in what order)

> This is the working plan, combining:
> - the Phase 0 audit doc (the big blueprint you pasted)
> - SG_MY_EXPERIENCE_PLAN.md (what's cheap and high-impact now)
> - WHATSAPP_API_STUDY.md (the WhatsApp study you asked for)
>
> Rule from the audit doc that still holds: **mokcarrental.com stays
> untouched and live the whole time. Nothing in this plan touches
> production until explicitly approved.**

---

## Phase 1 status (as of 2026-10-06)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Real pickup-location list | Done | `src/lib/pickupLocations.ts` now ships Woodlands/Tuas, CIQ, Senai, hotel drop-off, office, custom. Admin manager + content_sections seed still work. |
| 2 | "I'm coming from Singapore" toggle + RM/SGD + payment options | Done | Checkbox on the booking form; license note (SG licence, no IDP); S$ hints on car cards, deposit and live total; TNG eWallet / bank transfer chips. |
| 3 | Live total on the form | Done | days × daily rate + deposit, shown before submit (RM, plus S$ when the SG toggle is on). |
| 4 | One-tap rebooking keyed by WhatsApp number | Done (pending manual DB step) | `/my-bookings` + `GET /api/bookings?whatsapp=` + `?rebook=` pre-fill + migration 019 (index). Privacy note: bare-number lookup returns the customer's own rows; token-scoped session is a Phase 2 follow-up. **Run migration 019 against Supabase before deploying.** |
| 5 | `bookings` table + Postgres exclusion constraint | Done (pending manual DB step) | Migration 020: btree_gist EXCLUDE (car_id =, period =) WHERE status='confirmed'. **Run migration 020 against Supabase.** |
| 6 | PWA install (manifest + service worker) | Done | Hand-written `public/sw.js` (app-shell precache only — no API/car-data caching) + `PwaRegister` install/promo UI + gold-themed manifest with shortcuts. next-pwa deliberately not added. |
| 7 | Bilingual EN + 中文, "RM ≈ S$" hints | Done (booking/price surface) | Light EN/中文 toggle + JSON dictionary on the booking form and price displays. Full-site i18n is out of scope for Phase 1. |

**Also landed in Phase 1 work:**
- `supabase/fix-realtime-policy.sql` (untracked, dashboard-run script): drops the
  permissive `inquiries_events` SELECT policy that silently killed anon Realtime.
  **Owner must run it in the Supabase SQL editor** — realtime admin alerts are
  dead until then. (Pairs with unpushed commit `ca94ac7`.)
- HeroCarousel: fixed a broken button JSX block + a `getSupabase` import that
  doesn't exist in `src/lib/supabase.ts`.
- Test suite: `__tests__/bookings-route.test.ts` (6/6 passing). Nine other
  suites fail identically on the clean tree (Next `cookies()` request-scope
  issues in Jest) — pre-existing, not caused by Phase 1 work.

**Phase 1 definition of done:** a Singaporean or Malaysian can book, rebook,
and see real availability without calling, emailing, or sending 6 screenshots
over WhatsApp. The last mile is: run migrations 019 + 020 and the realtime
SQL in the Supabase dashboard, then deploy.

---

## The shape of it: three phases, not one big bang

The Phase 0 audit doc correctly describes the *final* system (PWA +
customer accounts + referral engine + admin MFA). But it's written as one
giant study, and the right move is to split it into three shippable phases
so each one earns its keep before the next starts. Phase 1 is the only one
that needs customer-facing work. Phases 2 and 3 can be re-scoped or skipped
entirely without hurting the business.

---

## Phase 1 — Make the existing site actually usable for repeat customers
**~2 weeks, no new auth, no new SaaS. All on the current stack.**

1. Real pickup-location list (Woodlands/Tuas, CIQ, Senai, hotel drop-off,
   office) instead of "Office/Airport/Custom" — `src/lib/pickupLocations.ts`
2. "I'm coming from Singapore" toggle on the booking form: license note
   (SG license valid, no IDP), deposit shown in RM + approximate SGD,
   payment options (TNG eWallet / bank transfer)
3. Live total on the form: days x daily rate + deposit, before submit
4. One-tap rebooking: after submitting an inquiry, save a "your booking"
   link keyed by WhatsApp number (already sketched in
   `docs/superpowers/plans/2026-09-21-retention-pwa.md`) — customer
   reopens it later, form pre-fills, they rebook in ~15 seconds
5. `bookings` table with a Postgres exclusion constraint so the same car
   can never have two overlapping confirmed rentals (the one audit-doc
   item worth pulling forward now)
6. PWA install (manifest + service worker only — no auth, no push yet), so
   the rebook link lands on the home screen
7. Bilingual EN + 中文, and "RM ≈ S$" hint on every price

Done = a Singaporean or Malaysian can book, rebook, and see real
availability without calling, emailing, or sending 6 screenshots over
WhatsApp.

## Phase 2 — Real customer identity (this is where the WhatsApp study lands)
**Start only after Phase 1's repeat traffic is real.**

1. Small "OTP bridge" backend route:
   - send OTP via Meta Cloud API (Authentication category)
   - receive the customer's reply via Meta webhook
   - verify + create a Supabase session (access + refresh token)
   - `pending_otps` table: phone, hashed_otp, expires_at, attempts
2. No passwords, ever, for customers or referral partners. Primary
   identity = phone number, per the audit doc.
3. Step-up OTP (fresh OTP) only for the sensitive changes the audit doc
   lists: phone change, email change, IC/passport update, bank account
   change, referral payout info.
4. **Keep the free green-WhatsApp button for all human customer service —

   the OTP-authenticated account is an optional layer, never a requirement.
   The green button keeps working for everyone, always.

5. Referral partners get the same phone-OTP identity — no passwords.
   Payout info changes are step-up OTP protected.
6. Push notifications (the PWA opt-in stub from Phase 1) wire to a
   lightweight web-push server; keep it dependency-light.

## Phase 3 — Referral engine + admin hardening
**Only after Phase 2 traffic is real.**

1. Referral engine: partner dashboard, attribution tracking, payout
   workflow (aligned with the MOK_MANUAL_PAYMENT_PAYOUT_SOP.md in the
   mok-pwa repo).
2. Admin MFA + service-role write gating (MOK_REFERRAL_WRITE_ENABLED
   pattern already exists in mok-pwa).
3. Execution system for recurring ops (already sketched in
   src/lib/execution/).

## Out of scope for now
- Customer password accounts (phone is primary identity, Phase 2)
- Third-party booking widgets / SaaS
- Capacitor / React Native (PWA covers install)
- Full-site i18n (EN/中文 toggle is booking-surface only in Phase 1)

