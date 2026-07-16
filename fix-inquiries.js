const fs = require('fs');
const f = 'src/app/api/inquiries/route.ts';
let c = fs.readFileSync(f, 'utf8');
// Fix: rateLimit is async, needs await
c = c.replace(
  'const limited = rateLimit({ key: `inquiries:${ip}`, limit: 20, windowMs: 60_000 });',
  'const limited = await rateLimit({ key: `inquiries:${ip}`, limit: 20, windowMs: 60_000 });'
);
fs.writeFileSync(f, c, 'utf8');
console.log('Fixed inquiries/route.ts');
