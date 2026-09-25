# Servicios
Landing page para servicios prestados

# Landing de servicios — joanaps.dev/servicios

## 1. Objetivo

Crear una landing profesional en:

`https://joanaps.dev/servicios`

La página servirá para ofrecer servicios de desarrollo web, automatización y pequeñas herramientas web a:

* pequeños negocios
* autónomos
* asociaciones
* profesionales
* particulares

La prioridad no es transmitir la imagen de una agencia grande.

La web debe transmitir:

* cercanía
* claridad
* solvencia técnica
* soluciones sencillas
* precios comprensibles
* facilidad para contactar

El visitante debe entender en menos de 10 segundos:

1. Qué servicios se ofrecen.
2. Cuánto cuestan aproximadamente.
3. Cómo contactar.

---

# 2. Principios del producto

La propuesta comercial debe girar alrededor de esta idea:

> Resolver problemas reales mediante soluciones digitales sencillas.

Evitar vender tecnología por tecnología.

No comunicar:

* Angular
* Node
* PostgreSQL
* Docker
* APIs
* microservicios
* arquitectura

como argumento comercial principal.

El cliente debe ver primero:

* ahorro de tiempo
* simplificación
* automatización
* presencia online
* reducción de tareas manuales

Los detalles técnicos pueden aparecer posteriormente en portfolio o documentación.

---

# 3. Ruta

La landing debe existir dentro de la web principal:

`joanaps.dev/servicios`

No crear inicialmente:

`servicios.joanaps.dev`

La estructura futura prevista del dominio será:

```text
joanaps.dev
│
├── /
├── /servicios
├── /portfolio
├── /contacto
└── /proyectos
    ├── /control-horas
    ├── /automatizacion
    └── /web-negocio
```

La landing debe diseñarse pensando en esta futura ampliación.

---

# 4. Infraestructura y Cloudflare

## Cloudflare

Cloudflare se utilizará únicamente para:

* gestión DNS
* eventualmente registro del dominio
* DNSSEC si procede

No utilizar Cloudflare Proxy para la web principal.

Configurar los registros como:

```text
Proxy status:
DNS only
```

Nube gris.

El objetivo es que el tráfico HTTP/HTTPS vaya directamente al servidor y evitar depender de IPs compartidas de Cloudflare.

Esto se ha decidido debido a los problemas de bloqueos de IPs compartidas que pueden afectar a sitios legítimos en España durante determinados eventos deportivos.

No utilizar inicialmente:

* Cloudflare Pages
* Cloudflare Workers
* Cloudflare Proxy
* CDN de Cloudflare

para esta landing.

---

# 5. Infraestructura futura

La arquitectura prevista para servicios profesionales será:

```text
Dominio
   ↓
DNS
   ↓
VPS
   ↓
Coolify
   ↓
Aplicaciones
```

Proveedor de VPS preferente:

**Hetzner Cloud**

Arquitectura:

```text
Hetzner VPS
│
├── Coolify
│
├── Web cliente A
├── Web cliente B
├── Aplicación cliente C
├── API cliente C
└── PostgreSQL
```

Tecnologías posibles:

```text
Angular
Node.js
.NET
PostgreSQL
Docker
```

No es necesario implementar ahora ninguna infraestructura adicional si `joanaps.dev` ya se encuentra desplegado.

La landing debe integrarse en la infraestructura actual.

---

# 6. Routing

La ruta `/servicios` debe formar parte del proyecto existente.

Si el frontend utiliza Angular, implementar mediante Angular Router.

Preferiblemente lazy loading.

Ejemplo conceptual:

```typescript
{
  path: 'servicios',
  loadComponent: () =>
    import('./pages/servicios/servicios.component')
      .then(m => m.ServiciosComponent)
}
```

La implementación deberá adaptarse a la arquitectura real del proyecto.

No modificar innecesariamente otras rutas.

---

# 7. SPA fallback

Si la aplicación es SPA, garantizar que acceder directamente a:

`https://joanaps.dev/servicios`

funcione correctamente.

También debe funcionar:

* refrescar la página
* abrir URL desde enlace externo
* pegar la URL directamente en navegador

El servidor debe realizar fallback hacia `index.html`.

Ejemplo conceptual Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Codex deberá comprobar cómo está gestionado actualmente el routing antes de realizar cambios.

---

# 8. Hero

## H1

