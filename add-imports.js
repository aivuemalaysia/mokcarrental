const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/admin/business-applications/[id]/route.ts',
  'src/app/api/admin/cars/[id]/route.ts',
  'src/app/api/admin/cars/route.ts',
  'src/app/api/admin/content/pickup-locations/route.ts',
  'src/app/api/admin/content/site-settings/route.ts',
  'src/app/api/admin/content/why-choose/route.ts',
  'src/app/api/admin/diagnostics/reload-schema/route.ts',
  'src/app/api/admin/inquiries/[id]/route.ts',
  'src/app/api/admin/business-applications/route.ts',
  'src/app/api/admin/cars/[id]/finalize/route.ts',
  'src/app/api/admin/cars/[id]/images/route.ts',
  'src/app/api/admin/cars/[id]/images/[imageId]/route.ts',
  'src/app/api/admin/diagnostics/car-images/backfill/route.ts',
  'src/app/api/admin/password/route.ts'
];

const needsCookiesImport = /const cookieStore = cookies\(\)/;
const needsValidateImport = /validateCsrfToken/;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let lines = content.split(/\r?\n/);
  
  // Check if we need to add imports
  let needsCookies = needsCookiesImport.test(content);
  let needsValidate = needsValidateImport.test(content);
  
  if (needsCookies || needsValidate) {
    // Find the last import line
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) lastImportIdx = i;
    }
    
    if (lastImportIdx >= 0) {
      if (needsCookies) {
        lines.splice(lastImportIdx + 1, 0, "import { cookies } from 'next/headers';");
      }
      if (needsValidate) {
        lines.splice(lastImportIdx + 1 + (needsCookies ? 1 : 0), 0, "import { validateCsrfToken, jsonError } from '@/lib/csrf';");
      }
      fs.writeFileSync(f, lines.join('\n'), 'utf8');
      console.log('Added imports: ' + f);
    }
  } else {
    console.log('No imports needed: ' + f);
  }
});
