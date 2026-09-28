"""Build the Catalina portfolio with Python 3 standard library only."""
import json
from pathlib import Path
from html import escape as e
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/proyectos/catalina'
DATA = ROOT / 'content/catalina'
projects = json.loads((DATA / 'projects.json').read_text(encoding='utf-8'))
images = json.loads((DATA / 'images.json').read_text(encoding='utf-8'))
categories = {'producto':'Diseño de producto','grafico':'Diseño gráfico','interiores':'Diseño de interiores','renderizado':'Renderizado'}
BASE = 'https://joanaps.dev/servicios/proyectos/catalina/'

def img(name, alt, prefix='', lazy=True, small=False):
    meta = images[name]
    return f'<img src="{prefix}assets/{name}.webp" srcset="{prefix}assets/{name}-small.webp {round(meta["width"] * min(1,640/max(meta["width"],meta["height"])))}w, {prefix}assets/{name}.webp {meta["width"]}w" sizes="{ "(max-width: 700px) 92vw, 48vw" if small else "(max-width: 700px) 92vw, 90vw"}" width="{meta["width"]}" height="{meta["height"]}" alt="{e(alt)}" {"loading=lazy" if lazy else "fetchpriority=high"} decoding="async">'

def layout(title, description, body, path='', prefix='', dark=False, cover='p4-0', schema=None):
    url = BASE + path
    home = prefix or './'
    return f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)} | Catalina Borrás Soler</title><meta name="description" content="{e(description)}">
