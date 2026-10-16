# Imágenes propias del portal

> **Forma recomendada:** súbelas desde el **panel admin → "Editar Web Pública" → "Imágenes del sitio"**.
> Ahí se comprimen solas y tienen prioridad sobre los archivos de esta carpeta.
> Esta carpeta es una alternativa para quien edita el proyecto (por ejemplo, fotos en alta calidad).

Coloca aquí las fotos de El Gosque como **archivos normales**. La web las toma directamente
por su nombre; para cambiar una foto, reemplaza el archivo manteniendo el mismo nombre.
Si no hay imagen subida ni archivo, la página muestra una ilustración (no una imagen rota).

| Archivo | Dónde se ve | Formato recomendado |
|---|---|---|
| `inicio/portada.jpg` | Inicio: foto principal junto al título | Vertical 4:5, mín. 1200 × 1500 px |
| `inicio/origen.jpg` | Inicio: junto a "El Ciclo de Vida" | Horizontal 3:2, mín. 1500 × 1000 px |
| `inicio/cafeteria.jpg` | Inicio: sección de la cafetería (si no hay fotos subidas desde el panel) | Horizontal 4:3, mín. 1400 × 1050 px |
| `trazabilidad/portada.jpg` | Trazabilidad: foto de la portada | Vertical 4:5, mín. 1200 × 1500 px |
| `origen/1-semilla-cultivo.jpg` … `origen/6-empaquetado.jpg` | Inicio: los 6 momentos de "El Ciclo de Vida" (1-semilla-cultivo, 2-cosecha, 3-fermentacion, 4-lavado-secado, 5-tostado, 6-empaquetado) | Horizontal 4:3, mín. 1200 × 900 px |

Recomendaciones:
- Usa fotos reales y autorizadas por El Gosque (RN-11).
- Comprime las fotos antes de subirlas (idealmente menos de 400 KB cada una), por ejemplo con squoosh.app.
- Mantén la extensión `.jpg` o actualiza la ruta en `src/shared/imagenesSitio.js`.

Las imágenes de las 9 etapas de trazabilidad se configuran desde el panel admin (pestaña Trazabilidad)
con un enlace a la imagen; también pueden apuntar a esta carpeta, por ejemplo `/imagenes/trazabilidad/cosecha.jpg`.
