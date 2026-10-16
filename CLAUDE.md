# CLAUDE.md — El Gosque Web

Contexto permanente del proyecto. Léelo primero; después consulta solo los archivos que la tarea necesite.
Última revisión contra el código: 2026-10-15 (commit `cb07b7f`).

## 1. Negocio y propósito

El Gosque produce y comercializa café orgánico de Amazonas (Perú) y tiene una cafetería en Trujillo. La promoción y los pedidos se hacían por recomendaciones y WhatsApp, sin un sistema centralizado.

La plataforma **no es solo una tienda**: integra portal institucional, catálogo, trazabilidad, clientes y solicitudes, administración de pedidos/pagos/envíos, dashboard de indicadores, asistente de IA y sección informativa de la cafetería.

Documento fuente de requerimientos: `Documento de requerimientos de software_Grupo05.docx` (v1.0, 27/08/2026). Usa sus códigos (`REQ-Fxx-yy`, `RN-xx`) al referirte a requisitos.

## 2. Tesis y metas de evaluación

Objetivo: determinar en qué medida la plataforma de trazabilidad y gestión comercial mejora la comercialización de café verde y tostado en El Gosque, Trujillo, 2026.

Metas (**objetivos a evaluar, NO resultados alcanzados**; nunca afirmes que se cumplieron sin medición real):

| Meta | Dato que habría que registrar para medirla |
|---|---|
| 9 variedades y su trazabilidad gestionadas | Docs en `productos` por variedad + etapas en `ajustes/trazabilidad` |
| Resumen de Solicitud de Pedido en < 2 min | Hoy **no se registra** tiempo de inicio/fin del flujo |
| 90 % integridad de datos de clientes y cantidades | Medidores en el dashboard (clientes y solicitudes) |
| 90 % de pedidos confirmados con comprobante y estado de envío | Medidor en el dashboard (`calcularIndicadores`) |
| Reportes del dashboard en < 5 min | El dashboard exporta CSV; el tiempo no se registra |
| IA estructura ≥ 80 % de solicitudes iniciales | Pedidos con `origen: 'Asistente IA'` vs. conversaciones iniciadas (las conversaciones **no se registran**) |

## 3. Tecnologías verificadas (`package.json`)

- **React 19** + **Vite 8** (`@vitejs/plugin-react`), JavaScript/JSX (sin TypeScript).
- **React Router 7** (`BrowserRouter`). `PanelAdmin` se carga con `React.lazy` (chunk aparte con Recharts).
- **Firebase 12**: Authentication (email/contraseña) y Cloud Firestore. `storage` se exporta pero **no se usa**: las imágenes se guardan en base64 en Firestore, comprimidas en el navegador con `shared/utils/imagenes.js` (`comprimirImagen`).
- **Recharts 3** para los gráficos del dashboard (paleta validada con el validador de dataviz: verde `#166534` + ámbar `#d97706`, ΔE daltonismo 14.7). Las barras usan `isAnimationActive={false}`.
- **Identidad del portal público** (inicio, trazabilidad; ver `tailwind.config.js`): colores `cafe-espresso #2a1d17`, `cafe-tostado #5b3a29`, `cafe-kraft #c9a27e`, `cafe-crema #f5efe4`, `cafe-leche #fbf8f2`, `cafe-cereza #a8432a` (acento), `cafe-selva #1e3a2b`, `cafe-hoja #3e6b35`, `cafe-mostaza #d9a441` (acento sobre oscuro), `cafe-arena #ead9bf` (cereza sobre arena solo en texto grande); fuentes `font-titulo` (Fraunces) y `font-cuerpo` (Work Sans), autoalojadas con `@fontsource-variable` (importadas en `main.jsx`). Estilo editorial: secciones numeradas (`EtiquetaSeccion`); **todo texto va dentro de tarjetas** (`bg-cafe-leche rounded-md shadow` con borde de color `border-t-8`/`border-l-8` verde o mostaza, o tarjetas verde selva/marrón); verde y marrón son los colores protagonistas; sin emojis; textura `.papel`. En grids, los hijos que contienen carruseles o barras desplazables necesitan `min-w-0` (si no, desbordan en celular). Contrastes verificados ≥ 5.2:1. **La identidad se aplica a toda la app** (portal, login, carrito, Mis pedidos, cafetería, asistente IA y panel admin): `body` usa `font-cuerpo`/`text-cafe-espresso`/`bg-cafe-crema`; no usar grises, verdes ni ámbar genéricos de Tailwind salvo en colores semánticos (rojo de error/eliminar y colores por estado de `colorEstado`); sin emojis decorativos. Gráficos: verde `#2f6b2f` + mostaza `#d9a441` (validados).
- **Tailwind CSS 3.4** vía PostCSS, colores `gosque-green`, `gosque-brown`, `gosque-light`. Utilidad propia `.scrollbar-hide` en `index.css`. `@tailwindcss/vite` (v4) está instalado pero no se usa.
- **IA: Google Gemini** (`@google/generative-ai`, modelo `"gemini-3.8-flash"`, confirmado), llamado desde el navegador con `systemInstruction`. La clave se pega localmente en `src/modules/asistente-ia/AsistenteIA.jsx`; en el repo queda `GEMINI_API_KEY = ""`.
- **WhatsApp**: enlace `wa.me` con mensaje preformateado (REQ-F06).
- **Base de datos: Firestore** (decisión confirmada; el documento de requerimientos aún dice MySQL).

