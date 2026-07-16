const fs = require('fs');
const files = [
  'src/app/api/admin/login/route.ts',
  'src/app/api/admin/logout/route.ts',
  'src/app/api/admin/business-applications/route.ts',
  'src/app/api/admin/cars/[id]/finalize/route.ts',
  'src/app/api/admin/cars/[id]/images/route.ts',
  'src/app/api/admin/cars/[id]/images/[imageId]/route.ts',
  'src/app/api/admin/diagnostics/reload-schema/route.ts',
  'src/app/api/admin/content/why-choose/route.ts'
];
files.forEach(f => {
  try {
    let c = fs.readFileSync(f, 'utf8');
    let hasCookies = /const cookieStore = cookies\(\)/.test(c);
    let hasValidate = /validateCsrfToken/.test(c);
    let hasNextHeaders = c.includes("from 'next/headers'") || c.includes('from "next/headers"');
    let hasCsrf = c.includes("@/lib/csrf") || c.includes("'@/lib/csrf'");
    console.log(f + ": cookies=" + hasCookies + " validate=" + hasValidate + " headers=" + hasNextHeaders + " csrf=" + hasCsrf);
  } catch(e) { console.log(f + " ERROR"); }
});
