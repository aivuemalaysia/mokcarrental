import { nowStamp, requiredEnv, run, writeJsonArtifact } from './_utils.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { env: null, skipVerify: false };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--env') out.env = args[i + 1];
    if (a === '--skip-verify') out.skipVerify = true;
  }
  return out;
}

function lastNonEmptyLine(s) {
  return (s || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .at(-1);
}

async function main() {
  const startedAt = new Date().toISOString();
  const args = parseArgs();
  const envName = args.env || process.env.DEPLOY_ENV || '';
  if (!['staging', 'production'].includes(envName)) {
    console.error('Usage: node scripts/deploy.mjs --env staging|production');
    process.exit(2);
  }

  const vercelToken = requiredEnv('VERCEL_TOKEN');
  const vercelOrgId = process.env.VERCEL_ORG_ID || null;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID || null;
  const vercelEnv = envName === 'production' ? 'production' : 'preview';

  const stamp = nowStamp();
  const report = {
    ok: false,
    env: envName,
    vercelEnv,
    startedAt,
    finishedAt: null,
    deploymentUrl: null,
    stagingAlias: null,
    promoted: false,
    steps: [],
  };

  try {
    const baseEnv = {
      ...(vercelOrgId ? { VERCEL_ORG_ID: vercelOrgId } : {}),
      ...(vercelProjectId ? { VERCEL_PROJECT_ID: vercelProjectId } : {}),
    };

    report.steps.push({ name: 'pnpm_install', ok: false });
    await run('pnpm', ['install', '--frozen-lockfile'], { env: baseEnv, captureStdout: false });
    report.steps.at(-1).ok = true;

    report.steps.push({ name: 'lint', ok: false });
    await run('pnpm', ['lint'], { env: baseEnv, captureStdout: false });
    report.steps.at(-1).ok = true;

    report.steps.push({ name: 'test', ok: false });
    await run('pnpm', ['test'], { env: baseEnv, captureStdout: false });
    report.steps.at(-1).ok = true;

    report.steps.push({ name: 'build', ok: false });
    await run('pnpm', ['build'], { env: baseEnv, captureStdout: false });
    report.steps.at(-1).ok = true;

    const vercelCmd = ['dlx', 'vercel@latest'];

    report.steps.push({ name: 'vercel_pull', ok: false });
    await run('pnpm', [...vercelCmd, 'pull', '--yes', `--environment=${vercelEnv}`, `--token=${vercelToken}`], {
      env: baseEnv,
      captureStdout: false,
    });
    report.steps.at(-1).ok = true;

    report.steps.push({ name: 'vercel_build', ok: false });
    await run('pnpm', [...vercelCmd, 'build', `--token=${vercelToken}`, ...(envName === 'production' ? ['--prod'] : [])], {
      env: baseEnv,
      captureStdout: false,
    });
    report.steps.at(-1).ok = true;

    report.steps.push({ name: 'vercel_deploy', ok: false });
    const deployRes = await run(
      'pnpm',
      [
        ...vercelCmd,
        'deploy',
        '--prebuilt',
        `--token=${vercelToken}`,
        ...(envName === 'production' ? ['--prod', '--skip-domain'] : []),
      ],
      { env: baseEnv, captureStdout: true },
    );
    report.steps.at(-1).ok = true;

    const deploymentUrl = lastNonEmptyLine(deployRes.stdout);
    if (!deploymentUrl || !deploymentUrl.includes('vercel.app')) {
      throw new Error('Could not determine deployment URL from Vercel output');
    }
    report.deploymentUrl = deploymentUrl.startsWith('http') ? deploymentUrl : `https://${deploymentUrl}`;

    if (envName === 'staging') {
      const alias = process.env.VERCEL_STAGING_ALIAS;
      if (alias) {
        report.steps.push({ name: 'vercel_alias_staging', ok: false });
        await run('pnpm', [...vercelCmd, 'alias', 'set', report.deploymentUrl, alias, `--token=${vercelToken}`], {
          env: baseEnv,
          captureStdout: false,
        });
        report.steps.at(-1).ok = true;
        report.stagingAlias = alias;
      }
    }

    if (!args.skipVerify) {
      report.steps.push({ name: 'verify', ok: false });
      const verifyUrl = envName === 'staging' && report.stagingAlias ? `https://${report.stagingAlias}` : report.deploymentUrl;
      await run('node', ['scripts/verify.mjs', '--url', verifyUrl], { env: baseEnv, captureStdout: false });
      report.steps.at(-1).ok = true;
    }

    if (envName === 'production') {
      report.steps.push({ name: 'vercel_promote', ok: false });
      await run('pnpm', [...vercelCmd, 'promote', report.deploymentUrl, '--yes', `--token=${vercelToken}`], {
        env: baseEnv,
        captureStdout: false,
      });
      report.steps.at(-1).ok = true;
      report.promoted = true;

      if (!args.skipVerify && process.env.PRODUCTION_URL) {
        report.steps.push({ name: 'verify_production', ok: false });
        await run('node', ['scripts/verify.mjs', '--url', process.env.PRODUCTION_URL], { env: baseEnv, captureStdout: false });
        report.steps.at(-1).ok = true;
      }
    }

    report.ok = true;
    report.finishedAt = new Date().toISOString();
    await writeJsonArtifact('deploy-artifacts', `deploy_${envName}_${stamp}.json`, report);

    console.log(`Deployed: ${report.deploymentUrl}`);
    if (report.stagingAlias) console.log(`Staging: https://${report.stagingAlias}`);
  } catch (e) {
    report.ok = false;
    report.finishedAt = new Date().toISOString();
    await writeJsonArtifact('deploy-artifacts', `deploy_${envName}_${stamp}_failed.json`, report);
    console.error(e?.message || e);
    process.exit(1);
  }
}

main();