Soluciones digitales sencillas para negocios y profesionales

## Subtítulo

Creo páginas web, automatizaciones y pequeñas herramientas a medida para ahorrar tiempo y simplificar tareas del día a día.

## CTA principal

Pedir presupuesto

## CTA secundario

Ver servicios

## Texto auxiliar

Presupuestos claros, sin compromiso y adaptados a lo que realmente necesitas.

---

# 9. Introducción

## Título

Tecnología para hacerte la vida más fácil

## Texto

Muchas empresas y profesionales siguen perdiendo tiempo con procesos manuales, hojas de cálculo, correos, WhatsApp o herramientas que no terminan de adaptarse a su forma de trabajar.

Puedo ayudarte a convertir esos procesos en soluciones sencillas y fáciles de utilizar.

No necesitas una aplicación enorme.

A veces basta con una pequeña web, una automatización o una herramienta interna bien hecha.

---

# 10. Servicio 1

## Web para negocio local

### Desde 300 €

Una web sencilla y profesional para mostrar tu negocio y facilitar que tus clientes contacten contigo.

### Incluye

* Diseño responsive
* Adaptación a móvil
* Página principal
* Información sobre servicios
* Horarios
* Ubicación
* Integración de mapa
* Botón de WhatsApp
* Formulario de contacto
* Configuración básica del dominio
* SEO básico
* Una ronda de cambios

### Ideal para

* Comercios
* Restaurantes
* Peluquerías
* Academias
* Talleres
* Profesionales autónomos
* Entrenadores
* Pequeñas empresas
* Asociaciones

### Precio

Desde:

**300 €**

### CTA

Quiero mi web

---

# 11. Servicio 2

## Automatización de tareas

### Desde 150 €

Automatizar tareas repetitivas para evitar perder tiempo copiando datos, preparando informes o enviando correos manualmente.

### Ejemplos

* Automatización de Excel
* Automatización de Google Sheets
* Generación de PDFs
* Envío automático de correos
* Formularios
* Cruce de datos
* Limpieza de información
* Generación automática de informes
* Importación de datos
* Exportación de datos
* Procesamiento de archivos
* Procesos administrativos

### Tarifas orientativas

```text
Automatización sencilla
Desde 150 €

Automatización media
Desde 250 €

Automatización avanzada
Presupuesto personalizado
```

### CTA

Quiero automatizar una tarea

---

# 12. Servicio 3

## Herramientas web a medida

### Desde 450 €

Pequeñas aplicaciones web creadas específicamente para resolver una necesidad concreta de un negocio.

### Ejemplos

* Control de horas
* Gestión de clientes
* Gestión de incidencias
* Inventario
* Reservas internas
* Registro de gastos
* Gestión de tareas
* Paneles administrativos
* Sistemas internos de seguimiento

### Funciones posibles

* Usuarios
* Login
* Roles
* Base de datos
* Panel administrativo
* Gestión de información
* Estadísticas
* Exportación Excel
* Exportación CSV
* Acceso desde móvil
* Acceso desde ordenador

### Precio

Desde:

**450 €**

Proyectos habituales:

**450–700 €**

Proyectos de mayor complejidad:

Presupuesto personalizado.

### CTA

Tengo una idea

---

# 13. Cómo trabajo

Crear una sección visual de cuatro pasos.

## Paso 1

### Me cuentas el problema

Explícame qué necesitas o qué tarea te gustaría simplificar.

No es necesario saber cómo resolverlo técnicamente.

---

## Paso 2

### Te propongo una solución

Se estudiará el problema y se propondrá:

* solución
* alcance
* precio
* plazo aproximado

---

## Paso 3

### Desarrollo

Una vez aceptado el presupuesto se desarrolla la solución.

---

## Paso 4

### Entrega

Se revisa el resultado y se realizan los ajustes incluidos en el presupuesto.

---

# 14. Condiciones económicas

Mostrar esta sección de forma sencilla, no como texto legal.

## Proyectos hasta 200 €

Pago al finalizar o según se acuerde.

## Proyectos superiores a 200 €

```text
50 % al comenzar
50 % al entregar
```

Las funcionalidades adicionales no incluidas en el presupuesto inicial se presupuestarán aparte.

---

# 15. Hosting y mantenimiento

La landing debe mencionar que existen opciones de alojamiento y mantenimiento.

No mostrar todavía una estructura contractual compleja.

