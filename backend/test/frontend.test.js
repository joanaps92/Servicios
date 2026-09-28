import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const script = readFileSync(new URL('../../dist/script.js', import.meta.url), 'utf8');
function mount(fetch) {
  const listeners = {};
  const button = { disabled: false };
  const status = {};
  let resets = 0;
  const form = {
    dataset: {},
    elements: Object.fromEntries(Object.entries({ name: ' Cliente ', email: ' cliente@example.com ', phone: '', message: ' Hola ', website: 'bot', projectType: '', budget: '' }).map(([key, value]) => [key, { value }])),
    addEventListener: (name, fn) => { listeners[name] = fn; },
    setAttribute() {},
    querySelector: () => button,
    checkValidity: () => true,
    reset: () => { resets++; },
  };
  vm.runInNewContext(script, {
    document: { querySelector: selector => ({ '#contact-form': form, '#form-status': status })[selector], querySelectorAll: () => [] },
    window: { dispatchEvent() {} },
    CustomEvent: class {},
    FormData: class { entries() { return Object.entries(form.elements).map(([key, item]) => [key, item.value]); } },
    fetch,
  });
  return { form, button, status, resets: () => resets, submit: () => listeners.submit({ preventDefault() {} }) };
}
test('WhatsApp button opens a chat with the configured Spanish phone number', () => {
  const listeners = {};
  const link = { href: '', addEventListener: (name, handler) => { listeners[name] = handler; } };
  vm.runInNewContext(script, {
    document: { querySelector: () => null, querySelectorAll: selector => selector === '.whatsapp-link' ? [link] : [] },
    window: { SERVICES_CONFIG: { whatsappPhone: '655867055' }, dispatchEvent() {} },
    CustomEvent: class {},
  });
  const url = new URL(link.href);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/34655867055');
  assert.match(url.searchParams.get('text'), /joanaps\.dev/);
  listeners.click();
});
test('frontend prevents duplicate sends, forwards honeypot and clears only on confirmed success', async () => {
  let resolve;
  let calls = 0;
  let payload;
  const ui = mount((_url, options) => { calls++; payload = JSON.parse(options.body); return new Promise(done => { resolve = done; }); });
  assert.equal(ui.form.dataset.state, 'idle');
  const pending = ui.submit();
  assert.equal(ui.form.dataset.state, 'sending');
  assert.equal(ui.button.disabled, true);
  await ui.submit();
  assert.equal(calls, 1);
  assert.equal(payload.website, 'bot');
  assert.equal(payload.name, 'Cliente');
  resolve({ ok: true, status: 200, json: async () => ({ success: true }) });
  await pending;
  assert.equal(ui.form.dataset.state, 'success');
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.resets(), 1);
});
for (const [label, response] of Object.entries({
  rateLimit: { ok: false, status: 429 },
  providerFailure: { ok: false, status: 500, json: async () => ({ success: false }) },
  falseSuccess: { ok: true, status: 200, json: async () => ({ success: false }) },
  invalidJson: { ok: true, status: 200, json: async () => { throw new Error('html fallback'); } },
})) test(`frontend preserves inputs on ${label}`, async () => {
  const ui = mount(async () => response);
  await ui.submit();
  assert.equal(ui.form.dataset.state, 'error');
  assert.equal(ui.resets(), 0);
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.form.elements.message.value, 'Hola');
  if (label === 'rateLimit') assert.match(ui.status.textContent, /15 minutos/);
});
