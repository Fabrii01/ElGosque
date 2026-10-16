// Espacios de imagen propia del portal. Cada uno se llena (en este orden de prioridad):
// 1) con la imagen subida desde el panel admin ("Editar Web Pública" → "Imágenes del sitio"),
// 2) con el archivo de public/imagenes/ (ver public/imagenes/LEEME.md),
// 3) si no hay ninguno, con una ilustración o ícono.
// Las imágenes subidas se guardan agrupadas en documentos de ajustes/ (máx. 1 MB cada uno).

export const DOCUMENTOS_IMAGEN = {
  imagenesSitio: 'Fotos principales',
  imagenesOrigen: 'Momentos de "El Ciclo de Vida" (inicio)',
};

export const ESPACIOS_IMAGEN = [
  { id: 'inicioPortada', documento: 'imagenesSitio', titulo: 'Portada del inicio', descripcion: 'Foto principal junto al título. Vertical (4:5).', archivo: '/imagenes/inicio/portada.jpg' },
  { id: 'inicioOrigen', documento: 'imagenesSitio', titulo: 'Origen (inicio)', descripcion: 'Junto a "El Ciclo de Vida". Horizontal (3:2).', archivo: '/imagenes/inicio/origen.jpg' },
  { id: 'inicioCafeteria', documento: 'imagenesSitio', titulo: 'Cafetería (inicio)', descripcion: 'Se usa si no hay fotos en la galería de la cafetería. Horizontal (4:3).', archivo: '/imagenes/inicio/cafeteria.jpg' },
  { id: 'trazabilidadPortada', documento: 'imagenesSitio', titulo: 'Portada de trazabilidad', descripcion: 'Foto de la portada de la página de trazabilidad. Vertical (4:5).', archivo: '/imagenes/trazabilidad/portada.jpg' },
  { id: 'momento1', documento: 'imagenesOrigen', titulo: 'Semilla y Cultivo', descripcion: 'Horizontal (4:3).', archivo: '/imagenes/origen/1-semilla-cultivo.jpg' },
  { id: 'momento2', documento: 'imagenesOrigen', titulo: 'Cosecha', descripcion: 'Horizontal (4:3).', archivo: '/imagenes/origen/2-cosecha.jpg' },
  { id: 'momento3', documento: 'imagenesOrigen', titulo: 'Fermentación', descripcion: 'Horizontal (4:3).', archivo: '/imagenes/origen/3-fermentacion.jpg' },
  { id: 'momento4', documento: 'imagenesOrigen', titulo: 'Lavado y Secado', descripcion: 'Horizontal (4:3).', archivo: '/imagenes/origen/4-lavado-secado.jpg' },
  { id: 'momento5', documento: 'imagenesOrigen', titulo: 'Tostado', descripcion: 'Horizontal (4:3).', archivo: '/imagenes/origen/5-tostado.jpg' },
  { id: 'momento6', documento: 'imagenesOrigen', titulo: 'Empaquetado', descripcion: 'Horizontal (4:3).', archivo: '/imagenes/origen/6-empaquetado.jpg' },
];

// Límite por imagen: las de un mismo documento deben caber juntas en 1 MB
export const maxCaracteresEspacio = (espacio) => {
  const delMismoDocumento = ESPACIOS_IMAGEN.filter(e => e.documento === espacio.documento).length;
  return Math.floor(950000 / delMismoDocumento);
};
