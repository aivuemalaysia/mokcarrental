# MOK SEO Phase A — CEO/legal release sign-off register
Prepared: 2026-11-04. Scope: **marketing website only** `aivuemalaysia/mokcarrental` → `www.mokcarrental.com`; excludes `SkyLand88/mok-pwa` and `app.mokcarrental.com`.
**Status: NOT APPROVED FOR PRODUCTION.** Draft PR #2 remains unmerged. The following are decision checkpoints, not checked approvals.

## Evidence currently verified
- Self-reported supplier onboarding questionnaire **Mok Car Group.pdf**, and a purchase order **PO1030000007 Mok Car.pdf**, both name **Mok Car Group (M) Sdn Bhd**. Neither is an SSM certificate, corporate profile or independent registry result; do not invent an SSM number.
- Site settings show contact e-mail `mokcargroup777@gmail.com` and working-hours value `24/7`. Treat these as configured values, NOT independently confirmed availability or a verified official privacy contact.
- Website Contacts collects name, email, telephone and message. Contact backend writes to the website Supabase database and may notify through an email processor. Website Supabase currently uses **Australia** region `ap-southeast-2`. Read-only, aggregate-only audit on 4 Nov 2026 found **1 contact record, dated 27 Oct 2026**, none older than 12 or 24 months; no individual contact content read and no records modified.
- Website contacts and inquiries tables have RLS enabled and **no currently active row-access policies** (read-only metadata query). Historical SQL files differ; do not replay older migrations as a quick fix.
- Preview staging technical QA before this follow-up: app-source TypeScript passed, targeted SEO/booking Jest 12 suites / 42 tests, Next build READY at `066510e`; source may move as the PR continues. Browser read-only HTML audit is NOT interactive 390/768/1440px visual testing.
- On 2026-11-04, the public privacy version-history paragraphs were cleaned to remove internal launch workflow language. This does NOT settle the customer-data retention schedule, legal identity, or legal approval.

## Approval checklist — all open
- [x] **CEO-authorised company-name display (SSM document waived).** Owner explicitly approved using `Mok Car Group (M) Sdn Bhd` from existing business documents and waived an SSM report requirement on 4 Nov 2026 (PR comment `6620686287`). This is owner-attested, not independently SSM-verified. Do not invent a company number or make any paid registry purchase.
- [ ] **Public privacy contact and business details.** Confirm legal address, phone, `mokcargroup777@gmail.com` as the mailbox that actually receives privacy rights requests, and a responsible person/process for responding. Do not imply 24/7 staffed support merely from a settings field.
- [ ] **Retention/deletion schedule and data-subject requests.** CTO prepared a **PROPOSED 12-month retention** period for ordinary website contact enquiries with quarterly review, case-by-case legal holds, handling of email copies, and a documented 24-month inactive-data disposal schedule review under relevant Malaysian standards. This is a business proposal, NOT a universal statutory 12-month rule and NOT yet approved or automatically enforced. Confirm actual mailbox, logs, provider backups, rights handling and manual or automated deletion controls before promising a fixed period in public copy. See `docs/seo-phase-a-contact-retention-sop-proposal.md`.
- [ ] **Cross-border and processors.** Review hosting/database/email service agreements, subprocessors, data locations, safeguards and appropriate PDPA transfer basis; website Supabase region is Australia. Do not claim cross-border processing is unlawful merely because it is overseas.
- [ ] **Malaysian legal compliance.** Owner/legal reviews section 7 Notice and Choice, both English and Bahasa Malaysia texts, controller-registration obligations and the **2026 Commissioner Circular No.1/2026 (Registration of Data Controllers)** if applicable, DPO applicability, breach/rights processes, and current 2025 guidelines. The CTO does not certify legal compliance.
- [ ] **Rental policy accuracy.** Match website /terms handoff against current PWA rental terms `2026-10-v1` and actual identity requirements, charges, payment, deposit, refund, cancellation, and booking process. Existing PWA terms carry an OWNER/LEGAL COPY REVIEW REQUIRED flag. No PWA source change in this task.
- [ ] **Interactive visual risk disposition.** Record exact browser QA evidence at 390px/768px/1440px for navigation, content overlap, contact form, footer, logo and PWA handoff — or document CEO acceptance of that unverified visual risk for this specific launch. Read-only Chrome connection is not an interactive test.
- [ ] **CEO Production gate.** CTO rechecks exact PR head, code changes, security, Vercel build, rollback target and all approvals. CEO separately authorises any merge/production deployment. Current `www.mokcarrental.com` Production version remains untouched.

## Regulatory and registry sources
- Official privacy notices: https://www.pdp.gov.my/en/akta/guidance-on-the-preparation-of-personal-data-protection-notices/
- Official privacy notice guide: https://www.pdp.gov.my/en/akta/personal-data-protection-act-2010-reprint/
- Official 2026 registration circular: https://www.pdp.gov.my/en/akta/personal-data-protection-commissioners-circular-no-1-2026-registration-of-data-controllers/
- Cross-border guideline: https://www.pdp.gov.my/en/akta/personal-data-protection-guidelines-on-cross-border-transfer-of-personal-data-cbpdt/
- SSM company profile and incorporation documents: https://www.ssm.com.my/Pages/Product/Company-Information.aspx

## Branch and cost controls
No Production, PWA, payment, database, RLS, credentials or new subscription changes authorised. Use existing Vercel Preview build capacity; check usage if further builds are needed. No GitHub Actions rerun unless necessary and authorised.
