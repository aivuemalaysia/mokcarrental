# SEO Phase A: rental terms reconciliation — OWNER REVIEW REQUIRED
Review date: 2026-11-03. Repository: aivuemalaysia/mokcarrental (Draft PR #2 only).

This is a staging copy proposal, **not** legal approval or a replacement of an executed rental agreement. The standalone marketing website sends new bookings to the separate MOK PWA. Both customer-facing policies require Owner/legal review before this draft may be published.

## Evidence and differences
| Topic | Existing website policy (January 2024) | Current MOK PWA working terms (source `src/app/terms/TermsContent.tsx` + `src/i18n/messages/terms.ts` on `SkyLand88/mok-pwa` main `5ea6e54b`) | Action |
|---|---|---|---|
| Terms status | Static "Last updated January 2024" | Terms version `2026-10-v1`, itself flagged `OWNER/LEGAL COPY REVIEW REQUIRED` | Owner/legal approve current policy wording and version |
| Deposits | RM200–500, required *at pickup* and returned within 7 business days | Vehicle-/booking-specific deposit and payment shown during booking | Verify collection timing, amount, and refund policy |
| Mileage | 200 km/day included; RM0.30–0.50/km extra | Live configurable mileage cap and excess rate; vehicle-specific | Verify settings and displayed mileage |
| Fuel | Full-to-full; refuelling RM2.50/L | "returned as found" unless vehicle page says otherwise | Choose and publish one operational rule |
| Cancellation | Free at least 48h before; 50% at 24–48h; full-day no-show | Configurable free cutoff; later fees depend on booking policy | Verify exact policy and customer approval text |
| Driver eligibility | Age 21+, licence held 1 year | Minimum driver age shown per vehicle | Verify eligibility and licence requirements |
| Late return | One-hour grace; late fees unspecified | Configurable grace minutes and half-/full-day charges | Verify applicable defaults |
| Assistance | "24/7 roadside assistance" | Cannot confirm that business promise from terms source | Verify or remove |
| Privacy | Website policy last updated January 2024 | PWA terms/privacy version `2026-10-v1` (source), owner/legal review flag | Separate privacy notice review required |

## Staged website proposal
- Keep `/terms` indexable and self-canonical. Don't delete, bulk redirect or noindex the URL without SEO assessment.
- Replace **obsolete fixed fee and penalty promises** with a readable explanation that new bookings occur only on MOK PWA and a direct link to `https://app.mokcarrental.com/terms`.
- The marketing-site information page does **not** assert new fees, refunds, cancellation periods or contractual precedence.
- Any active/executed rental agreement, acceptance flow, or live PWA business settings remain unchanged. No PWA edit or database action.
- **Do not ship to Production** until CEO/legal confirms appropriate website-facing notice, PWA version, and any current policy conflicts, in addition to browser and standalone test gates.
