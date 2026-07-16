const fs = require('fs');
const f = 'src/lib/execution/middleware.ts';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  'const limited = rateLimit({ key: rateKey, limit: 30, windowMs: 60_000 });',
  'const limited = await rateLimit({ key: rateKey, limit: 30, windowMs: 60_000 });'
);
fs.writeFileSync(f, c, 'utf8');
console.log('Fixed middleware.ts');
