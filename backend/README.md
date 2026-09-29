# Formulario de contacto con Resend

El repositorio utiliza HTML y JavaScript estáticos. El backend Express sirve
`dist` y recibe `POST /api/contact` o `POST /servicios/api/contact`, según si
Coolify publica la aplicación en la raíz o bajo el prefijo `/servicios`.
No se introduce Angular.
La página de servicios tiene como URL canónica `/servicios`, que responde 200.
`/servicios/` redirige permanentemente a `/servicios`, conservando la query.
La raíz local `/` sigue sirviendo el mismo HTML mientras se confirma quién
controla la raíz pública; no se incluye como URL canónica en el sitemap.

## Desarrollo

Requiere Node.js 22 o posterior.

```sh
npm ci
cp .env.example .env
# Completar RESEND_API_KEY y CONTACT_EMAIL únicamente en el entorno local.
npm run dev
```

Abrir `http://localhost:3000/servicios`. El puerto 8000 usado para las vistas
estáticas no ejecuta la API. El servidor exige las dos variables de correo para
arrancar; no muestra sus valores en logs. `npm start` consume el entorno del
proceso y no carga archivos .env.

```sh
npm run check
npm test
```

Las pruebas usan un transporte simulado y no envían correos ni necesitan claves.
Cubren payload de Resend, replyTo, escape, validación, errores resueltos/rechazados
del SDK, honeypot, límite por IP, proxy y rutas estáticas.

## Revisión SEO local — 29-09-2026

Revisión inicial: rama `codex/publish-catalina`, commit
`1614be8d724324b8c3184417f40e748f0ecf0bda`, árbol limpio antes de editar.
El Dockerfile configura Express, pero no declara las reglas del proxy público.
El workflow de Pages publica `dist` como sitio estático; no ejecuta las
redirecciones de Express. Las instrucciones de Coolify admiten varios montajes
y no demuestran que este contenedor controle `https://joanaps.dev/`.

Política aplicada: `/servicios` es la canonical de Servicios; el sitemap solo
enumera las 16 páginas canónicas existentes. Se ha eliminado la raíz duplicada
del sitemap, sin cambiar su respuesta HTTP. Los recursos y el enlace a proyectos
de Servicios usan el prefijo absoluto `/servicios/` para funcionar sin barra final.
Los proyectos conservan sus rutas canónicas con barra final.

`npm run check` y `npm test` pasan (31 pruebas). La prueba SEO inicia Express en
loopback con puerto efímero y transporte de correo simulado, sin credenciales.
Comprueba todos los destinos del sitemap contra sus archivos y respuestas HTTP,
host HTTPS, duplicados, canonical, título, descripción, directivas de indexación,
enlaces rastreables desde Servicios, recursos, robots y sitemap en la raíz,
redirección de barra final en un salto y respuestas 404 con noindex.
La validación XML admite el formato mínimo actual `urlset > url > loc`; si se
añaden extensiones al sitemap habrá que ampliar esa validación.

Pendiente antes de dar por cerrado P0/P1 del plan: confirmar el propietario de
la raíz pública y elegir una de estas opciones:

- Si la portada es Servicios y este contenedor controla `/`, añadir una
  redirección permanente `/` → `/servicios`; conservar las 16 URL del sitemap.
- Si `/` debe ser una portada distinta, crear contenido propio y canonical `/`
  en la aplicación que controle esa ruta; incluirla solo cuando sea indexable.

La configuración pública también debe confirmar que `/servicios` (sin barra),
`/robots.txt` y `/sitemap.xml` llegan al destino correcto. No se ha consultado ni
modificado producción, DNS, Coolify, Resend o Search Console; no se ha hecho push.
En Search Console quedan pendientes el estado/lectura del sitemap y la inspección
de Servicios y Proyectos, distinguiendo versión indexada de prueba publicada y
revisando la canonical elegida por Google y los motivos concretos de exclusión.

El 503 del formulario y health es un diagnóstico documentado del 28-09-2026,
no una comprobación actual. Health y el contacto simulado pasan en local; eso
no confirma disponibilidad ni entrega de correo en producción. Su revisión
remota queda para la tarea de despliegue.

La política sigue la [guía de canonicalización de Google](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=es):
el sitemap y el HTML deben señalar la misma URL preferida; esto no garantiza
que Google indexe las páginas.

## Coolify

1. Seleccionar este repositorio y la revisión que incluya el backend.
2. Usar el build pack Dockerfile, contexto `/`, Dockerfile `/Dockerfile`.
3. Configurar el puerto interno `3000` y health check `/health`.
4. Mantener `RESEND_API_KEY` y `CONTACT_EMAIL` como variables de ejecución,
   nunca como argumentos de build ni variables del frontend.
5. Configurar `TRUST_PROXY` con las IPs o rangos CIDR de los proxies que realmente
   conectan con el contenedor, separados por comas. En local se deja vacío.
   No usar `true`, ni confiar indiscriminadamente en cabeceras del visitante.
   El proxy debe reemplazar o normalizar X-Forwarded-For y el puerto del
   contenedor no debe quedar expuesto directamente a Internet.
6. Enrutar `/api/contact`, `/health` y `/servicios/` hacia este contenedor en
   `joanaps.dev`. Si la aplicación está publicada con el dominio
   `https://joanaps.dev/servicios`, el formulario usa automáticamente
   `/servicios/api/contact` y el backend acepta ambas formas.
7. Redesplegar y comprobar `/health`, logs y el formulario público.

GitHub Pages continúa publicando solo `dist`: no puede ejecutar este backend.
Subir los archivos a GitHub no activa por sí solo la integración de Coolify.
No se han modificado credenciales ni configuración remota de Coolify.

Diagnóstico del 28-09-2026: la página pública `/servicios` responde 200, mientras
`/api/contact` y `/health` responden 503. Ese resultado indica que el upstream del
backend no está disponible o que esas rutas no apuntan al contenedor. La entrega
de correo no puede funcionar hasta que el contenedor arranque en Coolify con sus
variables y el proxy dirija `/api/contact` y `/health` a él. La web estática en
GitHub Pages tampoco puede servir `/api/contact`.

El remitente fijo es `JoanAPS Servicios <contacto@mail.joanaps.dev>` y requiere
ese dominio verificado en Resend. El destinatario sale de `CONTACT_EMAIL`;
la dirección del visitante se utiliza exclusivamente como `replyTo`.

El límite es de cinco solicitudes por IP cada quince minutos, incluyendo las
inválidas. El almacén reside en memoria: usar una sola réplica en esta fase;
se reinicia al reiniciar el proceso. Para escalar será necesario un almacén
compartido. No hay base de datos, cola ni correo automático al visitante.

## Comprobación después del despliegue

Enviar una solicitud controlada desde `/servicios/`, verificar su recepción en
CONTACT_EMAIL y comprobar que Responder apunta al visitante. Revisar también
el error 429 y que usuarios con IPs diferentes no compartan accidentalmente
la cuota. La prueba real queda pendiente hasta desplegar en el entorno con
las variables y el dominio verificado; las pruebas locales no certifican entrega.

Documentación de referencia: [SDK oficial de Resend](https://github.com/resend/resend-node)
y [configuración de proxies para el limitador](https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues).