<link rel="canonical" href="{url}"><meta property="og:type" content="website"><meta property="og:title" content="{e(title)} | Catalina Borrás Soler"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/{cover}.webp"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="{prefix}portfolio.css"><script src="{prefix}portfolio.js" defer></script>
<script type="application/ld+json">{json.dumps(schema or {"@context":"https://schema.org","@type":"Person","name":"Catalina Borrás Soler","url":BASE},ensure_ascii=False)}</script></head>
<body class="{'dark' if dark else ''}"><a class="skip" href="#contenido">Saltar al contenido</a>
<header class="header"><a class="signature" href="{home}" aria-label="Catalina Borrás Soler, inicio">CATALINA<br>BORRÁS SOLER<span>Diseñadora de producto</span></a><nav aria-label="Principal"><a href="{home}#portfolio">Portfolio</a><a href="{home}#sobre-mi">Sobre mí</a><a href="{home}#contacto">Contacto <span aria-hidden="true">↗</span></a></nav></header>
<main id="contenido">{body}</main>
<footer id="contacto"><p class="label">¿Tienes un proyecto en mente?</p><h2>Hablemos<span aria-hidden="true">↗</span></h2><a class="email" href="mailto:catalina.borras.soler@gmail.com">catalina.borras.soler@gmail.com</a><div class="footer-bottom"><span>Catalina Borrás Soler · Diseño de producto</span><a href="{prefix}../">Proyectos de Joan APS ↗</a><a href="#">Volver arriba ↑</a></div></footer>
<dialog aria-label="Imagen ampliada"><button class="close" type="button" aria-label="Cerrar imagen">Cerrar ×</button><img alt=""><p></p></dialog></body></html>'''

cards = ''
for n,p in enumerate(projects):
    name, alt = p['images'][0]
    cards += f'<article class="project" data-category="{p["category"]}"><a href="proyectos/{p["slug"]}/"><div class="cover">{img(name,alt,small=True)}</div><div class="card-caption"><h3>{e(p["title"])}</h3><span aria-hidden="true">↗</span></div><p class="meta">{categories[p["category"]]}{ " · " + p["year"] if p.get("year") else ""}</p></a></article>'
filters = '<button type="button" data-filter="all" aria-pressed="true">Todos <sup>13</sup></button>' + ''.join(f'<button type="button" data-filter="{key}" aria-pressed="false">{value}</button>' for key,value in categories.items())
body = f'''<section class="hero"><div class="hero-top"><p class="label">Portfolio seleccionado</p><p class="label">ESDIB · Mallorca</p></div><h1>Ideas que<br>toman <span>forma.</span></h1><div class="hero-bottom"><p>Diseño de producto, exploración de materiales<br>y nuevas maneras de mirar lo cotidiano.</p><a href="#portfolio">Explorar proyectos ↓</a></div><a class="hero-image" href="proyectos/babaria/">{img('p4-0','Babaria: diseño de envase de PET reciclado',lazy=False)}<span>01 / Babaria <span>Ver proyecto ↗</span></span></a></section>
<section id="portfolio" class="portfolio"><div class="section-heading"><h2>Proyectos</h2><span class="label">Una selección de mi trabajo / 13</span></div><div class="filters" aria-label="Filtrar proyectos" hidden>{filters}</div><p class="sr-only" id="filter-status" aria-live="polite"></p><div class="grid">{cards}</div></section>
<section id="sobre-mi" class="about"><div><p class="label">Sobre mí</p><h2>Hola,<br>soy Catalina.</h2></div><div class="bio"><p>Estoy formándome como diseñadora de producto en la Escuela Superior de Diseño de las Islas Baleares (ESDIB).</p><p>Exploro procesos, materiales y soluciones para dar forma a ideas que buscan mejorar la vida cotidiana, combinando creatividad, funcionalidad y enfoque en el usuario.</p><dl><dt>Formación</dt><dd>Diseño de producto · ESDIB</dd><dt>Herramientas presentes en mis proyectos</dt><dd>Rhinoceros 7 · Fusion 360</dd></dl><figure>{img('p2-0','Fotografía de equipo incluida en la presentación de Catalina')}<figcaption>Diseñar también es compartir el proceso.</figcaption></figure></div></section>'''
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'index.html').write_text(layout('Portfolio de diseño de producto','Proyectos de diseño de producto, diseño gráfico, interiores y renderizado de Catalina Borrás Soler, estudiante en ESDIB.',body),encoding='utf-8')
for i,p in enumerate(projects):
    prefix='../../'
    gallery=''
    for n,(name,alt) in enumerate(p['images']):
        gallery += f'<figure class="gallery-item"><a class="zoom" href="{prefix}assets/{name}.webp" data-lightbox>{img(name,alt,prefix,lazy=n>0)}</a><figcaption><span>{n+1:02d}</span> {e(alt)}</figcaption></figure>'
    prev=projects[(i-1)%len(projects)]; nxt=projects[(i+1)%len(projects)]
    body=f'''<article class="detail"><a class="back" href="../../#portfolio">← Todos los proyectos</a><p class="label">{categories[p['category']]}{ ' / '+p['year'] if p.get('year') else ''}</p><h1>{e(p['title'])}</h1><div class="project-intro"><p>{e(p['description'])}</p><div>{'<p>'+e(p['detail'])+'</p>' if p.get('detail') else ''}{'<p class="label">'+e(p['tools'])+'</p>' if p.get('tools') else ''}</div></div><div class="gallery">{gallery}</div><nav class="project-nav" aria-label="Más proyectos"><a href="../{prev['slug']}/"><span>← Anterior</span>{e(prev['title'])}</a><a href="../{nxt['slug']}/"><span>Siguiente →</span>{e(nxt['title'])}</a></nav></article>'''
    folder=OUT/'proyectos'/p['slug']; folder.mkdir(parents=True,exist_ok=True)
    schema={'@context':'https://schema.org','@type':'CreativeWork','name':p['title'],'description':p['description'],'creator':{'@type':'Person','name':'Catalina Borrás Soler'},'image':BASE+'assets/'+p['images'][0][0]+'.webp'}
    (folder/'index.html').write_text(layout(p['title'],p['description'],body,'proyectos/'+p['slug']+'/',prefix,p.get('dark',False),p['images'][0][0],schema),encoding='utf-8')

# Preserve existing sitemap entries; only add the new static routes.
sitemap=ROOT/'dist/sitemap.xml'
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
tree=ET.parse(sitemap); ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
existing={x.text for x in tree.iter(ns+'loc')}
for url in ['https://joanaps.dev/servicios/proyectos/',BASE]+[BASE+'proyectos/'+p['slug']+'/' for p in projects]:
    if url not in existing: ET.SubElement(ET.SubElement(tree.getroot(),ns+'url'),ns+'loc').text=url
tree.write(sitemap,encoding='utf-8',xml_declaration=True)
print(f'Built portfolio and {len(projects)} project pages.')