## Concepto

El cliente puede:

* gestionar su propio alojamiento

o

* contratar alojamiento y mantenimiento gestionado

---

# 16. Planes previstos de mantenimiento

Preparar visualmente el código para poder añadir estos paquetes posteriormente.

No es obligatorio mostrar los tres planes desde la primera versión si genera demasiado ruido comercial.

## Sin mantenimiento

**0 €/mes**

El proyecto se entrega terminado.

Cambios posteriores se presupuestan aparte.

---

## Hosting básico

Precio orientativo futuro:

**5–10 €/mes**

o aproximadamente:

**60 €/año**

Puede incluir:

* alojamiento
* SSL
* monitorización
* backups básicos

---

## Mantenimiento

Precio orientativo futuro:

**15–20 €/mes**

Puede incluir:

* hosting
* SSL
* backups
* monitorización
* pequeñas actualizaciones
* soporte básico

Definir posteriormente los límites exactos.

No ofrecer soporte ilimitado.

---

# 17. Propiedad de dominios

Principio importante:

**El dominio será siempre propiedad del cliente.**

El dominio debe registrarse preferentemente utilizando una cuenta controlada por el propio cliente.

Joan podrá recibir permisos administrativos/técnicos cuando sea necesario.

Evitar registrar dominios de clientes permanentemente bajo una cuenta personal de Joan.

---

# 18. Hosting de clientes

A diferencia del dominio, el hosting podrá estar gestionado centralmente como servicio.

Arquitectura futura:

```text
VPS Joan APS
│
├── cliente A
├── cliente B
├── cliente C
└── cliente D
```

Posteriormente podrán separarse clientes importantes en:

* VPS diferentes
* IPs diferentes
* infraestructura específica

cuando la facturación o criticidad lo justifique.

---

# 19. Emails

Servicio preferido:

**Resend**

Posibles usos:

* formulario de contacto
* notificaciones
* correos transaccionales
* aplicaciones de clientes

No integrar necesariamente Resend en esta primera iteración si el backend actual ya dispone de otro mecanismo.

Preparar el código para que la implementación sea sustituible.

---

# 20. Formulario de contacto

Campos:

## Nombre

Obligatorio.

## Email

Obligatorio.

Validación de email.

## Teléfono

Opcional.

## Tipo de proyecto

Opciones:

```text
Página web
Automatización
Herramienta web
Otro
```

## Presupuesto aproximado

Opciones:

```text
Menos de 200 €
200–400 €
400–700 €
Más de 700 €
No lo sé todavía
```

## Descripción

Placeholder:

> Cuéntame brevemente qué necesitas o qué tarea quieres automatizar.

## Privacidad

Checkbox obligatorio:

> He leído y acepto la política de privacidad.

## Botón

Solicitar presupuesto

---

# 21. Endpoint del formulario

Preparar para utilizar:

```text
POST /api/contact
```

Payload:

```json
{
  "name": "",
  "email": "",
  "phone": "",
  "projectType": "",
  "budget": "",
  "message": ""
}
```

No almacenar datos sensibles innecesariamente.

---

# 22. Estados del formulario

Implementar estados:

```text
idle
sending
success
error
```

Mensajes sugeridos:

## Sending

Enviando solicitud...

## Success

Gracias. He recibido tu mensaje y contactaré contigo lo antes posible.

## Error

No se ha podido enviar el mensaje. Inténtalo de nuevo o contacta por WhatsApp.

---

# 23. Protección frente a spam

Implementar inicialmente:

* honeypot
* validación frontend
* validación backend
* rate limiting si ya existe infraestructura para ello

No utilizar CAPTCHA inicialmente.

Evitar introducir fricción innecesaria.

---

# 24. WhatsApp

Añadir botón flotante de WhatsApp.

Debe estar visible:

* escritorio
* móvil

Mensaje precargado:

> Hola, he visto tus servicios en joanaps.dev y me gustaría comentarte un proyecto.

No hardcodear el teléfono dentro del componente.

Utilizar:

* configuración
* variable de entorno

Ejemplo conceptual:

```text
WHATSAPP_PHONE
```

---

# 25. CTA final

## Título

¿Tienes una tarea que te gustaría simplificar?

## Texto

Cuéntame qué necesitas.

Te diré si puedo ayudarte y te propondré una solución sin compromiso.

## CTA principal

