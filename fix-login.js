const fs = require('fs');
const f = 'src/app/api/admin/login/route.ts';
let c = fs.readFileSync(f, 'utf8');
let lines = c.split(/\r?\n/);
// Find last import
let lastImportIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('import ')) lastImportIdx = i;
}
// Add imports after last import
lines.splice(lastImportIdx + 1, 0, "import { cookies } from 'next/headers';");
lines.splice(lastImportIdx + 2, 0, "import { validateCsrfToken } from '@/lib/csrf';");
fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('Fixed login/route.ts');

// Also check why-choose - it has everything but maybe jsonError is missing
const f2 = 'src/app/api/admin/content/why-choose/route.ts';
let c2 = fs.readFileSync(f2, 'utf8');
if (!c2.includes('jsonError(')) {
  console.log('why-choose: no jsonError usage');
} else {
  console.log('why-choose: has jsonError usage');
}
