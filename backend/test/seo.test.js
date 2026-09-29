import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

const origin = 'https://joanaps.dev';
const read = path => readFileSync(new URL(`../../dist/${path}`, import.meta.url), 'utf8');
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) =>
  Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(([, key, value]) => [key.toLowerCase(), value])));
const canonical = html => tags(html, 'link').filter(tag => tag.rel === 'canonical').map(tag => tag.href);

test('sitemap contains only existing, canonical, indexable and reachable pages', async t => {
  const xml = read('sitemap.xml');
  // The repository uses the minimal sitemap dialect: urlset > url > loc.
  // Reject unexpected/malformed markup instead of silently skipping entries.
  assert.match(xml, /^<\?xml[^>]+\?>\s*<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">(?:\s*<url>\s*<loc>https:\/\/[^<>&]+<\/loc>\s*<\/url>)+\s*<\/urlset>\s*$/);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.ok(urls.length > 0);
  assert.equal(new Set(urls).size, urls.length, 'duplicate sitemap URLs');
  const server = createApp({ sendEmail: async () => assert.fail('SEO checks must not send email') }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = path => fetch(base + path, { redirect: 'manual' });
  const pages = new Map();
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, origin);
    assert.equal(parsed.search + parsed.hash, '');
    assert.match(parsed.pathname, /^\/servicios(?:\/|$)/);
    assert.doesNotMatch(parsed.pathname, /404/);
    const relative = parsed.pathname.slice('/servicios'.length);
    const html = read(relative === '' ? 'index.html' : `${relative.slice(1)}index.html`);
    assert.deepEqual(canonical(html), [url]);
    assert.match(html, /<title>[^<]+<\/title>/i);
    assert.ok(tags(html, 'meta').some(tag => tag.name === 'description' && tag.content?.trim()));
    for (const tag of tags(html, 'meta').filter(tag => /^(robots|googlebot)$/i.test(tag.name))) {
      assert.doesNotMatch(tag.content ?? '', /noindex|none/i);
    }
    const response = await get(parsed.pathname);
    assert.equal(response.status, 200, url);
    assert.doesNotMatch(response.headers.get('x-robots-tag') ?? '', /noindex|none/i);
    assert.equal(await response.text(), html, url);
    pages.set(url, html);
  }
  const reached = new Set([origin + '/servicios']);
  for (const url of reached) {
    for (const tag of tags(pages.get(url) ?? '', 'a')) {
      if (!tag.href) continue;
      const link = new URL(tag.href, url); link.hash = '';
      if (pages.has(link.href)) reached.add(link.href);
    }
  }
  assert.deepEqual([...reached].sort(), [...pages.keys()].sort(), 'all sitemap pages must be linked from services');
  const robots = await get('/robots.txt');
  assert.equal(robots.status, 200);
  assert.match(robots.headers.get('content-type'), /text\/plain/);
  const rules = await robots.text();
  assert.match(rules, /^Sitemap: https:\/\/joanaps.dev\/sitemap.xml\s*$/m);
  assert.doesNotMatch(rules, /^Disallow:\s*\S+/mi);
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get('content-type'), /xml/);
  assert.equal(await sitemap.text(), xml);
  const root = await get('/');
  assert.equal(root.status, 200); // Root ownership is not established by repository configuration.
  assert.deepEqual(canonical(await root.text()), [origin + '/servicios']);
  const slash = await get('/servicios/?source=test');
  assert.equal(slash.status, 301);
  assert.equal(slash.headers.get('location'), '/servicios?source=test');
  assert.equal((await get(slash.headers.get('location'))).status, 200);
  for (const path of ['/missing-seo-page', '/servicios/missing-seo-page']) {
    const response = await get(path);
    assert.equal(response.status, 404);
    assert.ok(tags(await response.text(), 'meta').some(tag => tag.name === 'robots' && /noindex/.test(tag.content)));
  }
  for (const path of ['/servicios/styles.css', '/servicios/seo-overrides.css', '/servicios/script.js']) {
    assert.equal((await get(path)).status, 200);
  }
  t.diagnostic(`Validated ${urls.length} canonical sitemap URLs with simulated email transport.`);
});