Hablar por WhatsApp

## CTA secundario

Enviar un mensaje

---

# 26. Preguntas frecuentes

## ¿Necesito saber de tecnología?

No.

Solo necesito que me expliques qué quieres conseguir o qué problema quieres resolver.

Yo me encargo de valorar la parte técnica.

---

## ¿Trabajas solo con empresas?

No.

También se pueden realizar proyectos para:

* autónomos
* asociaciones
* profesionales
* particulares

---

## ¿Puedo pedir algo que no aparece aquí?

Sí.

Los servicios mostrados son ejemplos.

Cualquier necesidad puede estudiarse individualmente.

---

## ¿Los precios son cerrados?

Los precios mostrados son orientativos.

Antes de comenzar cualquier proyecto se indicarán:

* alcance
* precio
* condiciones

---

## ¿Puedes mantener la aplicación después?

Sí.

El alojamiento, mantenimiento y futuras mejoras podrán contratarse por separado.

---

## ¿Tengo que contratar alojamiento contigo?

No.

El cliente podrá utilizar su propio hosting.

También podrá contratar alojamiento gestionado.

---

## ¿Quién es el propietario del dominio?

El cliente.

El dominio deberá permanecer bajo control del cliente siempre que sea posible.

---

# 27. Diseño

Estética:

* moderna
* limpia
* profesional
* cercana
* tecnológica sin parecer futurista
* minimalista

Evitar:

* exceso de animaciones
* degradados abusivos
* efectos visuales que dificulten lectura
* estética de agencia genérica
* exceso de iconos

---

# 28. Responsive

Diseñar mobile first.

Breakpoints según sistema actual del proyecto.

Debe funcionar correctamente en:

* móvil
* tablet
* portátil
* escritorio

---

# 29. Anchura

Contenido principal:

aproximadamente:

```text
max-width: 1200px
```

Con padding lateral apropiado.

---

# 30. Estructura visual

```text
Navbar

Hero

Introducción

Servicios
├── Web
├── Automatización
└── Herramienta web

Cómo trabajo

Precios y condiciones

Hosting / mantenimiento

FAQ

CTA final

Formulario

Footer
```

---

# 31. Navbar

Logo/texto:

**Joan APS**

Links:

```text
Servicios
Cómo trabajo
FAQ
Contacto
```

CTA:

**Pedir presupuesto**

Navbar sticky opcional si encaja con el diseño actual.

---

# 32. Footer

## Marca

Joan APS

## Descripción

Desarrollo web y automatización.

## Ubicación

Mallorca

## Links

```text
Aviso legal
Política de privacidad
Cookies
Contacto
```

## Copyright

```text
© 2026 Joan APS.
Todos los derechos reservados.
```

---

# 33. SEO

## Title

Desarrollo web y automatización en Mallorca | Joan APS

## Meta description

Desarrollo páginas web, automatizaciones y herramientas digitales para negocios, autónomos y profesionales. Soluciones sencillas y presupuestos claros.

## H1

Soluciones digitales sencillas para negocios y profesionales

---

# 34. SEO técnico

Añadir:

* canonical
* Open Graph
* Twitter Card si el proyecto ya lo utiliza
* metadata correcta
* estructura semántica
* headings ordenados

La URL canonical será:

```text
https://joanaps.dev/servicios
```

---

# 35. Accesibilidad

Cumplir como mínimo buenas prácticas:

* labels de formularios
* contraste
* navegación mediante teclado
* `aria-label` donde proceda
* focus visible
* alt en imágenes
* estructura HTML semántica

---

# 36. Rendimiento

Evitar dependencias innecesarias.

Priorizar:

* CSS
* SVG
* assets optimizados

Lazy loading de imágenes no críticas.

No incorporar librerías pesadas exclusivamente para pequeñas animaciones.

---

# 37. Componentización

Crear componentes reutilizables según arquitectura existente.

Ejemplo conceptual:

```text
ServicesPage

ServicesHero
ServicesIntro
ServicesCards
WorkProcess
PricingInfo
HostingInfo
ServicesFAQ
ContactCTA
ContactForm
ServicesFooter
```

No crear componentes artificialmente pequeños si no aportan reutilización o claridad.

---

# 38. Datos de servicios

No hardcodear cada tarjeta independientemente.

Definir modelo/configuración.

Ejemplo:

```typescript
interface Service {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  examples?: string[];
  cta: string;
}
```

