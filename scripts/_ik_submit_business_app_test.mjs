import fs from 'node:fs';

const filePath = process.env.IK_IMAGE_PATH || 'ui-audit/ui_home.png';
const url = process.env.IK_SUBMIT_URL || 'https://www.mokcarrental.com/api/business-applications';

const buf = fs.readFileSync(filePath);
const blob = new Blob([buf], { type: 'image/png' });

const fd = new FormData();
fd.set('ownerName', 'IK Test');
fd.set('contactNumber', '0123456789');
fd.set('email', 'ik-test@example.com');
fd.set('businessName', 'IK Test Biz');
fd.set('carMake', 'Toyota');
fd.set('carModel', 'Vios');
fd.set('carYear', '2020');
fd.set('notes', 'IK automated test submit');
fd.append('files', blob, 'ui_home.png');

const res = await fetch(url, { method: 'POST', body: fd });
const text = await res.text();
process.stdout.write(`${res.status}\n${text}\n`);
