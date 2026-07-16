const fs = require('fs');
const f = 'src/components/WhatsAppFloat.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace("import { usePathname } from 'next/navigation';\n\n", '');
c = c.replace('  const pathname = usePathname();\n', '');
fs.writeFileSync(f, c, 'utf8');
console.log('Cleaned WhatsAppFloat.tsx');
