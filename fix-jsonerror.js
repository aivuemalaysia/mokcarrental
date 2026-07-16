const fs = require('fs');
const files = [
  'src/app/api/admin/inquiries/[id]/route.ts',
  'src/app/api/admin/password/route.ts'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import \{ validateCsrfToken, jsonError \} from ['"]@\/lib\/csrf['"];?/, 'import { validateCsrfToken } from "@/lib/csrf";');
  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed: ' + f);
});