## 4. Comandos

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo (Vite)
npm run build      # build de producción -> dist/
npm run lint       # ESLint
npm run preview    # sirve el build
```

- **No hay pruebas automatizadas** en el repo ni script `test`. La lógica pura (estadísticas, validaciones, solicitudes) se ha verificado con scripts de Node fuera del repo.
- Estado verificado el 2026-10-15: `lint` sin errores; `build` OK (chunk principal ~897 kB, `PanelAdmin` ~444 kB). ESLint usa `react-hooks` v7: evitar `setState` síncrono en efectos (usar `servicio().then(setX)` o una función async dentro del efecto).
- Windows no distingue mayúsculas: no crear `x.js` y `X.jsx` con el mismo nombre en una carpeta (el import se confunde).
- Reglas versionadas en **`firestore.rules`**; se publican copiándolas en Firebase Console > Firestore > Reglas (no hay Firebase CLI). Resumen: `usuarios` dueño/admin, registro solo como `cliente` con `aceptaPrivacidad == true` y `fechaRegistro == request.time`; `productos` y `cafeteria` lectura pública solo si `activo == true` (por eso las consultas públicas usan `where('activo','==',true)`), escritura admin; `productos` además permite borrar al admin; `ajustes` lectura pública, escritura admin; `pedidos` el cliente lee los suyos y crea solicitudes propias en `Pendiente` con campos de `hasOnly`; actualizar solo admin; nada se borra. Cualquier campo nuevo en un documento creado por clientes debe agregarse a `hasOnly`.

## 5. Estructura real

Arquitectura por módulos. **No existe `src/pages`** y no debe recrearse. Convención:
- `Pagina*.jsx` / `PanelAdmin.jsx`: componente de ruta que compone piezas de varios módulos; no accede a Firestore.
- `src/modules/<módulo>/`: `*Service.js` = único lugar con llamadas a Firebase; `use*.js` = hooks; `*.jsx` = UI; `*.js` en minúscula = reglas/cálculos puros.
- `src/shared/`: `constants.js`, `utils/fechas.js`, `utils/formato.js`, `utils/imagenes.js`, `utils/csv.js`, `components/Revelar.jsx` (aparición al desplazar, respeta reducir movimiento), `components/ImagenPropia.jsx` (imagen de archivo con respaldo si falta), `components/portal/` (GranoCafe, EtiquetaSeccion con prop `color`, SelloCircular, Ilustraciones: IlustracionCafetal/IlustracionTaza/IlustracionSaco), `imagenesSitio.js` (rutas de fotos propias), `hooks/useSeccionActiva.js` (scroll-spy), `hooks/useDesplazarAAncla.js` (rutas con #ancla). Animaciones CSS propias en `index.css` (`animacion-portada`, `animacion-aparecer`).
- Los hooks del admin reciben `habilitado` y viven en `PanelAdmin` para conservar el estado al cambiar de pestaña.

```
src/modules/
  inicio-sesion/          PaginaAcceso (/login), sesionService, usePerfilUsuario, useVerificarAdmin, FormInicioSesion
  registro-clientes/      registroService, FormRegistroCliente, AvisoPrivacidad (RN-15), clientesService, clientes (resumen e integridad), detalleCliente (ficha), useClientesAdmin, AdminClientes, ModalDetalleCliente
  trazabilidad/           PaginaTrazabilidad, trazabilidadService, useTrazabilidadPublica, useTrazabilidadAdmin, ProcesoTrazabilidad (línea de tiempo + índice fijo), ResumenTrazabilidad ("El Ciclo de Vida" del inicio: **6 momentos** de `momentosOrigen.js` con los textos originales; distinto de las **9 etapas** de Firestore que muestra /trazabilidad), CarruselEtapas (barra de recorrido + tarjeta del color de la fase; flechas, toque, deslizar, teclado ←→; `autoavance` con botón Pausar en el inicio), etapas (3 fases con color: campo/beneficio/planta), IconoEtapa, LeyendaFases, BeneficiosSalud, AdminTrazabilidad
  solicitud-pedido/       solicitudService (registro, códigos), solicitud (crearSolicitud/crearItemSolicitud compartidos con la IA), carritoStorage, whatsapp, useSolicitudPedido, ConfiguradorProducto, CarritoPedido, BotonVerPedido
  gestion-pedidos/        PaginaMisPedidos, TarjetaPedidoCliente, pedidosService, estadoPedido (transiciones, motivo, historial, filtros), preciosAcordados (REQ-F08-03), usePedidosAdmin, AdminPedidos, ModalGestionPedido, ProductosAcordados, GestionEstado, HistorialPedido
  pagos/                  pago (métodos, validarPago, tienePagoRegistrado), RegistroPago
  constancias/            RegistroConstancia (pedido.datosPago.constancia)
  envios/                 envio (modalidades, validarEnvio, tieneDatosEnvio), RegistroEnvio, DatosEnvioCliente
  entregas/               entrega (validarEntrega); sin datos propios de entrega
  catalogo/               productosService (incl. eliminarProducto), useProductosActivos ({productos, cargando}), useCatalogoAdmin, CatalogoProductos, AdminCatalogo, ModalEliminarProducto
  contenido-institucional/ PaginaInicio (/), FranjaSuperior (franja verde con WhatsApp), BarraNavegacion (menú móvil), Logotipo, imagenesSitioService + useImagenesSitio + useImagenesSitioAdmin + AdminImagenesSitio, CabeceraPortal (páginas secundarias), PiePagina, FranjaDatos, contenidoService, useContenidoInstitucional, useContenidoAdmin, HeroInstitucional, AdminContenido
  cafeteria/              PaginaCartaCafeteria (/productos-cafeteria: portada, Carta, Preparación, Galería, Visítanos), Seccion{Carta,Preparacion,Galeria,Visitanos}, EncabezadoSeccion, ReproductorVideo, VisorGaleria, multimedia (validación de enlaces), cafeteriaService, carta, usePaginaCafeteria, useCartaCafeteria (fotos para el inicio), useCafeteriaAdmin, useMultimediaCafeteriaAdmin, AdminCafeteria (sub-pestañas) + AdminCartaCafeteria/AdminGaleriaCafeteria/AdminVideosCafeteria/AdminUbicacionCafeteria, SeccionCafeteria
  dashboard/              PanelAdmin (/admin), estadisticas (BI puro), reportes (columnas CSV), useDashboardBI, DashboardBI, graficos/ (TarjetaKpi, TarjetaGrafico, GraficoColumnasMensual, GraficoBarrasHorizontales, GraficoVariedades, BarraProporcion, MedidorIndicador, TooltipGrafico, EtiquetaEje, colores)
  asistente-ia/           AsistenteIA, AvisoAsistenteIA, promptAsistente, solicitudIA
