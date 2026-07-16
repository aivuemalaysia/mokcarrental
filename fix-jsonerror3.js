const fs = require('fs');
const files = [
  'src/app/api/admin/business-applications/[id]/route.ts',
  'src/app/api/admin/cars/[id]/route.ts',
  'src/app/api/admin/cars/route.ts',
  'src/app/api/admin/content/pickup-locations/route.ts',
  'src/app/api/admin/content/site-settings/route.ts',
  'src/app/api/admin/content/why-choose/route.ts',
  'src/app/api/admin/diagnostics/car-images/backfill/route.ts',
  'src/app/api/admin/inquiries/[id]/route.ts',
  'src/app/api/admin/password/route.ts'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let lines = c.split(/\r?\n/);
  let hasJsonErrorUsage = c.includes('jsonError(');
  let hasApiResponseImport = c.includes('apiResponse');
  if (hasJsonErrorUsage && !hasApiResponseImport) {
    // Add import for jsonError from apiResponse
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) lastImportIdx = i;
    }
    if (lastImportIdx >= 0) {
      lines.splice(lastImportIdx + 1, 0, "import { jsonError } from '@/lib/apiResponse';");
      fs.writeFileSync(f, lines.join('\n'), 'utf8');
      console.log('Added jsonError import: ' + f);
    }
  } else if (hasJsonErrorUsage && hasApiResponseImport) {
    console.log('Has jsonError from apiResponse: ' + f);
  } else {
    console.log('No jsonError usage: ' + f);
  }
});
