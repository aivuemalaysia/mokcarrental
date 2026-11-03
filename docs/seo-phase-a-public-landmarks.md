# Phase A public page landmarks review

The website root layout deliberately uses `<div id="main-content">` to avoid nested `<main>` landmarks. Source review of staging commit `5c9941b16ec8fb150ad76ff78a2d7ba0cdc6d055` found ten public information routes whose actual page content lacked a `<main>` element entirely.

Staging correction: wrap each public page's primary content in one semantic `<main>` without altering the shared skip-link target or admin routes. Existing home and /booking already use their own `<main>` and were not changed. `/cars` uses a client component, and vehicle detail uses its page wrapper.

New regression suite checks 10 routes and the skip-link invariant. These are source tests; real keyboard focus, navigation order and screen reader behavior still require browser evidence.

**Release guardrails:** Only public website route wrappers changed. No MOK PWA, payment, data schema, policies, site settings, admin, Production or spending changes.
