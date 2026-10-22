import { describe, it, expect } from 'vitest';
import {
  interpretarVideo, interpretarMapaEmbebido, interpretarEnlaceMaps, mapaParaMostrar, enlaceComoLlegar, validarArchivoVideo, miniaturaAutomatica,
} from '../../src/modules/cafeteria/multimedia';

// CA12 - Videos y mapas de la cafetería (multimedia.js) | REQ-F04-02, REQ-F13-03, REQ-F13-04, REQ-F13-05
const DIRECCION = 'Av. España 123, Trujillo';

describe('CA12 - Videos y mapas de la cafetería (multimedia.js)', () => {
  it('1.0 [+] Archivo de video', () => {
    const enlace = 'https://firebasestorage.googleapis.com/v0/b/x/o/preparacion.mp4';
    expect(interpretarVideo(enlace)).toEqual({ tipo: 'archivo', src: enlace });
  });

  it('2.0 [–] Enlace sin https', () => {
    expect(interpretarVideo('http:/www.com')).toBeNull();
  });

  it('3.0 [–] Sitio no autorizado, texto inválido o vacío', () => {
    expect(interpretarVideo('https://vimeo.com/123')).toBeNull();
    expect(interpretarVideo('video//no valido')).toBeNull();
    expect(interpretarVideo('')).toBeNull();
  });

  it('4.0 [–] Identificador de YouTube inválido', () => {
    expect(interpretarVideo('https://youtu.be/abc')).toBeNull();
  });

  it('5.0 [+] Mapa a partir del código iframe de Google Maps', () => {
    expect(interpretarMapaEmbebido('<iframe src="https://www.google.com/maps/embed?pb=ABC"></iframe>'))
      .toBe('https://www.google.com/maps/embed?pb=ABC');
  });

  it('6.0 [–] Mapa de un sitio distinto de Google Maps', () => {
    expect(interpretarMapaEmbebido('<iframe src="https://sitio-malicioso.com/maps/embed"></iframe>')).toBeNull();
    expect(interpretarMapaEmbebido('')).toBeNull();
  });

  it('7.0 [+] Enlace corto de Google Maps', () => {
    expect(interpretarEnlaceMaps('https://maps.app.goo.gl/abc123')).toBe('https://maps.app.goo.gl/abc123');
  });

  it('8.0 [–] Enlace que no es de Google Maps', () => {
    expect(interpretarEnlaceMaps('https://example.com/maps')).toBeNull();
  });

  it('9.0 [+] Mapa generado desde la dirección', () => {
    expect(mapaParaMostrar({ direccion: DIRECCION, mapaEmbed: '' }))
      .toBe('https://maps.google.com/maps?q=Av.%20Espa%C3%B1a%20123%2C%20Trujillo&z=17&output=embed');
  });

  it('10.0 [–] Ubicación sin dirección ni mapa', () => {
    expect(mapaParaMostrar({})).toBeNull();
  });

  it('11.0 [+] Botón «Cómo llegar»', () => {
    expect(enlaceComoLlegar({ direccion: DIRECCION }))
      .toBe('https://www.google.com/maps/dir/?api=1&destination=Av.%20Espa%C3%B1a%20123%2C%20Trujillo');
  });

  it('12.0 [–] «Cómo llegar» sin dirección ni enlace', () => {
    expect(enlaceComoLlegar({ direccion: '   ' })).toBeNull();
  });
});

// Ampliación posterior al plan: videos subidos desde el panel (Cloudinary)
describe('Ampliación CA12 - Archivo de video para subir', () => {
  const archivo = (type, mb) => ({ type, size: mb * 1024 * 1024 });

  it('[+] Video .mp4 de 20 MB', () => {
    expect(validarArchivoVideo(archivo('video/mp4', 20))).toBeNull();
  });

  it('[–] Formato no permitido o archivo que no es video', () => {
    expect(validarArchivoVideo(archivo('video/quicktime', 20))).toBe('El video debe ser un archivo .mp4 o .webm.');
    expect(validarArchivoVideo(archivo('image/png', 1))).toBe('El video debe ser un archivo .mp4 o .webm.');
  });

  it('[–] Video de más de 100 MB', () => {
    expect(validarArchivoVideo(archivo('video/webm', 101))).toBe('El video supera los 100 MB. Comprímelo antes de subirlo.');
  });

  it('[+] El enlace que devuelve Cloudinary se reproduce como archivo directo', () => {
    const enlace = 'https://res.cloudinary.com/ukht0909/video/upload/v1761000000/cafeteria/videos/metodo-v60.mp4';
    expect(interpretarVideo(enlace)).toEqual({ tipo: 'archivo', src: enlace });
  });
});

// Ampliación posterior al plan: miniatura automática de los videos
describe('Ampliación CA12 - Miniatura automática', () => {
  it('[+] Video de Cloudinary: fotograma del segundo 1 en .jpg', () => {
    expect(miniaturaAutomatica('https://res.cloudinary.com/ukht0909/video/upload/v1761000000/cafeteria/videos/metodo-v60.mp4'))
      .toBe('https://res.cloudinary.com/ukht0909/video/upload/so_1/v1761000000/cafeteria/videos/metodo-v60.jpg');
  });

  it('[+] Video de YouTube: su miniatura oficial', () => {
    expect(miniaturaAutomatica('https://youtu.be/dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('[–] Otro archivo de video o enlace inválido: sin miniatura automática', () => {
    expect(miniaturaAutomatica('https://firebasestorage.googleapis.com/v0/b/x/o/preparacion.mp4')).toBeNull();
    expect(miniaturaAutomatica('no es un enlace')).toBeNull();
  });
});
