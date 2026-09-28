export const EMAIL_REGEX = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const limits = { name: 100, email: 254, phone: 30, projectType: 50, budget: 50, message: 5000, website: 200 };
const projectTypes = ['', 'Página web', 'Automatización', 'Herramienta web', 'Otro'];
const budgets = ['', 'Menos de 200 €', '200–400 €', '400–700 €', 'Más de 700 €', 'No lo sé todavía'];

export function validateContact(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const fields = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = body[key] ?? '';
    if (typeof value !== 'string' || value.length > limit) return null;
    if (key !== 'message' && /[\x00-\x1f\x7f]/.test(value)) return null;
    if (key === 'message' && /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return null;
    fields[key] = value.trim();
  }
  if (!fields.name || !fields.message || !EMAIL_REGEX.test(fields.email)) return null;
  if (!projectTypes.includes(fields.projectType) || !budgets.includes(fields.budget)) return null;
  return fields;
}

export function createContactController(sendEmail, logger = console) {
  return async (req, res) => {
    if (typeof req.body?.website === 'string' && req.body.website.trim()) {
      return res.json({ success: true, message: 'Mensaje enviado correctamente' });
    }
    const fields = validateContact(req.body);
    if (!fields) return res.status(400).json({ success: false, message: 'Revisa los campos del formulario.' });
    try {
      await sendEmail(fields);
      return res.json({ success: true, message: 'Mensaje enviado correctamente' });
    } catch {
      // Do not log provider errors, request bodies, addresses or credentials.
      logger.error('contact_email_failed');
      return res.status(500).json({ success: false, message: 'No se ha podido enviar el mensaje' });
    }
  };
}
