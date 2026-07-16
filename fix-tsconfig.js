const fs = require('fs');
let c = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
c.compilerOptions.target = 'ES2017';
fs.writeFileSync('tsconfig.json', JSON.stringify(c, null, 2), 'utf8');
console.log('Added target: ES2017 to tsconfig.json');
