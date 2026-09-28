import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createEmailService } from '../src/services/email.service.js';

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
