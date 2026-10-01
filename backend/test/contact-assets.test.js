import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

test('the printable QR decodes to the canonical contact URL', async () => {
  const image = PNG.sync.read(await readFile(new URL('../../dist/qr/contacto.png', import.meta.url)));
  const result = jsQR(new Uint8ClampedArray(image.data), image.width, image.height);
  assert.equal(result?.data, 'https://joanaps.dev/contacto');
});

test('Wallet icon variants are generated as valid non-empty PNG images', async () => {
  for (const path of ['icon.png', 'icon@2x.png', 'icon@3x.png']) {
    const icon = PNG.sync.read(await readFile(new URL(`../../dist/wallet-assets/${path}`, import.meta.url)));
    assert.equal(icon.width, icon.height);
    assert.ok(icon.width > 0);
  }
});
