import { Resend } from 'resend';

export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
})[char]);

export function createEmailService({ apiKey, contactEmail, client }) {
  const resend = client || new Resend(apiKey);
  return async function sendContactEmail(fields) {
    const labels = { name: 'Nombre', email: 'Email', phone: 'Teléfono', projectType: 'Tipo de proyecto', budget: 'Presupuesto', message: 'Mensaje' };
    const html = Object.entries(labels).map(([key, label]) => `<p><strong>${label}:</strong><br>${escapeHtml(fields[key] || 'No indicado').replace(/\n/g, '<br>')}</p>`).join('');
    const { data, error } = await resend.emails.send({
      from: 'JoanAPS Servicios <contacto@mail.joanaps.dev>',
      to: contactEmail,
      replyTo: fields.email,
      subject: `Nuevo contacto desde Servicios - ${fields.name}`,
      html: `<h2>Nueva solicitud desde joanaps.dev/servicios</h2>${html}`,
      text: Object.entries(labels).map(([key, label]) => `${label}: ${fields[key] || 'No indicado'}`).join('\n\n'),
    });
    // The SDK can resolve with an error rather than throw.
    if (error || !data?.id) throw new Error('email_delivery_failed');
  };
}
