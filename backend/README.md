# Formulario de contacto con Resend

El repositorio utiliza HTML y JavaScript estáticos. El backend Express sirve
`dist` y recibe `POST /api/contact` o `POST /servicios/api/contact`, según si
Coolify publica la aplicación en la raíz o bajo el prefijo `/servicios`.
No se introduce Angular.
Las páginas están disponibles tanto en `/` como en `/servicios/`.

## Desarrollo

Requiere Node.js 22 o posterior.

```sh
npm ci
cp .env.example .env
# Completar RESEND_API_KEY y CONTACT_EMAIL únicamente en el entorno local.
npm run dev
```

Abrir `http://localhost:3000/servicios/`. El puerto 8000 usado para las vistas
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
