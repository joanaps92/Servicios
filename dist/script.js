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

  let contactState = 'idle';
  const setContactState = (state, message = '') => {
    contactState = state;
    form.dataset.state = state;
    form.setAttribute('aria-busy', String(state === 'sending'));
    form.querySelector('button[type="submit"]').disabled = state === 'sending';
    status.textContent = message;
    status.className = `form-status ${state === 'success' || state === 'error' ? state : ''}`;
  };
  form?.addEventListener('focusin', () => trackEvent('contact_form_start'), { once: true });
  if (form) setContactState('idle');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (contactState === 'sending') return;
    for (const field of ['name', 'email', 'phone', 'message']) {
      form.elements[field].value = form.elements[field].value.trim();
    }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    setContactState('sending', 'Enviando solicitud...');
    trackEvent('contact_form_submit');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone || '', projectType: data.projectType, budget: data.budget || '', message: data.message, website: data.website || '' }) });
      if (response.status === 429) throw new Error('rate_limited');
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('contact_request_failed');
      form.reset();
      setContactState('success', 'Gracias. Tu mensaje se ha enviado correctamente. Contactaré contigo lo antes posible.');
      trackEvent('contact_form_success');
    } catch (error) {
      const limited = error.message === 'rate_limited';
      setContactState('error', limited ? 'Has enviado demasiadas solicitudes. Inténtalo dentro de 15 minutos.' : 'No se ha podido enviar el mensaje. Tus datos se conservan para que puedas intentarlo de nuevo.');
      trackEvent('contact_form_error', { reason: limited ? 'rate_limited' : 'contact_request_failed' });
    }
  });

  trackEvent('services_view');
})();
