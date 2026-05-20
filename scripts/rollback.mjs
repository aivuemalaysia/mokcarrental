import { requiredEnv, run, writeJsonArtifact, nowStamp } from './_utils.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { env: null, to: null };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--env') out.env = args[i + 1];
    if (a === '--to') out.to = args[i + 1];
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const envName = args.env || process.env.DEPLOY_ENV || '';
  if (!['staging', 'production'].includes(envName)) {
    console.error('Usage: node scripts/rollback.mjs --env staging|production [--to <deployment-url>]');
    process.exit(2);
  }

  const vercelToken = requiredEnv('VERCEL_TOKEN');
  const vercelOrgId = process.env.VERCEL_ORG_ID || null;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID || null;
  const baseEnv = {
    ...(vercelOrgId ? { VERCEL_ORG_ID: vercelOrgId } : {}),
    ...(vercelProjectId ? { VERCEL_PROJECT_ID: vercelProjectId } : {}),
  };

  const vercelCmd = ['dlx', 'vercel@latest'];
  const stamp = nowStamp();
  const report = {
    ok: false,
    env: envName,
    to: args.to ?? null,
    finishedAt: null,
    steps: [],
  };

  try {
    if (envName === 'production') {
      report.steps.push({ name: 'vercel_rollback', ok: false });
      await run('pnpm', [...vercelCmd, 'rollback', ...(args.to ? [args.to] : []), `--token=${vercelToken}`], {
        env: baseEnv,
        captureStdout: false,
      });
      report.steps.at(-1).ok = true;

      report.steps.push({ name: 'vercel_rollback_status', ok: false });
      await run('pnpm', [...vercelCmd, 'rollback', 'status', `--token=${vercelToken}`], {
        env: baseEnv,
        captureStdout: false,
      });
      report.steps.at(-1).ok = true;

      report.steps.push({ name: 'verify', ok: false });
      await run('node', ['scripts/verify.mjs', '--url', requiredEnv('PRODUCTION_URL')], { env: baseEnv, captureStdout: false });
      report.steps.at(-1).ok = true;
    } else {
      const alias = requiredEnv('VERCEL_STAGING_ALIAS');
      const toUrl = args.to || requiredEnv('STAGING_ROLLBACK_TO_URL');
      report.steps.push({ name: 'staging_alias_set', ok: false });
      await run('pnpm', [...vercelCmd, 'alias', 'set', toUrl, alias, `--token=${vercelToken}`], {
        env: baseEnv,
        captureStdout: false,
      });
      report.steps.at(-1).ok = true;

      report.steps.push({ name: 'verify', ok: false });
      await run('node', ['scripts/verify.mjs', '--url', `https://${alias}`], { env: baseEnv, captureStdout: false });
      report.steps.at(-1).ok = true;
    }

    report.ok = true;
    report.finishedAt = new Date().toISOString();
    await writeJsonArtifact('deploy-artifacts', `rollback_${envName}_${stamp}.json`, report);
    console.log('Rollback complete');
  } catch (e) {
    report.ok = false;
    report.finishedAt = new Date().toISOString();
    await writeJsonArtifact('deploy-artifacts', `rollback_${envName}_${stamp}_failed.json`, report);
    console.error(e?.message || e);
    process.exit(1);
  }
}

main();

