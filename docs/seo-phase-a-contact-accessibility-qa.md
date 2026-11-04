# Phase A Contact accessibility and lead conversion QA

Scope: MOK SEO website Draft PR #2, staging only. Source inspection at `e54215f0cfca4e888b05a5a6db9d58399458b33e` found four form labels without matching `htmlFor`/input `id`, and `noValidate` disabled native required/email validation despite markup indicating required fields. The submit button and success/error states lacked explicit status announcements.

Proposed changes: add stable IDs, names and associated labels; restore browser-native required/email validation; add `role=alert` on errors and `role=status` on success; remove unsupported claim about Singapore customer communication habits. Do not change form POST destination `/api/contact` or backend data writes, mail notifications, Supabase configuration, admin or booking PWA.

Retest: Vercel application TypeScript, targeted SEO+booking Jest, Next build. Browser QA must confirm keyboard focus, screen-reader field labels, invalid required/email behavior and success/error feedback. An actual submission must use designated test data and must not create unsolicited real contacts or emails without explicit authorization. Mobile widths 390/768/1440 remain required. Remote browser/visual QA remains blocked in this ChatGPT session.
