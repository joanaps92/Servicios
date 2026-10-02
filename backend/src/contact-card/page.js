import { profile as p } from './profile.js';
const html = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderContactCard({ email, walletAvailable = false, badgeAvailable = false }) {
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.name} | ${p.role}</title>
<meta name="description" content="Desarrollo web con Joan Albert Pérez Soler. Consulta mis servicios, contacta conmigo o guarda mi tarjeta de contacto.">
<link rel="canonical" href="${p.contact}">
<meta property="og:type" content="profile"><meta property="og:title" content="${p.name} | ${p.role}">
<meta property="og:description" content="Mis servicios y mis datos de contacto, siempre a mano."><meta property="og:url" content="${p.contact}">
<meta name="theme-color" content="#172039">
<link rel="icon" href="/wallet-assets/icon.png"><link rel="stylesheet" href="/contacto/card.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: p.name, jobTitle: p.role, url: p.contact, telephone: p.phone }).replace(/</g, '\\u003c')}</script>
</head><body>
<header><a class="brand" href="${p.website}"><span class="mark" aria-hidden="true">J</span>Joan APS</a><a class="header-link" href="${p.services}">Mis servicios <span aria-hidden="true">↗</span></a></header>
<main><article class="card" aria-labelledby="name">
<div class="identity"><p class="eyebrow">DESARROLLO WEB · MALLORCA</p><span class="avatar" aria-hidden="true">J<span>.</span></span>
<h1 id="name">${p.givenName}<br>${p.familyName}</h1><p class="role">${p.role}</p>
<p class="intro">Soluciones digitales sencillas.<br>Hablemos de tu próximo proyecto.</p></div>
<div class="details"><p class="eyebrow">ESTAMOS EN CONTACTO</p>
<a class="action primary" href="${p.services}">Ver servicios <span aria-hidden="true">↗</span></a>
<div class="action-grid"><a class="action" href="tel:${p.phone}">Llamar</a><a class="action" href="https://wa.me/${p.phone.slice(1)}">WhatsApp</a></div>
<a class="action save" href="/contacto/joan-albert-perez-soler.vcf" download="joan-albert-perez-soler.vcf">Guardar contacto <span aria-hidden="true">↓</span></a>
<a class="email" href="mailto:${html(email)}">${html(email)}</a>
${walletAvailable ? `<div class="wallet"><a class="wallet-link" href="/wallet/joan.pkpass">${badgeAvailable ? '<img src="/contacto/apple-wallet-badge.svg" height="44" alt="Añadir a Apple Wallet">' : 'Añadir a Apple Wallet'}</a><p>Abre esta tarjeta en tu iPhone para añadirla a Apple Wallet.</p></div>` : ''}
<figure><img src="/qr/contacto.svg" width="148" height="148" alt="Código QR para abrir joanaps.dev/contacto"><figcaption><strong>Mi contacto, a mano.</strong><br>Escanea para abrir esta tarjeta.<br><a href="/qr/contacto.png" download="joanaps-contacto-qr.png">Descargar QR</a></figcaption></figure>
</div></article></main>
<footer><a href="${p.website}">${p.brand}</a> <span>Desarrollo web con trato cercano.</span>${walletAvailable ? '<small>Apple and iPhone are trademarks of Apple Inc., registered in the U.S. and other countries.</small>' : ''}</footer>
</body></html>`;
}
