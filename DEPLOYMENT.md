# Deployment Automation

This repo deploys the Next.js app in `mok-car-rental/` to Vercel with three environments:

- Development: local `pnpm dev`
- Preview: per-PR preview deployments (ephemeral)
- Staging: persistent URL updated on `develop`
- Production: deploy + promote on `main`

## One-time setup

### Vercel project linking (to get IDs)

Run these locally from `mok-car-rental/`:

```bash
pnpm dlx vercel@latest login
pnpm dlx vercel@latest link
```

This creates `.vercel/project.json` containing:

- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

### GitHub Actions secrets

Add these to GitHub → Settings → Secrets and variables → Actions:

- `VERCEL_TOKEN` (required)
- `VERCEL_ORG_ID` (required)
- `VERCEL_PROJECT_ID` (required)
- `VERCEL_STAGING_ALIAS` (required, e.g. `staging.yourdomain.com`)
- `PRODUCTION_URL` (required, e.g. `https://yourdomain.com`)
- `ALERT_WEBHOOK_URL` (optional; receives JSON payload on verify failures)

### Vercel environment variables

Configure these in Vercel (Preview + Production):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_SALT`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_PASSWORD_ITERATIONS`
- `SUPABASE_CAR_IMAGES_BUCKET`

Never expose `SUPABASE_SERVICE_ROLE_KEY` via `NEXT_PUBLIC_*`.

Generate the admin password hash locally:

```bash
node scripts/admin-hash.mjs "<password>"
```

## Single-command deploy (local or CI)

From `mok-car-rental/`:

```bash
pnpm deploy:staging
pnpm deploy:production
```

Required env vars for local deploy:

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `VERCEL_STAGING_ALIAS` (staging only)
- `PRODUCTION_URL` (recommended for production post-promote verification)

Artifacts are written to `mok-car-rental/deploy-artifacts/`.

## What the automation does

- Environment setup: Node 20 + pnpm in CI
- Dependency install: `pnpm install --frozen-lockfile`
- Validation: `pnpm lint`, `pnpm test`, `pnpm build`
- Deployment:
  - Staging: preview deploy + `vercel alias set <deploy-url> <VERCEL_STAGING_ALIAS>`
  - Production: staged production deploy (`--skip-domain`) → verify → `vercel promote`
- Post-deploy verification:
  - `GET /api/health`
  - `GET /`
  - `GET /cars`
  - `GET /admin/login`

## Rollback

From `mok-car-rental/`:

```bash
pnpm rollback:production
pnpm rollback:staging
```

- Production rollback uses `vercel rollback` (plan limits may apply).
- Staging rollback re-points the staging alias to a target deployment URL:

```bash
STAGING_ROLLBACK_TO_URL="https://<old>.vercel.app" pnpm rollback:staging
```

## API-triggered deployments

All deploy/rollback workflows support `workflow_dispatch`, so you can trigger them via GitHub’s Actions API (or the GitHub UI).
