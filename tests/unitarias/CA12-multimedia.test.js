import { describe, it, expect } from 'vitest';
import {
  interpretarVideo, interpretarMapaEmbebido, interpretarEnlaceMaps, mapaParaMostrar, enlaceComoLlegar,
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
