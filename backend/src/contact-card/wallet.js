import { readFile } from 'node:fs/promises';
import { X509Certificate, createPrivateKey } from 'node:crypto';
import { PKPass } from 'passkit-generator';
import { profile as p } from './profile.js';

export const walletVariables = ['APPLE_PASS_TYPE_IDENTIFIER', 'APPLE_TEAM_IDENTIFIER', 'APPLE_WALLET_CERT_PATH', 'APPLE_WALLET_KEY_PATH', 'APPLE_WALLET_WWDR_PATH'];

export function passTemplate(env, email) {
  return {
    formatVersion: 1, passTypeIdentifier: env.APPLE_PASS_TYPE_IDENTIFIER,
    teamIdentifier: env.APPLE_TEAM_IDENTIFIER, serialNumber: env.APPLE_WALLET_SERIAL_NUMBER || 'joan-contact-v1',
    organizationName: p.brand, description: `Tarjeta de contacto de ${p.name}`, logoText: p.brand,
    foregroundColor: 'rgb(255, 255, 255)', backgroundColor: 'rgb(23, 32, 57)', labelColor: 'rgb(200, 248, 74)',
    generic: {
      primaryFields: [{ key: 'name', label: 'CONTACTO', value: p.name }],
      secondaryFields: [{ key: 'role', label: 'PROFESIÓN', value: p.role }],
      auxiliaryFields: [{ key: 'phone', label: 'TELÉFONO', value: p.displayPhone }],
      backFields: [{ key: 'web', label: 'Web', value: p.website }, { key: 'services', label: 'Servicios', value: p.services },
        { key: 'email', label: 'Email', value: email }, { key: 'contact', label: 'Contacto actualizado', value: p.contact }],
    },
    barcodes: [{ format: 'PKBarcodeFormatQR', message: p.contact, messageEncoding: 'iso-8859-1', altText: 'joanaps.dev/contacto' }],
  };
}

export async function buildWalletPass(env, email) {
  const missing = walletVariables.filter(name => !env[name]);
  if (missing.length) throw new Error(`Faltan variables: ${missing.join(', ')}`);
  const [signerCert, signerKey, wwdr] = await Promise.all([
    readFile(env.APPLE_WALLET_CERT_PATH), readFile(env.APPLE_WALLET_KEY_PATH), readFile(env.APPLE_WALLET_WWDR_PATH),
  ]);
  const cert = new X509Certificate(signerCert), intermediate = new X509Certificate(wwdr);
  for (const c of [cert, intermediate]) {
    if (Date.now() < Date.parse(c.validFrom) || Date.now() >= Date.parse(c.validTo)) throw new Error('Certificado fuera de vigencia');
  }
  const subject = Object.fromEntries(cert.subject.split('\n').map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
  if (subject.UID !== env.APPLE_PASS_TYPE_IDENTIFIER || subject.OU !== env.APPLE_TEAM_IDENTIFIER) throw new Error('Identificadores del certificado no coinciden');
  if (!cert.checkIssued(intermediate) || !cert.verify(intermediate.publicKey)) throw new Error('WWDR no corresponde al emisor del certificado');
  const key = createPrivateKey({ key: signerKey, passphrase: env.APPLE_WALLET_KEY_PASSWORD || undefined });
  if (!cert.checkPrivateKey(key)) throw new Error('Clave privada no corresponde al certificado');
  const buffers = { 'pass.json': Buffer.from(JSON.stringify(passTemplate(env, email))) };
  for (const suffix of ['', '@2x', '@3x']) buffers[`icon${suffix}.png`] = await readFile(new URL(`../../../dist/wallet-assets/icon${suffix}.png`, import.meta.url));
  const pass = new PKPass(buffers, { signerCert, signerKey, wwdr, signerKeyPassphrase: env.APPLE_WALLET_KEY_PASSWORD || undefined });
  return { buffer: pass.getAsBuffer(), expiresAt: Math.min(Date.parse(cert.validTo), Date.parse(intermediate.validTo)) };
}

export async function prepareWallet(env, email, logger = console) {
  const missing = walletVariables.filter(name => !env[name]);
  if (missing.length) {
    logger.warn(`wallet_not_configured: ${missing.join(', ')}`);
    return null;
  }
  try {
    const result = await buildWalletPass(env, email);
    // Official artwork is supplied by the account owner after accepting Apple's license.
    if (env.APPLE_WALLET_BADGE_PATH) result.badge = await readFile(env.APPLE_WALLET_BADGE_PATH);
    return result;
  } catch {
    // Do not log library errors, certificate paths, keys or passphrases.
    logger.error('wallet_setup_failed: comprueba certificados PEM, vigencia, clave, identificadores, WWDR y badge');
    return null;
  }
}
