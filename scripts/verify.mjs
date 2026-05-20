import { writeJsonArtifact } from './_utils.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--url') out.url = args[i + 1];
    if (a === '--json') out.json = true;
  }
  return out;
}

async function httpCheck(url, { expectJson = false } = {}) {
  const startedAt = Date.now();
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const elapsedMs = Date.now() - startedAt;
  const text = await res.text();
  let json = null;
  if (expectJson) {
    json = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })();
  }
  return { url, ok: res.ok, status: res.status, elapsedMs, text, json };
}

async function notifyFailure(payload) {
  const webhook = process.env.ALERT_WEBHOOK_URL;
  if (!webhook) return;
  await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
}

async function main() {
  const args = parseArgs();
  const baseUrl = (args.url || process.env.DEPLOY_URL || '').replace(/\/$/, '');
  if (!baseUrl) {
    console.error('Missing --url (or DEPLOY_URL)');
    process.exit(2);
  }

  const checks = [
    { name: 'health', url: `${baseUrl}/api/health`, expectJson: true },
    { name: 'home', url: `${baseUrl}/` },
    { name: 'cars', url: `${baseUrl}/cars` },
    { name: 'admin_login', url: `${baseUrl}/admin/login` },
  ];

  const results = [];
  for (const c of checks) {
    const r = await httpCheck(c.url, { expectJson: Boolean(c.expectJson) }).catch((e) => ({
      url: c.url,
      ok: false,
      status: 0,
      elapsedMs: 0,
      text: String(e?.message || e),
      json: null,
    }));
    results.push({ name: c.name, ...r });
  }

  const healthOk = results.find((r) => r.name === 'health')?.json?.ok === true;
  const allOk = healthOk && results.every((r) => r.ok);

  const report = {
    ok: allOk,
    baseUrl,
    results: results.map((r) => ({
      name: r.name,
      url: r.url,
      ok: r.ok,
      status: r.status,
      elapsedMs: r.elapsedMs,
      snippet: (r.text || '').slice(0, 250),
    })),
  };

  await writeJsonArtifact('deploy-artifacts', `verify_${Date.now()}.json`, report);

  if (args.json) {
    process.stdout.write(JSON.stringify(report));
    process.exit(allOk ? 0 : 1);
  }

  if (!allOk) {
    await notifyFailure({ type: 'deploy_verify_failed', ...report });
    console.error('Verification failed');
    for (const r of results) {
      if (!r.ok) console.error(`${r.name}: ${r.status} ${r.url}`);
    }
    process.exit(1);
  }

  console.log('Verification passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

