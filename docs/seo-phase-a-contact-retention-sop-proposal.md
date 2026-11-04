# MOK marketing website — contact retention and deletion SOP proposal
Prepared: 4 November 2026
Scope: **only** `aivuemalaysia/mokcarrental` (`www.mokcarrental.com`), Draft PR #2. Does not apply to `SkyLand88/mok-pwa` or `app.mokcarrental.com`.
**STATUS: PROPOSAL ONLY — CEO/legal approval required. NO DELETION, NO NEW SCHEDULED TASK, NO DATABASE OR SECURITY CHANGE.**

## 1. Verified processing and observed data
- The website contact form sends name, email, phone and message to `POST /api/contact`. The server validates fields, inserts into the website Supabase `public.contacts` using a server-only privileged client, and may send an administrative email via Resend. No public self-service delete or correction endpoint was found in this workflow.
- Website Admin Contacts `GET /api/admin/contacts` requires an admin session and returns up to 200 newest entries. `ContactsManager.tsx` displays them. **It does not provide delete or legal-hold functions.**
- Rate limiting may store a request-IP-derived key in `rate_limit_tracker`. Notification emails can produce **additional copies** in mailbox and sending-provider systems. Backups, provider logs and mailbox retention were not verified.
- **Read-only website Supabase audit, 4 Nov 2026:** `contacts` has 1 row; earliest/latest date 2026-10-27; none older than 12 or 24 months. Only aggregate counts and schema/policy metadata were requested; no message, email or phone contents were read.
- `contacts`, `inquiries` and `rate_limit_tracker` have RLS enabled with **no active row policies** as observed. Broad permissive historical migrations must not be replayed. Server privileged access to contacts is separate from end-user RLS.
- Source admin error panel used to display a `CREATE POLICY ... FOR SELECT USING (auth.role() = 'authenticated')` snippet. This could grant every authenticated client access to contact records if run. It was **removed from the staging UI only**, without changing any database policy.

## 2. Recommended business policy for decision — NOT an existing rule
| Data/store | Proposed handling | Decision and dependency |
| --- | --- | --- |
| Ordinary contact inquiries in `contacts` | **12 months from collection**, then review for secure deletion if closed and no legitimate continuing purpose. Review quarterly. | **Needs CEO/legal sign-off**. Twelve months is a proposed business period, **not a universal statutory number**. |
| Active support matters / disputes / legally required records | Retain only for documented purpose and necessary period, then release legal hold and re-review. | Define owner, case reference, legal basis and hold release procedure; do not keep everything indefinitely. |
| Copies in admin mailboxes and Resend | Align mailbox labels, archive/deletion and processor retention with approved policy. | Verify actual recipient, provider settings, delivered message contents and any legal/backup exceptions. |
| Request-IP/rate-limiting keys and server logs | Retain only as necessary for abuse prevention/security; propose short separate lifecycle, not 12-month default. | Inventory `rate_limit_tracker`, hosting logs and rate-limit failure handling before setting any exact period. |
| Supabase backups or provider snapshots | Follow provider-controlled recovery and deletion expiration, do not promise immediate removal from all backups. | Verify provider configuration and service terms; no snapshot deletion without approval. |
| Legacy `inquiries`, historical bookings or PWA data | **Out of scope.** No automatic purging or schema assumptions. | Separate business/legal approval and technical audit required. |

**Legal distinction:** Malaysia PDPA Act 709 s.10 requires keeping data no longer than necessary and appropriate disposal when no longer required. The official Personal Data Protection Standard 2015 discusses preparing an inactive-data disposal schedule and a 24-month review period. Neither automatically authorises a fixed 12-month promise, blanket 24-month retention nor unilateral deletions.

## 3. Practical request workflow (manual first)
1. Receive privacy access/correction/deletion request at the verified privacy mailbox or Contact channel. Assign a restricted internal case reference; avoid copying unnecessary personal data into general tickets.
2. **Verify requester identity proportionately** (prefer a reply to a known contact channel; do not ask for IC images through the public enquiry form). Never expose another person's record merely because name/phone is similar.
3. Admin identifies records by private server-side reference. Confirm customer enquiry versus historical booking/financial record; verify legal obligations and any open disputes.
4. Owner-designated privacy reviewer checks each proposed correction/deletion. Confirm all repositories: `contacts`, admin notification email, backups/third parties. Record scope and lawful exceptions.
5. If deletion is approved, perform it only through a separately authorised, audited server-side workflow. Maintain **non-PII disposal evidence** (case reference, record IDs as appropriate, authoriser, category, reason, date and outcome). Do not expose service secrets to the browser.
6. Communicate the actual response and any limits/retention exceptions to the requester, using verified contact details. Acknowledge and handle according to current legal deadlines after legal review.
7. Perform quarterly expiry reviews and maintain a properly recorded inactive-data disposal schedule. Do not describe this as an automatic task until a real scheduler and tested permissions exist.

## 4. Engineering decision/QA before any deletion feature
- **Architecture:** implement a protected server-side administrative review/list/export/delete service only after requirements and safeguards are approved; no public direct delete or full-table exposure. Separate Website DB from PWA DB.
- **Security:** verify staff admin MFA/session, per-record authorisation, rate-limiting, audit trail, two-person review for bulk deletion, safe backup behavior, ability to reverse mistaken selection before irreversible action, immutable aggregate disposition evidence and full regression tests.
- **Business & cost:** manual review is adequate while the website has only one enquiry; avoid new paid scheduler or database features until need is proven. Mail copies and backup retention are the main operational complexities.
- **QA:** simulate with synthetic test records in an isolated environment only after approved test data and access; ensure real customer data is not deleted. Include privacy request verification, false matches, legal holds, repeat attempts, rate-limits, failed emails and rollback procedure. Verify `tsc`, focused Jest, Next build and independent PR security review.
- **Current action:** remove unsafe copy-paste SQL instructions from Admin Contacts' missing-table state; this is a staging source/UI-only fix.

## 5. Decision to record next
- [ ] CEO accepts **proposed 12-month ordinary-contact retention with quarterly review**, or specifies another period.
- [ ] Owner/legal verifies this is suitable for business purpose and Malaysian law, and approves the final public EN/BM disclosure **only when there is an actual enforceable disposal process**.
- [ ] Identify authorised privacy request reviewer and mailbox owner; confirm recipient-mail processing, logs and backups.
- [ ] Decide whether manual supervised deletion suffices at this volume or approve a narrowly scoped future admin flow. Any actual live database deletion requires separate CEO approval.
- [ ] Confirm the full site privacy and international processing policy, rental terms and visual-QA disposition before production.

## Primary references
- PDPA (Retention Principle), official Act 709 listing: https://www.pdp.gov.my/en/akta/pdp-act-2010-en/
- Personal Data Protection Standard 2015: https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2024/07/LatestStandard.pdf
- Personal Data Protection Amendment Act 2024: https://www.pdp.gov.my/en/akta/personal-data-protection-amendment-act-2024/
- Data Protection Commissioner FAQ: https://www.pdp.gov.my/en/faq/

**Release controls:** Draft PR #2 unmerged. Production website, MOK PWA, DB/RLS, payments and spending unchanged. No automatic expiry cron, delete SQL, client service-role key, database migration or new scheduled work.
