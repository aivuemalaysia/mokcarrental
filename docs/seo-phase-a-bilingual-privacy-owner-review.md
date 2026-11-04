# Phase A — bilingual website privacy notice, provisional legal identity
Date: 2026-11-04. Website **aivuemalaysia/mokcarrental** only, Draft PR #2, staging Preview. NOT legal advice or final publication clearance.

## Authority
- Malaysia PDPA 2010 s.7: notice and choice; BM + English notice requirement.
- Commissioner guidance: https://www.pdp.gov.my/en/akta/guidance-on-the-preparation-of-personal-data-protection-notices/
- Commissioner quick notice guide: https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2025/01/A-Quick-Guide-to-PRIVACY-NOTICE.pdf
- 2025 cross-border guidance: https://www.pdp.gov.my/en/akta/personal-data-protection-guidelines-on-cross-border-transfer-of-personal-data-cbpdt/

## Legal identity evidence (not an SSM registry extract)
- Provisional registered name **Mok Car Group (M) Sdn Bhd** appears as full legal business name on the Owner's supplier onboarding documentation, business-card artwork, and as the confirmed Maybank payee for MOK. No official SSM certificate/registry result was available in this review.
- Website brand: **MOK Car Rental**. This is not equivalent to legal registered name.
- Existing site-settings API on Preview gives contact email **mokcargroup777@gmail.com**, phone **+601133223351**, address in Taman Ekoflora, and workingHours **24/7**. Those are configured values, not independent proof of legal service address, staffed operating hours or privacy contact mailbox.
- Email correspondence sometimes says `Mok Car Group Sdn Bhd` without `(M)`; require SSM certificate, ownership and controller confirmation before Production. No SSM number fabricated.

## Actual observed processing
- Contact website POST validates required **name/email/phone/message**, stores in website Supabase `contacts` via server privileged client, and optionally emails an admin recipient via Resend. Request IP is used for rate-limiting. Do NOT change the endpoint or submit sample real enquiries.
- Website database is configured in Supabase **Australia** (`ap-southeast-2`). This fact motivates an actual cross-border transfer assessment and processor/contract review, not a claim of illegality.
- Existing `contacts` and `inquiries` public tables have RLS enabled, no active row policies as observed in read-only SQL. This means older permissive policies seen in the repository source should NOT be replayed unreviewed.

## Staging changes
- Added `src/lib/legalIdentity.ts` with the provisional legal name and publicly configured support email.
- Replaced `/privacy` with two complete, separately identifiable English and Bahasa Malaysia notices in one accessible document, linked at top with language anchors. Notice covers controller, source, required fields, purpose, recipients/service providers, offshore processing, retention, security, rights, PWA boundary, and changes.
- Added prominent dual-language link **before** any input field in the public Contact form; no new checkbox, consent collection mechanism, API or database changes.
- Added legal registered name to the website Footer, without a fabricated registration number.
- Added targeted regression tests under `__tests__/seo-bilingual-privacy.test.ts`.

## Non-waivable release decisions
1. Owner supplies/approves SSM certificate name spelling, entity number (if required to display), legal data controller and business trading relationship. **Do not claim registry verification** based on bank account alone.
2. Owner/legal confirms the privacy contact channel, official business address and any DPO applicability; do not assume registered hours are 24/7.
3. Set actual operational **retention and deletion** rules, document processors, international data transfer basis, notice-update/change process and requests/complaints workflow, and approve the exact English and Malay text. The staging notice explicitly marks these unknowns; do not remove without evidence.
4. Verify PWA booking Terms version `2026-10-v1` against live rental operations; these separate terms are still marked OWNER/LEGAL COPY REVIEW REQUIRED.
5. Interactive browser/mobile visual QA at 390/768/1440 remains unverified. CEO agreed to move to next gate, not to falsely mark it done.
6. A separate CEO Production approval is required AFTER these release gates close. Until then Draft PR #2 remains unmerged.

No Production, PWA, database, security policy, credential, API billing or subscription changes authorised.
