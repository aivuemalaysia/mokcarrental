const fs = require('fs');
const f = 'src/components/WhatsAppFloat.tsx';
let c = fs.readFileSync(f, 'utf8');
// Change openInquiry(pathname) to openInquiry() since pathname is a string but type expects PrefillCar
c = c.replace('onClick={() => openInquiry(pathname)}', 'onClick={() => openInquiry()}');
fs.writeFileSync(f, c, 'utf8');
console.log('Fixed WhatsAppFloat.tsx');
