const fs = require('fs');
const files = [
  'src/app/api/admin/business-applications/[id]/route.ts',
  'src/app/api/admin/cars/[id]/route.ts',
  'src/app/api/admin/cars/route.ts',
  'src/app/api/admin/content/pickup-locations/route.ts',
  'src/app/api/admin/content/site-settings/route.ts',
  'src/app/api/admin/content/why-choose/route.ts',
  'src/app/api/admin/diagnostics/car-images/backfill/route.ts'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import \{ validateCsrfToken, jsonError \} from ['"]@\/lib\/csrf['"];?/, 'import { validateCsrfToken } from "@/lib/csrf";');
  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed: ' + f);
});