Ejemplo conceptual:

```typescript
const services: Service[] = [
  {
    id: 'web',
    title: 'Web para negocio local',
    price: 'Desde 300 €',
    description: '...',
    features: [],
    cta: 'Quiero mi web'
  }
];
```

---

# 39. Analítica

Preparar abstracción:

```typescript
trackEvent(eventName, properties?)
```

No integrar obligatoriamente una plataforma concreta todavía.

Eventos mínimos:

```text
services_view

service_web_click

service_automation_click

service_tool_click

whatsapp_click

contact_form_start

contact_form_submit

contact_form_success

contact_form_error
```

---

# 40. Portfolio futuro

Diseñar las tarjetas y estructura para añadir posteriormente enlaces hacia demos.

Ejemplos futuros:

```text
/proyectos/web-negocio
/proyectos/control-horas
/proyectos/automatizacion
```

Las demos previstas serán:

## Demo 1

Web ficticia de negocio local.

## Demo 2

Aplicación de control de horas.

Funciones:

* login
* empezar trabajo
* parar trabajo
* calendario
* horas por día
* total mensual
* exportación

## Demo 3

Dashboard administrativo.

Estas demos no forman parte obligatoria de esta primera implementación salvo que ya existan.

---

# 41. Git y despliegue

La página deberá integrarse en el repositorio actual.

Flujo:

```text
desarrollo
    ↓
commit
    ↓
GitHub
    ↓
main
    ↓
deploy
```

No introducir un sistema de despliegue nuevo únicamente para esta página.

Respetar el deployment actual del proyecto.

---

# 42. Git branches

Codex deberá trabajar preferiblemente en una rama específica.

Ejemplo:

```text
feature/services-landing
```

No realizar cambios directamente en producción sin revisión.

---

# 43. Restricciones

Codex debe evitar:

* modificar funcionalidad existente sin necesidad
* cambiar el stack tecnológico
* actualizar dependencias masivamente
* sustituir sistemas de estilos globales
* modificar infraestructura ajena a `/servicios`
* añadir servicios cloud innecesarios
* añadir Cloudflare Proxy
* añadir Cloudflare Workers
* añadir Cloudflare Pages
* añadir dependencias pesadas

---

# 44. Criterios de aceptación

La tarea se considerará terminada cuando:

1. `joanaps.dev/servicios` sea accesible.
2. Funcione entrando directamente por URL.
3. Funcione tras refrescar.
4. Sea responsive.
5. Muestre los tres servicios.
6. Muestre precios.
7. Los CTA funcionen.
8. WhatsApp funcione.
9. El formulario valide correctamente.
10. El formulario tenga estados de envío.
11. Exista protección honeypot.
12. Metadata SEO sea correcta.
13. La página no rompa ninguna otra ruta existente.
14. Build de producción finalice sin errores.
15. No existan errores relevantes en consola.
16. Lighthouse no detecte problemas graves de accesibilidad o rendimiento.
17. Cloudflare permanezca en modo DNS only.
18. No se modifique innecesariamente la infraestructura actual.

---

# 45. Prioridad de implementación

## Fase 1

Landing visual completa.

## Fase 2

Routing y SEO.

## Fase 3

WhatsApp.

## Fase 4

Formulario.

## Fase 5

Backend del formulario si es necesario.

## Fase 6

Eventos de analítica.

## Fase 7

Revisión responsive y accesibilidad.

## Fase 8

Build y despliegue.

---

# 46. Instrucción final para Codex

Antes de comenzar:

1. Inspeccionar la estructura actual del proyecto.
2. Identificar framework, routing y sistema de estilos.
3. Identificar cómo está desplegado `joanaps.dev`.
4. Reutilizar los patrones existentes.
5. Evitar introducir arquitectura nueva sin necesidad.

Después implementar la landing completa en:

`/servicios`

Mantener los cambios centrados exclusivamente en esta funcionalidad.

Si existe alguna diferencia entre este documento y la arquitectura actual del proyecto, adaptar la implementación al proyecto existente conservando la intención funcional y visual del documento.

Al finalizar:

* ejecutar build
* corregir errores
* comprobar `/servicios`
* comprobar acceso directo
* comprobar refresh
* comprobar responsive
* comprobar formulario
* comprobar enlaces
* comprobar consola
* documentar brevemente los archivos modificados
