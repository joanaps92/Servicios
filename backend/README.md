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

## Tarjeta digital y Apple Wallet

El backend también sirve `/contacto`, la vCard en
`/contacto/joan-albert-perez-soler.vcf`, el pase en `/wallet/joan.pkpass` y los
QR en `/qr/contacto.svg` y `/qr/contacto.png`. El QR y el código del pase apuntan
al mismo destino estable: `https://joanaps.dev/contacto`. `CONTACT_EMAIL` es el
único origen del correo para la página, la vCard y el pase.

`npm run build` crea los QR y los iconos PNG del pase dentro de `dist/`; el
Dockerfile ya copia esa carpeta. Tras cambiar el destino o rehacer iconos, vuelve
a ejecutar el build y publica el contenido actualizado.

Para habilitar el pase real:

1. En Apple Developer, confirma una membresía activa del Apple Developer Program
   y crea un Pass Type ID, por ejemplo `pass.dev.joanaps.contact`.
2. Crea el certificado Pass Type ID para el equipo correspondiente y descarga
   el certificado WWDR vigente que indica Apple. Exporta el certificado de pase
   y su clave privada desde Acceso a Llaveros como un `.p12` protegido con
   contraseña. Conserva ambos archivos fuera del repositorio.
3. Convierte el `.p12` a PEM en un entorno de confianza, sin copiar certificados
   ni contraseñas al Git. Por ejemplo, en una terminal con OpenSSL:

   ```sh
   openssl pkcs12 -in wallet.p12 -clcerts -nokeys -out wallet-cert.pem
   openssl pkcs12 -in wallet.p12 -nocerts -out wallet-key.pem
   ```

   El segundo comando conserva la protección de la clave; la contraseña de
   exportación se configura en Coolify como `APPLE_WALLET_KEY_PASSWORD`.
4. En las [guías oficiales del badge de Apple](https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/), descarga el SVG oficial en español y acepta
   su licencia de arte con la cuenta de Developer que lo usará. Sube
   ese archivo a un volumen secreto de Coolify. El servidor muestra el botón
   solo si encuentra certificados válidos y el badge oficial.
5. En Coolify configura estas variables de ejecución: `APPLE_PASS_TYPE_IDENTIFIER`,
   `APPLE_TEAM_IDENTIFIER`, `APPLE_WALLET_CERT_PATH`, `APPLE_WALLET_KEY_PATH`,
   `APPLE_WALLET_WWDR_PATH`, `APPLE_WALLET_KEY_PASSWORD` y
   `APPLE_WALLET_BADGE_PATH`. Para los tres paths usa rutas absolutas de los
   ficheros montados como secretos. `CONTACT_EMAIL` debe contener el correo de
   contacto existente y `APPLE_WALLET_SERIAL_NUMBER` puede quedarse en su valor
   por defecto. No configures certificados en argumentos de build.
6. En el enrutador público del dominio, dirige `/contacto` y
   `/contacto/*`, `/wallet/*`, `/qr/*` y `/wallet-assets/*` hacia el contenedor
   Express, igual que las rutas existentes de la API. Si GitHub Pages recibe
   primero esas peticiones, ajusta el proxy o el enrutamiento del dominio para
   que estas rutas dinámicas lleguen a Coolify. GitHub Pages por sí solo solo
   sirve `dist` y no puede generar la página con el email configurado ni firmar
   un `.pkpass`.
7. Redespliega y comprueba en un iPhone `/contacto`, la descarga del pase y la
   instalación en Wallet. El arranque valida vigencia, Pass Type ID, Team ID,
   certificado WWDR y correspondencia entre certificado y clave. Si falta una
   variable o la validación falla, el servidor oculta el botón y responde 503
   en la descarga; solo registra un mensaje genérico.

No se generan certificados de Apple en el repositorio y la instalación final
del pase depende de la cuenta, certificados y prueba en un dispositivo Apple.
La implementación de la tarjeta y sus descargas sí puede verificarse antes de
disponer de esos secretos.

Documentación de referencia: [SDK oficial de Resend](https://github.com/resend/resend-node)
y [configuración de proxies para el limitador](https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues).
