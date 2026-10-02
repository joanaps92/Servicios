import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { profile } from '../backend/src/contact-card/profile.js';

const dist = new URL('../dist/', import.meta.url);
await mkdir(new URL('qr/', dist), { recursive: true });
await mkdir(new URL('wallet-assets/', dist), { recursive: true });
const options = { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } };
await writeFile(new URL('qr/contacto.svg', dist), await QRCode.toString(profile.contact, { ...options, type: 'svg' }));
await writeFile(new URL('qr/contacto.png', dist), await QRCode.toBuffer(profile.contact, { ...options, scale: 40 }));
// Rasterize the existing site's geometric J mark, without fonts or remote assets.
const mark = ['01111110', '00011000', '00011000', '00011000', '00011000', '11011000', '01110000'];
for (const scale of [1, 2, 3]) {
  const size = 29 * scale, png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const mx = Math.floor((x / size - .18) / .08), my = Math.floor((y / size - .18) / .09);
    const color = mark[my]?.[mx] === '1' ? [200, 248, 74] : [23, 32, 57];
    png.data.set([...color, 255], (y * size + x) * 4);
  }
  await writeFile(new URL(`wallet-assets/icon${scale === 1 ? '' : `@${scale}x`}.png`, dist), PNG.sync.write(png));
}
console.info('QR SVG/PNG e iconos de Wallet generados.');