```

### Rutas (`src/App.jsx`)

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | PaginaInicio | Público (cotizar y asistente IA exigen sesión) |
| `/login` | PaginaAcceso | Público |
| `/trazabilidad` | PaginaTrazabilidad | Público |
| `/productos-cafeteria` | PaginaCartaCafeteria | Público (solo informativa, REQ-F13-04) |
| `/mis-pedidos` | PaginaMisPedidos | Redirige a `/login` sin sesión |
| `/admin` | PanelAdmin (lazy) | Rol `admin` (UI) + reglas de Firestore |

Pestañas del admin: Dashboard BI, Gestión de Pedidos, Clientes, Catálogo, Trazabilidad, Cafetería, Editar Web Pública. En celular se muestran como pestañas desplazables arriba.

**Imágenes propias del portal** (`src/shared/imagenesSitio.js`): 4 fotos principales (doc `ajustes/imagenesSitio`) + 6 momentos de "El Ciclo de Vida" (doc `ajustes/imagenesOrigen`); el límite por imagen depende de cuántas comparten documento (`maxCaracteresEspacio`). Prioridad: 1) subida desde el panel ("Editar Web Pública" → "Imágenes del sitio", documento `ajustes/imagenesSitio`, base64 comprimido con `comprimirImagenHasta`), 2) archivo en `public/imagenes/` (ver `LEEME.md`), 3) ilustración a color. `ImagenPropia` reintenta si cambia el `src`.

## 6. Modelo de datos en Firestore

- `usuarios/{uid}`: `nombre, negocio, ciudad, telefono, email, rol ('cliente'|'admin'), aceptaPrivacidad, fechaRegistro` (los dos últimos solo en registros nuevos). Admin se asigna manualmente.
- `productos/{id}`: `nombre` (variedad), `descripcion, tipo ('Tostado'|'Verde'), presentacion ('En grano'|'Molido'), peso (texto, fijo: el precio corresponde a ese peso), precioReferencial (string), imagenUrl (base64), activo`.
- `pedidos/{id}` — solicitudes y pedidos comparten colección (`Pendiente` = solicitud): `codigo, clienteId, clienteNombre, clienteEmail, telefono, ciudad, negocio, frecuencia, productos[{nombre, cantidad, peso, presentacion, precioUnitario (número), subtotal}], total, estado, origen?, fecha, historial[{estadoAnterior, estadoNuevo, fechaCambio, responsable, responsableId, motivo}], datosPago{metodo, monto, fecha, nroOperacion, constancia}, datosEnvio{modalidad, agencia, numeroGuia, fechaEnvio}, fechaActualizacion`.
- `cafeteria/{id}`: `nombre, categoria, descripcion, precio (número), imagenUrl, activo`.
- `ajustes/institucional`: `titulo, descripcion`. `ajustes/trazabilidad`: `region, etapas[{nombre, descripcion, img (URL)}]`. `ajustes/cafeteria`: `fotos[]` (base64, máx. 6, total < 950 000 caracteres; la primera es la portada). `ajustes/cafeteriaVideos`: `videos[{id, titulo, descripcion, url}]`. `ajustes/cafeteriaUbicacion`: `direccion, referencia, mapaEmbed (src validado), enlaceMaps, videoUrl`. Los videos son **enlaces** (YouTube, Shorts o archivo https .mp4/.webm/Firebase Storage); no se guardan en Firestore.

## 7. Flujos de negocio

1. **Registro/login**: Auth + doc `usuarios` con `rol: 'cliente'` y consentimiento obligatorio (checkbox + `AvisoPrivacidad`).
2. **Solicitud desde catálogo**: botón "Solicitar cotización" → configurador (presentación según tipo; peso fijo del producto; cantidad) → carrito en `localStorage` por uid, **sincronizado con el catálogo vigente** (precio/peso actuales; quita productos desactivados y avisa) → contacto (precargado del perfil) y frecuencia → `crearSolicitud()` → "Continuar por WhatsApp" con total **referencial**.
3. **Solicitud desde IA**: solo con sesión. Prompt de sistema con perfil, catálogo, trazabilidad y cafetería; prohíbe temas ajenos; pide confirmación antes de emitir `<<<SOLICITUD:{"productos":[{productoId,cantidad,presentacion}],"frecuencia"}>>>`. `solicitudIA.js` valida contra el catálogo y usa `crearSolicitud()` (precio del catálogo, peso del producto).
4. **Gestión admin** (`ModalGestionPedido`): validaciones en orden: transición → motivo → productos/precios acordados (editables solo en Pendiente/Vendido; no se confirma "Vendido" con total 0) → pago → envío → entrega. Total = suma de subtotales acordados.
5. **Consulta del cliente**: "Solicitudes en revisión" separadas de "Pedidos"; muestra motivo si fue Denegado/Cancelado.
6. **Dashboard BI**: periodos (todo, 30/90 días, año, mes, rango libre) con comparación contra el periodo anterior; KPIs (ingresos, ventas, ticket, unidades, clientes, conversión); ingresos por mes (cronológico, meses vacíos en 0); solicitudes por estado; variedades solicitadas vs. vendidas; grano vs. molido; canal web vs. IA; ventas por ciudad y por modalidad (S/, >8 categorías → "Otros"); top 10 clientes (por `clienteId`); tabla cliente × producto; indicadores de tesis con meta; exportación CSV (pedidos y cliente×producto). Cada gráfico tiene "Ver datos en tabla".

7. **Página de la cafetería**: secciones sin contenido (Preparación, Galería) se ocultan junto con su enlace del menú. Todo enlace de video/mapa pasa por `multimedia.js` (solo https y dominios permitidos: YouTube, Google Maps, Firebase/Google Storage o archivos de video) antes de usarse en `<iframe>`/`<video>`. Si no hay mapa insertado, se genera uno desde la dirección.

### Reglas de negocio implementadas
- **Estados**: Pendiente → Vendido | Denegado | Cancelado; Vendido → Pagado | Cancelado; Pagado → Enviado | Cancelado; Enviado → Entregado; finales: Entregado, Denegado, Cancelado. Sin pago contra entrega (confirmado).
- **Pagado**: medio, monto y fecha obligatorios; nro. de operación obligatorio en Yape, Plin y Transferencia (no en Efectivo ni Otro).
- **Enviado**: modalidad y fecha de despacho obligatorias. **Entregado**: solo desde Enviado.
- **Códigos**: `REQ-AAAAMMDD-XXXXXX` / `IA-REQ-…` (6 caracteres aleatorios criptográficos; colisión muy improbable, no imposible).
- **Indicadores** (`dashboard/estadisticas.js`, definiciones operativas propuestas, a validar con la tesis): respaldo de pedidos = ventas con pago registrado + comprobante (constancia o nro. operación) + datos de envío; integridad de clientes = 5 campos completos; integridad de solicitudes = teléfono, ciudad, negocio y cantidades válidas. Meta 90 %.

## 8. Estado de funcionalidades

**Implementado** (lint/build OK y lógica probada con Node; vistas revisadas en captura con datos de ejemplo; **no probado de punta a punta con Firebase real**): REQ-F01 a REQ-F13 salvo lo listado abajo, incluida la versión móvil (menú hamburguesa, panel admin con pestañas superiores).

**Parcial / pendiente:**
- **IA**: la clave de Gemini va en el bundle del front (decisión del usuario). La meta "IA estructura 80 % de solicitudes iniciales" no se puede medir: las conversaciones no se registran.
- Reglas: hay que **republicar `firestore.rules`** tras cada cambio (última versión: colección `cafeteria` y consentimiento en registro). No validan transiciones de estado.
- Historial: `fechaCambio` es la hora del navegador del admin (serverTimestamp no se permite en arrays).
- Constancia de pago = texto/URL; no se suben archivos (REQ-F09-03 cumplido como "referenciar").
- REQ-F04-02: no hay contenido audiovisual por variedad (solo imagen por etapa vía URL). REQ-F01-01: contenido institucional solo título y descripción.
- Sin datos propios de entrega (fecha de entrega, receptor). Sin medición del tiempo para armar una solicitud (meta < 2 min).
- Aviso de privacidad redactado a partir de RN-15: **pendiente de validación por El Gosque** (Ley 29733).
- Pruebas automatizadas en el repo.

**Contenido provisional (no presentar como real):**
- "Beneficios de salud" en `trazabilidad/BeneficiosSalud.jsx`: afirmaciones fijas sin fuente (RN-11).
- Horario de cafetería "Lun - Sáb 9:00 AM - 9:00 PM" confirmado como correcto.

## 9. Reglas de trabajo

- Responder en español claro; el usuario es estudiante de Ingeniería de Sistemas: explicar lo necesario para que aprenda, sin extenderse.
- Antes de cada tarea, leer solo los archivos relevantes; no re-analizar todo el proyecto.
- Antes de cambios importantes: explicar plan breve y archivos a modificar.
- Implementar solo lo pedido; sin funciones extra ni refactors generales sin autorización. No reemplazar funcionalidades por versiones simplificadas que pierdan comportamiento.
- Respetar arquitectura, convenciones (nombres en español, Tailwind con colores `gosque-*`) y estilo existentes; evitar duplicar lógica, consultas o componentes.
- No inventar archivos, funciones, dependencias ni comportamientos. Lo no deducible del repo se marca "pendiente de confirmar".
- No mostrar archivos completos si basta con explicar los cambios.
- Tras implementar: ejecutar `npm run build` y `npm run lint` (y pruebas si existen) y reportar resultados reales; si algo no se pudo comprobar, decirlo. Nunca afirmar que funciona sin verificarlo.
- Al terminar: resumir qué cambió, qué se verificó y qué queda pendiente.
- Tareas grandes: dividir en etapas pequeñas y verificables.
- No eliminar datos, colecciones, archivos, dependencias o funcionalidades sin consultar.
- IA y dashboard: no inventar productos, cantidades, pedidos, estados, pagos ni cifras; usar datos reales del sistema y cálculos verificables. La IA no fija precios, no confirma ventas/pagos ni cambia estados (RN-13).
- Trazabilidad: no presentar datos ficticios como registros reales.

## 10. Seguridad

- No leer ni mostrar valores de `.env` ni de credenciales. `.env` está en `.gitignore` (no versionado).
- La config web de Firebase está embebida en `src/firebase.js` (es pública por diseño en Firebase, pero la seguridad real depende de las reglas de Firestore/Auth, hoy abiertas).
- No subir al repo la clave de Gemini: el usuario la pega localmente en `src/modules/asistente-ia/AsistenteIA.jsx`.
- Nunca poner claves de API privadas (Gemini u otras) en código del front ni en el repo.
- Cuando una tarea toque datos de clientes o administración, revisar/proponer reglas de Firestore; validar en reglas, no solo en la UI.
- No cambiar configuración de producción (proyecto Firebase `el-gosque-app`) sin autorización.
