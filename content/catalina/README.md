# Portfolio de Catalina

Página integrada en el sitio estático Servicios: `dist/proyectos/catalina/`.
El apartado `dist/proyectos/` enlaza el portfolio desde la navegación de Servicios.

## Desarrollo y build

No necesita instalación de paquetes para construir el sitio. Requiere Python 3:

```sh
python scripts/build-catalina.py
python -m http.server 8000 --directory dist
```

Abrir `http://localhost:8000/proyectos/`. El build genera la portada y las 13
fichas con una plantilla compartida; los archivos resultantes están versionados.
El despliegue actual continúa publicando `dist` sin cambios de proveedor.
Se usa generación estática con la biblioteca estándar en lugar de introducir
Astro en una web que ya está realizada en HTML/CSS/JavaScript.

## Editar contenido

`projects.json` contiene una entidad por proyecto, su categoría, texto y lista
ordenada de imágenes con descripciones. La primera imagen es la portada.
Los años solo se incluyen cuando aparecen en el material. `images.json` registra
dimensiones, página del PDF y nombre del recurso extraído. Añadir imágenes a
`dist/proyectos/catalina/assets/`, actualizar el manifiesto y ejecutar el build.
Los estilos y el comportamiento están en `portfolio.css` y `portfolio.js`.

Las URLs canónicas parten de `https://joanaps.dev/servicios/proyectos/catalina/`;
ajustar `BASE` en el generador si se publica bajo otro prefijo. Los enlaces de
navegación y recursos son relativos, por lo que funcionan también en local.

## Material de origen

Leídos: `Documento_tecnico_portfolio_Catalina_v2.docx` y `Portofolio_Catalina.pdf`.
Se extraen las imágenes internas del PDF, no sus páginas completas. No se
distribuye el PDF original, que contiene teléfono y dirección.
Para repetir la extracción se necesitan `pypdf` y Pillow:

```sh
python scripts/extract-catalina.py /ruta/Portofolio_Catalina.pdf
python scripts/build-catalina.py
```

Se conserva la proporción y transparencia, con WebP de hasta 1800 px y versión
pequeña de hasta 640 px, sin ampliar originales. Algunos recursos (especialmente
Altavoz y Logo motero) tienen resolución limitada en el PDF; sustituirlos por
originales si están disponibles. No se reconstruyen imágenes.
La foto de presentación es de equipo y se identifica como tal. No se atribuye
una identidad individual sin confirmación. Se omiten las cocinas de las páginas
39–41 porque su asociación con Swarovski no es clara, así como fotogramas
repetidos de la página 7. Los renders educativos conservan su aviso de autoría.

## Verificación

Comprobar navegación directa y recarga de cada ficha, filtros, apertura del visor,
cierre con Escape/botón/exterior, foco de teclado y ausencia de desbordamiento
en móvil. Sin JavaScript todos los proyectos permanecen visibles y las imágenes
ampliables siguen siendo enlaces a los archivos originales.
