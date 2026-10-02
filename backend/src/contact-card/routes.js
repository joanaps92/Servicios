import { Router } from 'express';
import { createVcard, validContactEmail } from './profile.js';
import { renderContactCard } from './page.js';

export function contactCardRoutes({ email, wallet }) {
  const router = Router();
  const ready = () => Boolean(wallet?.buffer && wallet.expiresAt > Date.now());
  router.get(['/contacto', '/contacto/'], (_req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!validContactEmail(email)) return res.status(503).type('text').send('La tarjeta de contacto no está disponible temporalmente.');
    const badgeAvailable = Boolean(wallet?.badge);
    res.type('html').send(renderContactCard({ email, walletAvailable: ready() && badgeAvailable, badgeAvailable }));
  });
  router.get('/contacto/joan-albert-perez-soler.vcf', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!validContactEmail(email)) return res.status(503).type('text').send('El contacto no está disponible temporalmente.');
    res.set({ 'Content-Type': 'text/vcard; charset=utf-8', 'Content-Disposition': 'attachment; filename="joan-albert-perez-soler.vcf"' }).send(createVcard(email));
  });
  router.get('/wallet/joan.pkpass', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!ready()) return res.status(503).type('text').send('Apple Wallet no está disponible temporalmente. Puedes guardar el contacto desde /contacto.');
    res.set({ 'Content-Type': 'application/vnd.apple.pkpass', 'Content-Disposition': 'attachment; filename="joan.pkpass"' }).send(wallet.buffer);
  });
  router.get('/contacto/apple-wallet-badge.svg', (_req, res) => {
    if (!wallet?.badge) return res.sendStatus(404);
    res.type('svg').send(wallet.badge);
  });
  return router;
}
