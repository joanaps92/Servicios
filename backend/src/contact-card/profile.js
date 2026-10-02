import { EMAIL_REGEX } from '../controllers/contact.controller.js';

// Shared by the page, vCard, QR generator and Wallet. Email stays in the environment.
export const profile = Object.freeze({
  name: 'Joan Albert Pérez Soler', givenName: 'Joan Albert', familyName: 'Pérez Soler',
  brand: 'joanaps.dev', role: 'Desarrollo web', phone: '+34655867055', displayPhone: '655 867 055',
  website: 'https://joanaps.dev', services: 'https://joanaps.dev/servicios',
  contact: 'https://joanaps.dev/contacto',
});

export function validContactEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email) && !/[\r\n]/.test(email);
}

const escape = value => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
function fold(line) {
  let result = '', bytes = 0;
  for (const character of line) {
    const length = Buffer.byteLength(character);
    if (bytes + length > 75) { result += '\r\n '; bytes = 1; }
    result += character;
    bytes += length;
  }
  return result;
}

export function createVcard(email) {
  if (!validContactEmail(email)) throw new Error('CONTACT_EMAIL no válido');
  return ['BEGIN:VCARD', 'VERSION:3.0', `N:${escape(profile.familyName)};${escape(profile.givenName)};;;`,
    `FN:${escape(profile.name)}`, `ORG:${profile.brand}`, `TITLE:${profile.role}`,
    `TEL;TYPE=CELL:${profile.phone}`, `URL:${profile.website}`, `URL;TYPE=WORK:${profile.services}`,
    `EMAIL;TYPE=INTERNET:${escape(email)}`, 'END:VCARD'].map(fold).join('\r\n') + '\r\n';
}
