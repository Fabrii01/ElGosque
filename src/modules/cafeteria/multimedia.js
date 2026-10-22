// Validación de enlaces de video y mapas de la cafetería.
// Solo se aceptan sitios conocidos y https: estos enlaces terminan dentro de <iframe>/<video>.

const leerUrl = (texto) => {
  try {
    const url = new URL(String(texto).trim());
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;
const HOSTS_YOUTUBE = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'];
const EXTENSIONES_VIDEO = /\.(mp4|webm|mov|m4v)$/i;
const HOSTS_ARCHIVO_VIDEO = ['firebasestorage.googleapis.com', 'storage.googleapis.com'];

const idDeYoutube = (url) => {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
  if (url.pathname === '/watch') return url.searchParams.get('v');
  const [, tipo, id] = url.pathname.split('/');
  return ['shorts', 'embed', 'live'].includes(tipo) ? id : null;
};

// Devuelve { tipo: 'youtube', id, embed, miniatura, vertical } | { tipo: 'archivo', src } | null
export const interpretarVideo = (texto) => {
  const url = leerUrl(texto);
  if (!url) return null;

  if (HOSTS_YOUTUBE.includes(url.hostname)) {
    const id = idDeYoutube(url);
    if (!id || !ID_YOUTUBE.test(id)) return null;
    return {
      tipo: 'youtube',
      id,
      // youtube-nocookie: no deja cookies de seguimiento hasta que se reproduce
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      miniatura: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      vertical: url.pathname.startsWith('/shorts/'),
    };
  }

  if (EXTENSIONES_VIDEO.test(url.pathname) || HOSTS_ARCHIVO_VIDEO.includes(url.hostname)) {
    return { tipo: 'archivo', src: url.href };
  }
  return null;
};

// Miniatura automática: la de YouTube o, en videos de Cloudinary, el fotograma del segundo 1
// (Cloudinary genera la imagen al pedir el mismo enlace con "so_1" y extensión .jpg)
export const miniaturaAutomatica = (url) => {
  const video = interpretarVideo(url);
  if (!video) return null;
  if (video.tipo === 'youtube') return video.miniatura;
  const enlace = new URL(video.src);
  if (enlace.hostname !== 'res.cloudinary.com' || !enlace.pathname.includes('/video/upload/')) return null;
  enlace.pathname = enlace.pathname.replace('/video/upload/', '/video/upload/so_1/').replace(/\.[^./]+$/, '.jpg');
  return enlace.href;
};

// Archivos de video que se pueden subir desde el panel (Cloudinary)
export const TIPOS_VIDEO_SUBIBLES = ['video/mp4', 'video/webm'];
export const MAX_MB_VIDEO = 100;

export const validarArchivoVideo = (archivo) => {
  if (!archivo || !TIPOS_VIDEO_SUBIBLES.includes(archivo.type)) return 'El video debe ser un archivo .mp4 o .webm.';
  if (archivo.size > MAX_MB_VIDEO * 1024 * 1024) return `El video supera los ${MAX_MB_VIDEO} MB. Comprímelo antes de subirlo.`;
  return null;
};

// Acepta el código <iframe> de "Compartir > Insertar un mapa" de Google Maps o solo su src
export const interpretarMapaEmbebido = (texto) => {
  const entrada = String(texto || '').trim();
  if (!entrada) return null;
  const src = entrada.includes('<iframe') ? entrada.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] : entrada;
  const url = src && leerUrl(src.replace(/&amp;/g, '&'));
  if (!url) return null;
  const esGoogle = ['www.google.com', 'google.com', 'maps.google.com'].includes(url.hostname);
  return esGoogle && url.pathname.startsWith('/maps/embed') ? url.href : null;
};

// Enlace para abrir la ubicación en la app de Google Maps
export const interpretarEnlaceMaps = (texto) => {
  const url = leerUrl(texto);
  if (!url) return null;
  const hosts = ['maps.app.goo.gl', 'goo.gl', 'www.google.com', 'google.com', 'maps.google.com'];
  const valido = hosts.includes(url.hostname) && (url.hostname.endsWith('goo.gl') || url.pathname.startsWith('/maps'));
  return valido ? url.href : null;
};

// Mapa a mostrar: el insertado por el admin o, si no hay, uno generado desde la dirección
export const mapaParaMostrar = (ubicacion) => {
  const embebido = interpretarMapaEmbebido(ubicacion?.mapaEmbed);
  if (embebido) return embebido;
  const direccion = ubicacion?.direccion?.trim();
  return direccion ? `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&z=17&output=embed` : null;
};

// Botón "Cómo llegar": ruta en Google Maps hasta la dirección
export const enlaceComoLlegar = (ubicacion) => {
  const direccion = ubicacion?.direccion?.trim();
  if (direccion) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`;
  return interpretarEnlaceMaps(ubicacion?.enlaceMaps);
};
