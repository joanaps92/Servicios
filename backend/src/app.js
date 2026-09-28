import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { createContactController } from './controllers/contact.controller.js';

export function createApp({ sendEmail, trustProxy = false, logger = console }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Has enviado demasiadas solicitudes. Inténtalo más tarde.' },
  });
  app.post('/api/contact', limiter, (req, res, next) => {
    if (!req.is('application/json')) return res.status(415).json({ success: false, message: 'Formato no admitido' });
    next();
  }, express.json({ limit: '32kb' }), createContactController(sendEmail, logger));
  app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada' }));
  const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
  // Same origin for the site and API; no CORS or public keys required.
  app.use('/servicios', express.static(dist));
  app.use(express.static(dist));
  app.use((_req, res) => res.status(404).sendFile(`${dist}/404.html`));
  app.use((error, _req, res, _next) => {
    const code = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
    if (code === 500) logger.error('contact_server_failed');
    res.status(code).json({ success: false, message: code === 500 ? 'No se ha podido enviar el mensaje' : 'Solicitud no válida' });
  });
  return app;
}
