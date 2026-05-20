import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function run(cmd, args, opts = {}) {
  const { cwd, env, captureStdout = true } = opts;
  return await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      env: { ...process.env, ...(env ?? {}) },
      stdio: captureStdout ? ['inherit', 'pipe', 'pipe'] : 'inherit',
      shell: process.platform === 'win32',
    });

    let stdout = '';
    let stderr = '';
    if (captureStdout) {
      child.stdout.on('data', (d) => {
        const s = d.toString();
        stdout += s;
        process.stdout.write(s);
      });
      child.stderr.on('data', (d) => {
        const s = d.toString();
        stderr += s;
        process.stderr.write(s);
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${cmd} ${args.join(' ')} failed (${code})`));
    });
  });
}

export function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export async function writeJsonArtifact(relativeDir, fileName, obj) {
  const dir = path.resolve(process.cwd(), relativeDir);
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, fileName);
  await writeFile(full, JSON.stringify(obj, null, 2), 'utf8');
  return full;
}

