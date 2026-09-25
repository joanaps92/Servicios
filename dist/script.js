(() => {
  const config = window.SERVICES_CONFIG || {};
  const navToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const whatsappText = 'Hola, he visto tus servicios en joanaps.dev y me gustaría comentarte un proyecto.';

  const trackEvent = (eventName, properties = {}) => {
    window.dispatchEvent(new CustomEvent('services:analytics', { detail: { eventName, properties } }));
    if (window.dataLayer) window.dataLayer.push({ event: eventName, ...properties });
  };

  const whatsappHref = () => {
    const phone = String(config.whatsappPhone || '').replace(/[^\d]/g, '');
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}` : '#contacto';
  };

  document.querySelectorAll('.whatsapp-link').forEach((link) => {
    link.href = whatsappHref();
    link.addEventListener('click', () => {
      trackEvent('whatsapp_click');
      if (!config.whatsappPhone) {
        status.textContent = 'Puedes escribirme desde el formulario mientras se configura WhatsApp.';
        status.className = 'form-status';
      }
    });
  });

  navToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  document.querySelectorAll('[data-service]').forEach((link) => link.addEventListener('click', () => {
    const eventName = link.dataset.service === 'herramienta' ? 'service_tool_click' : `service_${link.dataset.service}_click`;
    trackEvent(eventName);
    const select = form?.elements.projectType;
    if (select) select.value = link.dataset.service === 'web' ? 'Página web' : link.dataset.service === 'automatizacion' ? 'Automatización' : 'Herramienta web';
  }));

  form?.addEventListener('focusin', () => trackEvent('contact_form_start'), { once: true });
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) return;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = 'Enviando solicitud...';
    status.className = 'form-status';
    trackEvent('contact_form_submit');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone || '', projectType: data.projectType, budget: data.budget || '', message: data.message }) });
      if (!response.ok) throw new Error('contact_request_failed');
      form.reset();
      status.textContent = 'Gracias. He recibido tu mensaje y contactaré contigo lo antes posible.';
      status.className = 'form-status success';
      trackEvent('contact_form_success');
    } catch (error) {
      status.textContent = 'No se ha podido enviar el mensaje. Inténtalo de nuevo o contacta por WhatsApp.';
      status.className = 'form-status error';
      trackEvent('contact_form_error', { reason: error.message });
    } finally { submit.disabled = false; }
  });

  trackEvent('services_view');
})();
