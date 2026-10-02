import { createApp } from './app.js';
import { EMAIL_REGEX } from './controllers/contact.controller.js';
import { createEmailService } from './services/email.service.js';
import { prepareWallet } from './contact-card/wallet.js';

const { RESEND_API_KEY, CONTACT_EMAIL, TRUST_PROXY = '', PORT = '3000' } = process.env;
if (!RESEND_API_KEY || !CONTACT_EMAIL || !EMAIL_REGEX.test(CONTACT_EMAIL) || /[\r\n]/.test(CONTACT_EMAIL)) {
  console.error('Configura RESEND_API_KEY y CONTACT_EMAIL válidos en el entorno del servidor.');
  process.exit(1);
}
if (!/^\d+$/.test(PORT) || Number(PORT) < 1 || Number(PORT) > 65535) throw new Error('PORT no válido');
// Explicit proxy addresses/subnets only; never trust all forwarded headers.
if (/^(true|\d+)$/i.test(TRUST_PROXY)) throw new Error('TRUST_PROXY debe contener IPs o rangos CIDR de proxies de confianza');
const app = createApp({
  contactEmail: CONTACT_EMAIL,
  wallet: await prepareWallet(process.env, CONTACT_EMAIL),
  sendEmail: createEmailService({ apiKey: RESEND_API_KEY, contactEmail: CONTACT_EMAIL }),
  trustProxy: TRUST_PROXY ? TRUST_PROXY.split(',').map(value => value.trim()) : false,
});
const server = app.listen(Number(PORT), '0.0.0.0', () => console.info(`Servicios escuchando en el puerto ${PORT}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
});
