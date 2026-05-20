function bytesToBase64Url(bytes) {
  const b64 = Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function pbkdf2Sha256(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

const password = process.argv[2];
if (!password) {
  process.stderr.write('Usage: node scripts/admin-hash.mjs <password>\n');
  process.exit(1);
}

const iterations = 210000;
const salt = new Uint8Array(16);
crypto.getRandomValues(salt);
const hash = await pbkdf2Sha256(password, salt, iterations);

process.stdout.write(`ADMIN_EMAIL=admin@mokcarrental.com\n`);
process.stdout.write(`ADMIN_PASSWORD_SALT=${bytesToBase64Url(salt)}\n`);
process.stdout.write(`ADMIN_PASSWORD_HASH=${bytesToBase64Url(hash)}\n`);
process.stdout.write(`ADMIN_PASSWORD_ITERATIONS=${iterations}\n`);
