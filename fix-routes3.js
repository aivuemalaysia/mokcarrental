const fs = require('fs');
const files = [
  'src/app/api/admin/business-applications/[id]/route.ts',
  'src/app/api/admin/cars/[id]/route.ts',
  'src/app/api/admin/cars/route.ts',
  'src/app/api/admin/content/pickup-locations/route.ts',
  'src/app/api/admin/content/site-settings/route.ts'
];
const catchRegex = /^\s*\.catch\s*\(.*=>\s*null.*\)\s*;?\s*$/;
const jsonRegex = /await request\.json\(\)\s*$/;
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let lines = c.split(/\r?\n/);
  let result = [];
  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    if (catchRegex.test(l)) {
      let j = result.length - 1;
      while (j >= 0 && !jsonRegex.test(result[j])) j--;
      if (j >= 0) {
        let m = result[j].match(/(await request\.json\(\))\s*$/);
        if (m) {
          result[j] = result[j].slice(0, result[j].length - m[0].length) + m[1] + l.trim();
        }
      }
    } else {
      result.push(l);
    }
  }
  fs.writeFileSync(f, result.join('\n'), 'utf8');
  console.log('Fixed: ' + f);
});
