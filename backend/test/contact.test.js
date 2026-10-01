import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createEmailService } from '../src/services/email.service.js';
import { createVcard } from '../src/contact-card/profile.js';
import { passTemplate } from '../src/contact-card/wallet.js';

const valid = { name: 'Cliente', email: 'cliente@example.com', message: 'Necesito una web', projectType: 'Página web', budget: '200–400 €' };
async function fixture(t, sendEmail = async () => {}, options = {}) {
  const server = createApp({ sendEmail, ...options }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, post: (body, headers = {}) => fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }) };
}
test('valid request passes trimmed data and optional fields to email service', async t => {
  let received;
  const { post } = await fixture(t, async fields => { received = fields; });
  const response = await post({ ...valid, name: ' Cliente ' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(received.name, 'Cliente');
  assert.equal(received.phone, '');
});
test('honeypot succeeds without sending mail', async t => {
  let calls = 0;
  const { post } = await fixture(t, async () => calls++);
  assert.equal((await post({ website: 'https://spam.example' })).status, 200);
  assert.equal(calls, 0);
});
for (const [label, change] of Object.entries({
  'missing name': { name: '' }, 'missing email': { email: '' }, 'missing message': { message: '' },
  'whitespace': { name: '  ' }, 'email format': { email: 'invalid' },
  'name length': { name: 'a'.repeat(101) }, 'email length': { email: 'a'.repeat(250) + '@example.com' },
  'phone length': { phone: '1'.repeat(31) }, 'message length': { message: 'a'.repeat(5001) },
  'project option': { projectType: 'arbitrary' }, 'budget option': { budget: 'arbitrary' },
  'object field': { name: {} }, 'array field': { email: ['a@example.com'] },
  'header injection': { name: 'Alice\r\nBcc: attacker@example.com' },
})) test(`rejects ${label}`, async t => {
  const { post } = await fixture(t, async () => assert.fail('must not send'));
  assert.equal((await post({ ...valid, ...change })).status, 400);
});
test('rejects malformed and oversized JSON, non-JSON and arrays', async t => {
  const { base, post } = await fixture(t);
  assert.equal((await post([])).status, 400);
  assert.equal((await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await post({ message: 'x'.repeat(34000) })).status, 413);
  assert.equal((await fetch(`${base}/api/contact`, { method: 'POST', body: 'name=Bob' })).status, 415);
});
test('sixth request is rate limited and has retry header', async t => {
  const { post } = await fixture(t);
  for (let i = 0; i < 5; i++) assert.equal((await post(valid)).status, 200);
  const response = await post(valid);
  assert.equal(response.status, 429);
  assert.ok(response.headers.get('retry-after'));
  assert.equal((await response.json()).success, false);
});
test('trusted proxy isolates client quotas', async t => {
  const { post } = await fixture(t, async () => {}, { trustProxy: ['loopback'] });
  for (let i = 0; i < 5; i++) await post(valid, { 'X-Forwarded-For': '203.0.113.10' });
  assert.equal((await post(valid, { 'X-Forwarded-For': '203.0.113.10' })).status, 429);
  assert.equal((await post(valid, { 'X-Forwarded-For': '203.0.113.11' })).status, 200);
});
test('provider exception yields generic response and safe log', async t => {
  const logs = [];
  const { post } = await fixture(t, async () => { throw new Error('secret private customer data'); }, { logger: { error: value => logs.push(value) } });
  const response = await post(valid);
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /secret|private/);
  assert.deepEqual(logs, ['contact_email_failed']);
});
test('SDK payload has verified sender, replyTo, escaped HTML and plain text', async () => {
  let payload;
  const send = createEmailService({ contactEmail: 'owner@example.com', client: { emails: { send: async body => { payload = body; return { data: { id: 'test' }, error: null }; } } } });
  await send({ ...valid, name: '<b>Alice & Bob</b>', message: '<script>alert("x")</script>\nLine 2' });
  assert.equal(payload.from, 'JoanAPS Servicios <contacto@mail.joanaps.dev>');
  assert.equal(payload.to, 'owner@example.com');
  assert.equal(payload.replyTo, valid.email);
  assert.doesNotMatch(payload.html, /<script>|<b>/);
  assert.match(payload.html, /&lt;script&gt;/);
  assert.match(payload.html, /<br>Line 2/);
  assert.match(payload.text, /Line 2/);
});
test('resolved SDK errors and empty confirmations are treated as failures', async () => {
  for (const result of [{ data: null, error: { message: 'denied' } }, { data: null, error: null }]) {
    const send = createEmailService({ contactEmail: 'owner@example.com', client: { emails: { send: async () => result } } });
    await assert.rejects(send(valid), /email_delivery_failed/);
  }
});
test('serves site, deep project routes, health and API 404', async t => {
  const { base } = await fixture(t);
  for (const path of ['/health', '/servicios/', '/servicios/proyectos/catalina/proyectos/imago/']) assert.equal((await fetch(base + path)).status, 200);
  assert.equal((await fetch(base + '/api/unknown')).status, 404);
  assert.equal((await fetch(base + '/.env')).status, 404);
});

test('contact page, vCard, wallet error state and QR are served with the expected data', async t => {
  const { base } = await fixture(t, async () => {}, { contactEmail: 'joan@example.com' });
  const page = await fetch(`${base}/contacto`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  const html = await page.text();
  for (const text of ['Joan Albert Pérez Soler', 'tel:+34655867055', 'https://wa.me/34655867055', 'joan@example.com', '/qr/contacto.svg']) assert.ok(html.includes(text), text);
  assert.ok(!html.includes('Añadir a Apple Wallet'));
  const card = await fetch(`${base}/contacto/joan-albert-perez-soler.vcf`);
  assert.equal(card.status, 200);
  assert.match(card.headers.get('content-type'), /text\/vcard/);
  assert.match(await card.text(), /FN:Joan Albert Pérez Soler[\r\n]+ORG:joanaps\.dev/);
  assert.equal((await fetch(`${base}/wallet/joan.pkpass`)).status, 503);
  assert.match((await fetch(`${base}/qr/contacto.svg`)).headers.get('content-type'), /image\/svg\+xml/);
});

test('vCard safely escapes address fields and folds UTF-8 lines to 75 octets', () => {
  const card = createVcard('joan@example.com');
  assert.ok(card.endsWith('\r\n'));
  for (const line of card.slice(0, -2).split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `${Buffer.byteLength(line)} octets`);
  assert.match(card, /EMAIL;TYPE=INTERNET:joan@example\.com/);
  assert.throws(() => createVcard('bad\r\nBCC:other@example.com'));
});

test('Apple pass metadata uses the canonical QR and profile fields', () => {
  const data = passTemplate({ APPLE_PASS_TYPE_IDENTIFIER: 'pass.dev.joanaps.contact', APPLE_TEAM_IDENTIFIER: 'TEAM123' }, 'joan@example.com');
  assert.equal(data.passTypeIdentifier, 'pass.dev.joanaps.contact');
  assert.equal(data.teamIdentifier, 'TEAM123');
  assert.equal(data.barcodes[0].message, 'https://joanaps.dev/contacto');
  assert.equal(data.generic.primaryFields[0].value, 'Joan Albert Pérez Soler');
  assert.equal(data.generic.backFields.find(field => field.key === 'email').value, 'joan@example.com');
});
